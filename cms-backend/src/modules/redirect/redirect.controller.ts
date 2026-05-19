import { Request, Response } from 'express';
import * as svc from './redirect.service';
import { RedirectDoc } from '../../models/Redirect';

function serialize(r: RedirectDoc) {
  return {
    fromSlug: r.fromSlug,
    toSlug: r.toSlug,
    statusCode: r.statusCode,
    reason: r.reason,
    note: r.note,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function list(_req: Request, res: Response) {
  const redirects = await svc.listRedirects();
  res.json({ ok: true, data: { redirects } });
}

export async function create(req: Request, res: Response) {
  const r = await svc.createRedirect(req.body);
  res.status(201).json({ ok: true, data: { redirect: serialize(r) } });
}

export async function update(req: Request, res: Response) {
  const r = await svc.updateRedirect(req.params.slug, req.body);
  res.json({ ok: true, data: { redirect: serialize(r) } });
}

export async function remove(req: Request, res: Response) {
  await svc.deleteRedirect(req.params.slug);
  res.json({ ok: true, data: { deleted: true } });
}
