import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';

import { Category } from '../models/Category';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { categoryCreateSchema, categoryUpdateSchema } from '../schemas/category.schema';
import { triggerCategoryRevalidate } from '../services/revalidate.service';

export const categoryRoutes = Router();
categoryRoutes.use(authRequired);

categoryRoutes.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Category.find().sort({ name: 1 }).lean();
    res.json({ items, total: items.length });
  })
);

categoryRoutes.post(
  '/',
  validate(categoryCreateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof categoryCreateSchema>;
    const slug = body.slug?.trim() || slugify(body.name, { lower: true, strict: true });
    if (await Category.findOne({ slug })) throw ApiError.conflict(`Slug "${slug}" is already taken`);
    const cat = await Category.create({ ...body, slug });
    triggerCategoryRevalidate(slug);
    res.status(201).json(cat);
  })
);

categoryRoutes.put(
  '/:id',
  validate(categoryUpdateSchema),
  asyncHandler(async (req, res) => {
    const cat = await Category.findById(req.params.id);
    if (!cat) throw ApiError.notFound('Category not found');
    const beforeSlug = cat.slug;
    Object.assign(cat, req.body);
    await cat.save();
    triggerCategoryRevalidate(cat.slug);
    if (beforeSlug !== cat.slug) triggerCategoryRevalidate(beforeSlug);
    res.json(cat.toObject());
  })
);

categoryRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const used = await Post.countDocuments({ category: req.params.id });
    if (used > 0) throw ApiError.conflict(`Category is used by ${used} posts. Reassign first.`);
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) throw ApiError.notFound('Category not found');
    triggerCategoryRevalidate(cat.slug);
    res.json({ ok: true });
  })
);
