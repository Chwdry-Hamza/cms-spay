import { Request, Response } from 'express';
import * as svc from './contentPage.service';

function serialize(page: Awaited<ReturnType<typeof svc.getContentPage>>) {
  return {
    slug: page.slug,
    title: page.title,
    footerLabel: page.footerLabel,
    showInFooter: page.showInFooter,
    status: page.status,
    isDirty: page.isDirty,
    effectiveDate: page.effectiveDate,
    lastUpdated: page.lastUpdated,
    seoTitle: page.seoTitle ?? null,
    seoDescription: page.seoDescription ?? null,
    seoKeywords: page.seoKeywords ?? null,
    ogImage: page.ogImage ?? null,
    noindex: page.noindex ?? false,
    draftBlocks: page.draftBlocks,
    publishedBlocks: page.publishedBlocks,
    tags: page.tags ?? [],
    version: page.version,
    lastSavedAt: page.lastSavedAt,
    lastPublishedAt: page.lastPublishedAt,
    scheduledPublishAt: page.scheduledPublishAt ?? null,
    updatedAt: page.updatedAt,
  };
}

export async function list(_req: Request, res: Response) {
  const pages = await svc.listContentPages();
  res.json({ ok: true, data: { pages } });
}

export async function get(req: Request, res: Response) {
  const page = await svc.getContentPage(req.params.slug);
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function create(req: Request, res: Response) {
  const page = await svc.createContentPage(req.body);
  res.status(201).json({ ok: true, data: { page: serialize(page) } });
}

export async function update(req: Request, res: Response) {
  const page = await svc.updateContentPage(req.params.slug, req.body);
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function publish(req: Request, res: Response) {
  const page = await svc.publishContentPage(req.params.slug);
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function discard(req: Request, res: Response) {
  const page = await svc.discardContentPageDraft(req.params.slug);
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function schedulePublish(req: Request, res: Response) {
  const page = await svc.schedulePublishContentPage(
    req.params.slug,
    new Date(req.body.publishAt),
  );
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function cancelSchedule(req: Request, res: Response) {
  const page = await svc.cancelScheduledPublish(req.params.slug);
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function listRevisions(req: Request, res: Response) {
  const revisions = await svc.listContentPageRevisions(req.params.slug);
  res.json({ ok: true, data: { revisions } });
}

export async function restoreRevision(req: Request, res: Response) {
  const page = await svc.restoreContentPageRevision(
    req.params.slug,
    req.params.revId,
  );
  res.json({ ok: true, data: { page: serialize(page) } });
}

export async function remove(req: Request, res: Response) {
  // Backlink-aware delete: by default refuses if other pages link here.
  // Accepts query params:
  //   - redirectTo=newSlug → also creates a 308 from this slug to newSlug
  //   - force=true → admin override, lets backlinks 404
  const redirectTo =
    typeof req.query.redirectTo === 'string' && req.query.redirectTo.length > 0
      ? req.query.redirectTo
      : null;
  const force = req.query.force === 'true' || req.query.force === '1';
  const result = await svc.deleteContentPageSafely(req.params.slug, {
    redirectTo,
    force,
  });
  res.json({ ok: true, data: result });
}

export async function listBacklinks(req: Request, res: Response) {
  const backlinks = await svc.listContentPageBacklinks(req.params.slug);
  res.json({ ok: true, data: { backlinks } });
}

export async function rewriteInternalLinks(req: Request, res: Response) {
  const summary = await svc.rewriteInternalLinks(
    req.body.fromSlug,
    req.body.toSlug,
  );
  res.json({
    ok: true,
    data: {
      rewritten: summary,
      totalPages: summary.length,
      totalReplacements: summary.reduce((acc, r) => acc + r.replacements, 0),
    },
  });
}

export async function listTags(_req: Request, res: Response) {
  const tags = await svc.listAllContentPageTags();
  res.json({ ok: true, data: { tags } });
}

export async function listRelated(req: Request, res: Response) {
  const limit =
    typeof req.query.limit === 'string'
      ? Math.max(1, Math.min(50, Number(req.query.limit) || 8))
      : 8;
  const related = await svc.listRelatedContentPages(req.params.slug, limit);
  res.json({ ok: true, data: { related } });
}
