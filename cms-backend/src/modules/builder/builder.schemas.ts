import { z } from 'zod';

export const SlugParam = z.object({
  slug: z.string().min(1).max(200),
});

export const SlugWithInstance = z.object({
  slug: z.string().min(1).max(200),
  instanceId: z.string().min(1).max(64),
});

export const SlugWithRev = z.object({
  slug: z.string().min(1).max(200),
  revId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid revision id'),
});

export const CreatePageBody = z.object({
  slug: z.string().min(1).max(200).default('/'),
  title: z.string().min(1).max(200).default('Home / Landing Page'),
  workspaceId: z.string().min(1).max(64).default('default'),
});

export const UpdatePageBody = z
  .object({
    title: z.string().min(1).max(200).optional(),
    seoTitle: z.string().max(200).nullable().optional(),
    seoDescription: z.string().max(500).nullable().optional(),
    seoKeywords: z.string().max(500).nullable().optional(),
    ogImage: z.string().max(2000).nullable().optional(),
    noindex: z.boolean().optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.title !== undefined ||
      v.seoTitle !== undefined ||
      v.seoDescription !== undefined ||
      v.seoKeywords !== undefined ||
      v.ogImage !== undefined ||
      v.noindex !== undefined,
    'At least one field is required',
  );

export const ReorderBody = z
  .union([
    z
      .object({
        order: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    z
      .object({
        fromInstanceId: z.string().min(1),
        toInstanceId: z.string().min(1),
      })
      .strict(),
  ])
  .refine((v) => v !== undefined, 'Body required');

export const AddSectionBody = z
  .object({
    sectionKey: z.string().min(1),
    position: z.number().int().nonnegative().optional(),
  })
  .strict();

export const PatchSectionBody = z
  .object({
    visible: z.boolean().optional(),
    name: z.string().min(1).max(200).optional(),
    data: z.record(z.unknown()).optional(),
  })
  .strict()
  .refine(
    (v) => v.visible !== undefined || v.name !== undefined || v.data !== undefined,
    'At least one of visible, name, data is required',
  );

export const SaveBody = z
  .object({
    kind: z.enum(['autosave', 'manualSave']).default('manualSave'),
    note: z.string().max(500).optional(),
  })
  .strict();

export const PublishQuery = z
  .object({
    force: z
      .union([z.literal('true'), z.literal('false')])
      .optional()
      .transform((v) => v === 'true'),
  })
  .strict();
