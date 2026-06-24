import { z } from 'zod';
import { seoSchema, statusEnum, structuredDataSchema, performanceSchema, codeInjectionSchema } from './common.schema';

export const postCreateSchema = z.object({
  title:   z.string().min(1).max(200),
  slug:    z.string().min(1).max(200).optional(),
  status:  statusEnum.default('draft'),
  excerpt: z.string().max(500).default(''),
  content: z.any().optional(),
  cover:      z.string().max(500).default(''),
  coverMedia: z.string().nullable().optional(), // Media ObjectId
  category:   z.string().optional(),            // Category ObjectId
  tags:    z.array(z.string()).max(40).default([]),
  readTime: z.number().int().min(0).max(120).default(0),
  seo:     seoSchema.optional(),
  schema:  structuredDataSchema.optional(),
  performance: performanceSchema.optional(),
  codeInjection: codeInjectionSchema.optional(),
  scheduledAt: z.coerce.date().optional(),
});

export const postUpdateSchema = postCreateSchema.partial();
