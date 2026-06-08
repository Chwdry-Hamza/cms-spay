import { Router } from 'express';
import { z } from 'zod';

import { Redirect } from '../models/Redirect';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired, authOptional } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { triggerRevalidate } from '../services/revalidate.service';

export const redirectRoutes = Router();

const redirectCreateSchema = z.object({
  from: z.string().min(1).max(500).startsWith('/'),
  to:   z.string().min(1).max(800),
});

/** GET /api/redirects — admin only */
redirectRoutes.get(
  '/',
  authRequired,
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const filter: any = q ? { $or: [{ from: new RegExp(q, 'i') }, { to: new RegExp(q, 'i') }] } : {};
    const items = await Redirect.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ items, total: items.length });
  })
);

/** GET /api/redirects/all.json — public (used by the website middleware) */
redirectRoutes.get(
  '/all.json',
  authOptional,
  asyncHandler(async (_req, res) => {
    const items = await Redirect.find({}, { from: 1, to: 1, _id: 1 }).lean();
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ items });
  })
);

/** POST /api/redirects */
redirectRoutes.post(
  '/',
  authRequired,
  validate(redirectCreateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof redirectCreateSchema>;
    if (await Redirect.findOne({ from: body.from })) {
      throw ApiError.conflict(`A redirect for "${body.from}" already exists`);
    }
    const created = await Redirect.create(body);
    triggerRevalidate(body.from);
    res.status(201).json(created);
  })
);

/** DELETE /api/redirects/:id */
redirectRoutes.delete(
  '/:id',
  authRequired,
  asyncHandler(async (req, res) => {
    const r = await Redirect.findByIdAndDelete(req.params.id);
    if (!r) throw ApiError.notFound('Redirect not found');
    triggerRevalidate(r.from);
    res.json({ ok: true });
  })
);
