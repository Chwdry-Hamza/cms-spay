import { z } from 'zod';

const Slug = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'Slug must be lowercase letters, numbers, and hyphens only.');

export const SlugParam = z.object({
  slug: z.string().min(1).max(200),
});

export const CreateRedirectBody = z
  .object({
    fromSlug: Slug,
    toSlug: Slug,
    statusCode: z.union([z.literal(301), z.literal(308)]).optional(),
    note: z.string().max(500).nullable().optional(),
  })
  .strict()
  .refine((v) => v.fromSlug !== v.toSlug, {
    message: '`fromSlug` and `toSlug` must differ — a slug cannot redirect to itself.',
    path: ['toSlug'],
  });

export const UpdateRedirectBody = z
  .object({
    toSlug: Slug.optional(),
    statusCode: z.union([z.literal(301), z.literal(308)]).optional(),
    note: z.string().max(500).nullable().optional(),
  })
  .strict()
  .refine(
    (v) => v.toSlug !== undefined || v.statusCode !== undefined || v.note !== undefined,
    'At least one field is required',
  );
