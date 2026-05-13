import { Request, Response } from 'express';
import * as svc from './builder.service';

const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ ok: true, data });

export const getCatalogue = async (_req: Request, res: Response) => {
  ok(res, { sections: await svc.listCatalogue() });
};

export const syncCatalogue = async (_req: Request, res: Response) => {
  ok(res, await svc.syncCatalogue());
};

export const createPage = async (req: Request, res: Response) => {
  const page = await svc.createPage(req.body);
  ok(res, { page }, 201);
};

export const getPage = async (req: Request, res: Response) => {
  const page = await svc.getPage(req.params.slug);
  ok(res, { page });
};

export const updatePage = async (req: Request, res: Response) => {
  const page = await svc.updatePage(req.params.slug, req.body);
  ok(res, { page });
};

export const reorder = async (req: Request, res: Response) => {
  const page = await svc.reorderLayout(req.params.slug, req.body);
  ok(res, { layout: page.draftLayout, isDirty: page.isDirty });
};

export const addSection = async (req: Request, res: Response) => {
  const { page, instance } = await svc.addSection(req.params.slug, req.body);
  ok(res, { instance, layout: page.draftLayout }, 201);
};

export const deleteSection = async (req: Request, res: Response) => {
  const page = await svc.deleteSection(req.params.slug, req.params.instanceId);
  ok(res, { layout: page.draftLayout });
};

export const patchSection = async (req: Request, res: Response) => {
  const { page, instance } = await svc.patchSection(
    req.params.slug,
    req.params.instanceId,
    req.body,
  );
  ok(res, { instance, isDirty: page.isDirty });
};

export const duplicateSection = async (req: Request, res: Response) => {
  const { page, instance } = await svc.duplicateSection(req.params.slug, req.params.instanceId);
  ok(res, { instance, layout: page.draftLayout }, 201);
};

export const save = async (req: Request, res: Response) => {
  const { page, revision } = await svc.savePage(req.params.slug, req.body);
  ok(res, {
    revisionId: revision._id,
    version: revision.version,
    kind: revision.kind,
    isDirty: page.isDirty,
    lastSavedAt: page.lastSavedAt,
  });
};

export const publish = async (req: Request, res: Response) => {
  const { page, revision } = await svc.publishPage(req.params.slug, req.query as { force?: boolean });
  ok(res, {
    revisionId: revision._id,
    version: page.version,
    status: page.status,
    isDirty: page.isDirty,
    lastPublishedAt: page.lastPublishedAt,
  });
};

export const revert = async (req: Request, res: Response) => {
  const page = await svc.revertToPublished(req.params.slug);
  ok(res, { page });
};

export const discardDraft = async (req: Request, res: Response) => {
  const page = await svc.discardDraft(req.params.slug);
  ok(res, { page });
};

export const status = async (req: Request, res: Response) => {
  ok(res, await svc.getStatus(req.params.slug));
};

export const listRevisions = async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  ok(res, { revisions: await svc.listRevisions(req.params.slug, limit) });
};

export const getRevision = async (req: Request, res: Response) => {
  const rev = await svc.getRevision(req.params.slug, req.params.revId);
  ok(res, { revision: rev });
};

export const restoreRevision = async (req: Request, res: Response) => {
  const page = await svc.restoreRevision(req.params.slug, req.params.revId);
  ok(res, { layout: page.draftLayout, isDirty: page.isDirty });
};

export const previewToken = async (req: Request, res: Response) => {
  // No security yet — return a stub token + payload reference. The iframe can
  // call /api/v1/preview/pages/:slug/preview-payload directly without it.
  ok(res, {
    token: `dev-token-${req.params.slug}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
};
