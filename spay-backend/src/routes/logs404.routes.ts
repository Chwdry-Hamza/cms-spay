import { Router } from 'express';
import { z } from 'zod';

import { Log404 } from '../models/Log404';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

export const log404Routes = Router();

const recordSchema = z.object({
  url: z.string().min(1).max(2000),
});

/** POST /api/logs-404/record — public, called by website middleware */
log404Routes.post(
  '/record',
  validate(recordSchema),
  asyncHandler(async (req, res) => {
    const { url } = req.body as z.infer<typeof recordSchema>;
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
