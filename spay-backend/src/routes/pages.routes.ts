import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';

import { Page } from '../models/Page';
import { Redirect } from '../models/Redirect';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { listQuerySchema, buildSort } from '../schemas/common.schema';
import { pageCreateSchema, pageUpdateSchema } from '../schemas/page.schema';
import { triggerRevalidate, triggerContentRevalidate } from '../services/revalidate.service';
import { recordRevision } from '../services/revisions.service';
import { logger } from '../utils/logger';

function describePageChange(before: any, after: any): string {
  const parts: string[] = [];
  if (before.slug !== after.slug)     parts.push(`Slug ${before.slug} → ${after.slug}`);
  if (before.status !== after.status) parts.push(`Status ${before.status} → ${after.status}`);
  if (before.title !== after.title)   parts.push(`Title renamed`);
  if (JSON.stringify(before.content) !== JSON.stringify(after.content)) parts.push(`Content edited`);
  if (JSON.stringify(before.seo) !== JSON.stringify(after.seo))         parts.push(`SEO updated`);
  return parts.length ? parts.join(' · ') : 'Saved';
}

export const pageRoutes = Router();

// All page routes require auth (the website uses /api/public for reads).
pageRoutes.use(authRequired);

/** GET /api/pages — list with search, filter, sort, paginate */
pageRoutes.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { q, status, sort, page, limit } = req.query as unknown as z.infer<typeof listQuerySchema>;
    const filter: any = {};
    if (status) filter.status = { $in: status.split(',') };
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { slug:  new RegExp(q, 'i') },
      { excerpt: new RegExp(q, 'i') },
    ];

    const [items, total] = await Promise.all([
      Page.find(filter).sort(buildSort(sort)).skip((page - 1) * limit).limit(limit).lean(),
      Page.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

/** GET /api/pages/:id */
pageRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const page = await Page.findById(req.params.id)
      .populate('featuredImage', 'name url alt variants width height')
      .lean();
    if (!page) throw ApiError.notFound('Page not found');
    res.json(page);
  })
);

/** Ensures a page slug always starts with '/'. Keeps "/" intact for the home page. */
function normalizePageSlug(raw: string | undefined, fallbackTitle: string): string {
  const base = (raw ?? '').trim() || slugify(fallbackTitle, { lower: true, strict: true });
  if (!base) return '/';
  // collapse leading slashes, then re-add exactly one
  const stripped = base.replace(/^\/+/, '');
  return '/' + stripped;
}

/** POST /api/pages */
pageRoutes.post(
  '/',
  validate(pageCreateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof pageCreateSchema>;
    const slug = normalizePageSlug(body.slug, body.title);

    const existing = await Page.findOne({ slug });
    if (existing) throw ApiError.conflict(`Slug "${slug}" is already taken`);

    const page = await Page.create({
      ...body,
      slug,
      authorName: req.user?.email ?? 'system',
      publishedAt: body.status === 'published' ? new Date() : undefined,
    });

    triggerContentRevalidate(['/', slug], 'page');
    res.status(201).json(page);
  })
);

/** PUT /api/pages/:id */
pageRoutes.put(
  '/:id',
  validate(pageUpdateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof pageUpdateSchema>;
    const existing = await Page.findById(req.params.id);
    if (!existing) throw ApiError.notFound('Page not found');

    // Normalize slug to always start with '/'
    if (body.slug !== undefined) {
      body.slug = normalizePageSlug(body.slug, body.title ?? existing.title);
    }

    if (body.slug && body.slug !== existing.slug) {
      const conflict = await Page.findOne({ slug: body.slug });
      if (conflict) throw ApiError.conflict(`Slug "${body.slug}" is already taken`);
    }

    const beforeSlug = existing.slug;
    const wasPublished = existing.status === 'published';
    const beforeSnapshot = existing.toObject();

    Object.assign(existing, body);
    // Mixed fields need an explicit modified flag so nested changes persist.
    if (body.sections !== undefined) existing.markModified('sections');
    if (body.content !== undefined) existing.markModified('content');
    if (body.status === 'published' && !existing.publishedAt) {
      existing.publishedAt = new Date();
    }
    await existing.save();

    // Snapshot the PREVIOUS state so the user can roll back to it.
    recordRevision({
      entityType: 'page',
      entityId: String(existing._id),
      snapshot: beforeSnapshot,
      label: describePageChange(beforeSnapshot, existing.toObject()),
      authorEmail: req.user?.email,
    });

    // When the slug changes, automatically create a 301 redirect from the
    // old URL to the new one so existing links + search rankings survive.
    if (beforeSlug && beforeSlug !== existing.slug && beforeSlug !== '/') {
      try {
        await Redirect.findOneAndUpdate(
          { from: beforeSlug },
          { $set: { from: beforeSlug, to: existing.slug } },
          { upsert: true, setDefaultsOnInsert: true }
        );
        logger.info(`[pages] auto-redirect ${beforeSlug} → ${existing.slug}`);
      } catch (err) {
        logger.warn(`[pages] failed to auto-create redirect for ${beforeSlug}`, err);
      }
    }

    // revalidate old and new paths in case slug or status changed
    const paths = new Set<string>(['/', existing.slug]);
    if (beforeSlug !== existing.slug) paths.add(beforeSlug);
    if (wasPublished || existing.status === 'published') triggerContentRevalidate(Array.from(paths), 'page');

    res.json(existing.toObject());
  })
);

/** DELETE /api/pages/:id */
pageRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) throw ApiError.notFound('Page not found');
    triggerContentRevalidate(['/', `/${page.slug.replace(/^\//, '')}`], 'page');
    res.json({ ok: true });
  })
);

/** POST /api/pages/:id/duplicate */
pageRoutes.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const original = await Page.findById(req.params.id).lean();
    if (!original) throw ApiError.notFound('Page not found');

    const { _id, createdAt, updatedAt, publishedAt, ...rest } = original as any;
    const baseSlug = `${original.slug}-copy`;
    let slug = baseSlug;
    let i = 1;
    while (await Page.findOne({ slug })) slug = `${baseSlug}-${++i}`;

    const dup = await Page.create({
      ...rest,
      title: `${original.title} (copy)`,
      slug,
      status: 'draft',
      publishedAt: undefined,
    });

    res.status(201).json(dup);
  })
);
