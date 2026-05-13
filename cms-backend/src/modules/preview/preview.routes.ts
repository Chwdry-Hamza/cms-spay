import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { SlugParam } from '../builder/builder.schemas';
import { getPreviewPayload } from '../builder/builder.service';

const r = Router();

// Returns the current DRAFT state for an iframe / standalone preview tab.
// No token enforcement yet — wire JWT here when adding security.
r.get(
  '/pages/:slug/preview-payload',
  validate(SlugParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const payload = await getPreviewPayload(req.params.slug);
    res.json({ ok: true, data: payload });
  }),
);

export default r;
