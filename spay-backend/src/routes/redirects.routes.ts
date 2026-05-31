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
const redirectUpdateSchema = redirectCreateSchema.partial();

const redirectBulkSchema = z.object({
  /** When a row's `from` already exists in the DB: 'skip' or 'update' */
  conflictStrategy: z.enum(['skip', 'update']).default('skip'),
  rows: z.array(z.object({
    from: z.string().min(1).max(500),
    to:   z.string().min(1).max(800),
  })).min(1).max(2000),
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

/**
 * POST /api/redirects/bulk
 * Body: { conflictStrategy: 'skip' | 'update', rows: [{from, to}] }
 * Validates each row, normalizes `from` to start with `/`, and reports a summary.
 */
redirectRoutes.post(
  '/bulk',
  authRequired,
  validate(redirectBulkSchema),
  asyncHandler(async (req, res) => {
    const { rows, conflictStrategy } = req.body as z.infer<typeof redirectBulkSchema>;

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: { row: number; from: string; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      // Normalize from: must start with '/'
      let from = raw.from.trim();
      if (!from.startsWith('/')) from = '/' + from.replace(/^\/+/, '');
      const to = raw.to.trim();

      // Per-row hard validation
      if (!from || from === '/') { errors.push({ row: i + 1, from, reason: 'from is required' }); continue; }
      if (!to) { errors.push({ row: i + 1, from, reason: 'to is required' }); continue; }
      if (from === to) { errors.push({ row: i + 1, from, reason: 'from cannot equal to' }); continue; }

      const existing = await Redirect.findOne({ from });
      if (existing) {
        if (conflictStrategy === 'skip') {
          skipped++;
          continue;
        }
        existing.set({ to });
        await existing.save();
        updated++;
        continue;
      }

      try {
        await Redirect.create({ from, to });
        created++;
      } catch (err) {
        errors.push({ row: i + 1, from, reason: err instanceof Error ? err.message : 'create failed' });
      }
    }

    // One revalidate sweep — the site middleware re-fetches the redirect table
    triggerRevalidate('/');

    res.json({
      ok: true,
      summary: { received: rows.length, created, updated, skipped, errors: errors.length },
      errors,
    });
  })
);

/** PUT /api/redirects/:id */
redirectRoutes.put(
  '/:id',
  authRequired,
  validate(redirectUpdateSchema),
  asyncHandler(async (req, res) => {
    const existing = await Redirect.findById(req.params.id);
    if (!existing) throw ApiError.notFound('Redirect not found');
    Object.assign(existing, req.body);
    await existing.save();
    triggerRevalidate(existing.from);
    res.json(existing.toObject());
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
