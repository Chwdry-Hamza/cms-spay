import { z } from 'zod';

const categorySeoSchema = z
  .object({
    title:       z.string().max(180).optional(),
    description: z.string().max(320).optional(),
  })
  .optional();

export const categoryCreateSchema = z.object({
  name:        z.string().min(1).max(80),
  slug:        z.string().min(1).max(80).optional(),
  description: z.string().max(300).default(''),
  color:       z.string().regex(/^#?[0-9A-Fa-f]{3,8}$/).default('#46F1C5'),
  content:     z.string().max(20_000).optional(),
  seo:         categorySeoSchema,
  pageSize:    z.number().int().min(0).max(100).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
