import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';

import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { Redirect } from '../models/Redirect';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { listQuerySchema, buildSort } from '../schemas/common.schema';
import { postCreateSchema, postUpdateSchema } from '../schemas/post.schema';
import { triggerRevalidate, triggerContentRevalidate } from '../services/revalidate.service';
import { recordRevision } from '../services/revisions.service';
import { logger } from '../utils/logger';

/** Walk a Tiptap doc and collect all text nodes' content into one string. */
function tiptapText(node: any): string {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) return node.content.map(tiptapText).join(' ');
  return '';
}

/** Estimate reading time in minutes from a Tiptap doc + excerpt (≈225 wpm, min 1). */
function computeReadTime(content: any, excerpt = ''): number {
  const text = `${tiptapText(content)} ${excerpt}`.trim();
  if (!text) return 0;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 225));
}

function describePostChange(before: any, after: any): string {
  const parts: string[] = [];
  if (before.slug !== after.slug)             parts.push(`Slug ${before.slug} → ${after.slug}`);
  if (before.status !== after.status)         parts.push(`Status ${before.status} → ${after.status}`);
  if (before.title !== after.title)           parts.push(`Title renamed`);
  if (before.categoryName !== after.categoryName) parts.push(`Category changed`);
  if (JSON.stringify(before.content) !== JSON.stringify(after.content)) parts.push(`Content edited`);
  if (JSON.stringify(before.seo) !== JSON.stringify(after.seo))         parts.push(`SEO updated`);
  return parts.length ? parts.join(' · ') : 'Saved';
}

export const postRoutes = Router();
postRoutes.use(authRequired);

postRoutes.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { q, status, category, sort, page, limit } = req.query as unknown as z.infer<typeof listQuerySchema>;
    const filter: any = {};
    if (status)   filter.status = { $in: status.split(',') };
    if (category) filter.category = { $in: category.split(',') };
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { slug:  new RegExp(q, 'i') },
      { excerpt: new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') },
    ];

    const [items, total] = await Promise.all([
      Post.find(filter).sort(buildSort(sort)).skip((page - 1) * limit).limit(limit).populate('category', 'name slug color').lean(),
      Post.countDocuments(filter),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  })
);

postRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
      .populate('category', 'name slug color')
      .populate('coverMedia', 'name url alt variants width height')
      .lean();
    if (!post) throw ApiError.notFound('Post not found');
    res.json(post);
  })
);

postRoutes.post(
  '/',
  validate(postCreateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof postCreateSchema>;
    const slug = body.slug?.trim() || slugify(body.title, { lower: true, strict: true });

    const existing = await Post.findOne({ slug });
    if (existing) throw ApiError.conflict(`Slug "${slug}" is already taken`);

    let categoryName = '';
    if (body.category) {
      const cat = await Category.findById(body.category);
      if (!cat) throw ApiError.badRequest('Category not found');
      categoryName = cat.name;
      await Category.findByIdAndUpdate(cat._id, { $inc: { postCount: 1 } });
    }

    const post = await Post.create({
      ...body,
      slug,
      categoryName,
      readTime: computeReadTime(body.content, body.excerpt),
      authorName: req.user?.email ?? 'system',
      publishedAt: body.status === 'published' ? new Date() : undefined,
    });

    triggerContentRevalidate(['/blog', `/blog/${slug}`], 'post');
    res.status(201).json(post);
  })
);

postRoutes.put(
  '/:id',
  validate(postUpdateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof postUpdateSchema>;
    const existing = await Post.findById(req.params.id);
    if (!existing) throw ApiError.notFound('Post not found');

    if (body.slug && body.slug !== existing.slug) {
      const conflict = await Post.findOne({ slug: body.slug });
      if (conflict) throw ApiError.conflict(`Slug "${body.slug}" is already taken`);
    }

    const beforeSlug = existing.slug;
    const beforeCat = existing.category?.toString();

    let newCategoryName: string | undefined;
    if (body.category && body.category !== beforeCat) {
      const cat = await Category.findById(body.category);
      if (!cat) throw ApiError.badRequest('Category not found');
      newCategoryName = cat.name;
      await Category.findByIdAndUpdate(cat._id, { $inc: { postCount: 1 } });
      if (beforeCat) await Category.findByIdAndUpdate(beforeCat, { $inc: { postCount: -1 } });
    }

    const beforeSnapshot = existing.toObject();

    Object.assign(existing, body);
    if (newCategoryName !== undefined) existing.categoryName = newCategoryName;
    if (body.status === 'published' && !existing.publishedAt) {
      existing.publishedAt = new Date();
    }
    // Recompute reading time whenever content or excerpt changes
    if (body.content !== undefined || body.excerpt !== undefined) {
      existing.readTime = computeReadTime(existing.content, existing.excerpt);
    }
    await existing.save();

    recordRevision({
      entityType: 'post',
      entityId: String(existing._id),
      snapshot: beforeSnapshot,
      label: describePostChange(beforeSnapshot, existing.toObject()),
      authorEmail: req.user?.email,
    });

    // Auto-create 301 redirect when the post slug changes
    if (beforeSlug && beforeSlug !== existing.slug) {
      const fromPath = `/blog/${beforeSlug}`;
      const toPath = `/blog/${existing.slug}`;
      try {
        await Redirect.findOneAndUpdate(
          { from: fromPath },
          { $set: { from: fromPath, to: toPath } },
          { upsert: true, setDefaultsOnInsert: true }
        );
        logger.info(`[posts] auto-redirect ${fromPath} → ${toPath}`);
      } catch (err) {
        logger.warn(`[posts] failed to auto-create redirect for ${fromPath}`, err);
      }
    }

    const paths = new Set<string>(['/blog', `/blog/${existing.slug}`]);
    if (beforeSlug !== existing.slug) paths.add(`/blog/${beforeSlug}`);
    triggerContentRevalidate(Array.from(paths), 'post');

    res.json(existing.toObject());
  })
);

postRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) throw ApiError.notFound('Post not found');
    if (post.category) {
      await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
    }
    triggerContentRevalidate(['/blog', `/blog/${post.slug}`], 'post');
    res.json({ ok: true });
  })
);
