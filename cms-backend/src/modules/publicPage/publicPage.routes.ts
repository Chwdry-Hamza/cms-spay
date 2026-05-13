import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { SlugParam } from '../builder/builder.schemas';
import { getPublishedPage } from './publicPage.service';

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

export default r;
