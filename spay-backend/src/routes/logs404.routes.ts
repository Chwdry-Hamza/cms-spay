import { Router } from 'express';
import { z } from 'zod';

import { Log404 } from '../models/Log404';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

export const log404Routes = Router();

const recordSchema = z.object({
  url: z.string().min(1).max(2000),
});

// Static website routes that always resolve to a real page.
const STATIC_ROUTES = new Set([
  '/', '/about', '/blog', '/card-terms', '/e-sign-consent',
  '/privacy-policy', '/prohibited-activities', '/search', '/support',
]);

/**
 * True when `rawUrl` maps to a real page on the website, so it must NOT be
 * recorded as a 404. The website's not-found boundary can fire for valid
 * dynamic routes (blog posts, categories, CMS pages), so we verify against the
 * actual content here — only genuinely-missing URLs belong in the log.
 * Query string + trailing slash are ignored when matching.
 */
async function resolvesToRealPage(rawUrl: string): Promise<boolean> {
  let path = (rawUrl.split('?')[0] || '/').trim();
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path) path = '/';

  if (STATIC_ROUTES.has(path)) return true;

  const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

  let m = path.match(/^\/blog\/category\/([^/]+)$/);
  if (m) return Boolean(await Category.exists({ slug: dec(m[1]) }));

  m = path.match(/^\/blog\/tag\/([^/]+)$/);
  if (m) return Boolean(await Post.exists({ status: 'published', tags: dec(m[1]) }));

  m = path.match(/^\/blog\/([^/]+)$/);
  if (m) return Boolean(await Post.exists({ status: 'published', slug: dec(m[1]) }));

  // CMS pages store their slug as the full path (e.g. '/about').
  return Boolean(await Page.exists({ slug: path, status: 'published' }));
}

/** POST /api/logs-404/record — public, called by website middleware */
log404Routes.post(
  '/record',
  validate(recordSchema),
  asyncHandler(async (req, res) => {
    const { url } = req.body as z.infer<typeof recordSchema>;
    // Skip paths that actually resolve to a real page — keep the log clean.
    if (await resolvesToRealPage(url)) {
      res.json({ ok: true, skipped: true });
      return;
    }
    await Log404.findOneAndUpdate(
      { url },
      {
        $inc: { hits: 1 },
        $set: { lastSeen: new Date() },
        $setOnInsert: { resolved: false },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ ok: true });
  })
);

log404Routes.use(authRequired);

/** GET /api/logs-404 */
log404Routes.get(
  '/',
  asyncHandler(async (req, res) => {
    const hideResolved = req.query.hideResolved !== '0';
    const filter: any = hideResolved ? { resolved: false } : {};
    const items = await Log404.find(filter).sort({ lastSeen: -1 }).limit(500).lean();
    res.json({ items, total: items.length });
  })
);

/** PATCH /api/logs-404/:id — mark resolved */
log404Routes.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const updated = await Log404.findByIdAndUpdate(
      req.params.id,
      { resolved: Boolean(req.body.resolved) },
      { new: true }
    );
    if (!updated) throw ApiError.notFound('Log not found');
    res.json(updated);
  })
);

log404Routes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const r = await Log404.findByIdAndDelete(req.params.id);
    if (!r) throw ApiError.notFound('Log not found');
    res.json({ ok: true });
  })
);
