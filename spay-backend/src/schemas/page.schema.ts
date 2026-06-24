import { z } from 'zod';
import { seoSchema, statusEnum, structuredDataSchema, performanceSchema, codeInjectionSchema } from './common.schema';

export const pageCreateSchema = z.object({
  title:    z.string().min(1).max(200),
  slug:     z.string().min(1).max(200).optional(),
  status:   statusEnum.default('draft'),
  template: z.string().max(50).default('Content'),
  content:  z.any().optional(),
  // Structured section overrides for code-driven pages (homepage etc.).
  sections: z.any().optional(),
  excerpt:  z.string().max(500).default(''),
  seo:      seoSchema.optional(),
  schema:   structuredDataSchema.optional(),
  performance: performanceSchema.optional(),
  codeInjection: codeInjectionSchema.optional(),
  featuredImage: z.string().nullable().optional(),
  scheduledAt:   z.coerce.date().optional(),
});

export const pageUpdateSchema = pageCreateSchema.partial();
export type PageCreateInput = z.infer<typeof pageCreateSchema>;
export type PageUpdateInput = z.infer<typeof pageUpdateSchema>;
