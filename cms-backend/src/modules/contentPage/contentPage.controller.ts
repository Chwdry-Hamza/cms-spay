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
  await svc.deleteContentPage(req.params.slug);
  res.json({ ok: true, data: { deleted: true } });
}
