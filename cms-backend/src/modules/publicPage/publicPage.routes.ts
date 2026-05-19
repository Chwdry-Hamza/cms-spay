import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { SlugParam } from '../builder/builder.schemas';
import { getPublishedPage } from './publicPage.service';
import {
  getPublishedContentPage,
  listPublishedContentPages,
} from '../contentPage/contentPage.service';
import { ContentSlugParam } from '../contentPage/contentPage.schemas';
import { getPublicRedirect } from '../redirect/redirect.service';

const r = Router();

r.get(
  '/page/:slug',
  validate(SlugParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await getPublishedPage(req.params.slug);
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.json({ ok: true, data });
  }),
);

r.get(
  '/content-pages',
  asyncHandler(async (_req: Request, res: Response) => {
    const pages = await listPublishedContentPages();
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.json({ ok: true, data: { pages } });
  }),
);

r.get(
  '/content-page/:slug',
  validate(ContentSlugParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await getPublishedContentPage(req.params.slug);
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.json({ ok: true, data });
  }),
);

// SEO redirect lookup. Used by spay-website when a slug 404s in the
// ContentPage table — if there's a Redirect row, the website emits an HTTP
// 308 so the old URL keeps its inbound SEO equity.
r.get(
  '/redirect/:slug',
  validate(ContentSlugParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await getPublicRedirect(req.params.slug);
    if (!data) {
      res.status(404).json({
        ok: false,
        error: { code: 'REDIRECT_NOT_FOUND', message: 'No redirect for that slug.' },
      });
      return;
    }
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.json({ ok: true, data });
  }),
);

export default r;
