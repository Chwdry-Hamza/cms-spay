import { Router } from 'express';
import { Setting } from '../models/Setting';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { triggerRevalidate } from '../services/revalidate.service';

export const settingRoutes = Router();
settingRoutes.use(authRequired);

/** GET /api/settings — all settings as { key: value } */
settingRoutes.get(
  '/',
  asyncHandler(async (_req, res) => {
    const docs = await Setting.find().lean();
    const map: Record<string, unknown> = {};
    for (const d of docs) map[d.key] = d.value;
    res.json(map);
  })
);

/** GET /api/settings/:key */
settingRoutes.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const doc = await Setting.findOne({ key: req.params.key }).lean();
    res.json(doc?.value ?? null);
  })
);

/** PUT /api/settings/:key — upsert */
settingRoutes.put(
  '/:key',
  asyncHandler(async (req, res) => {
    const doc = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { $set: { value: req.body } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Settings affect every page (SEO defaults, analytics scripts, code
    // injection render in the root layout) — purge the whole layout scope,
    // not just the homepage.
    triggerRevalidate('layout:/');
    res.json(doc.value);
  })
);
