import { z } from 'zod';

export const ContentSlugParam = z.object({
  slug: z.string().min(1).max(200),
});

/**
 * Route params for the revision restore endpoint. The base `ContentSlugParam`
 * declares only `slug`; passing it to `validate(..., 'params')` would strip
 * the `revId` segment from `req.params` (Zod's default behavior on unknown
 * keys), leaving the service to interpolate `undefined` into the error
 * message ("Revision id 'undefined' is not a valid format"). Use this
 * schema on any route that needs to read `:revId`.
 */
export const ContentSlugWithRevParam = z.object({
  slug: z.string().min(1).max(200),
  revId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid revision id'),
});

const HeadingPart = z.object({
  text: z.string(),
  color: z.string().optional(),
});

const Block = z.discriminatedUnion('type', [
  z.object({
    id: z.string().min(1),
    type: z.literal('heading'),
    level: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    parts: z.array(HeadingPart).min(1),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('paragraph'),
    text: z.string(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('list'),
    ordered: z.boolean().default(false),
    items: z.array(z.string()).min(1),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('note'),
    text: z.string(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('divider'),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal('table'),
    rows: z
      .array(z.array(z.string()).min(1).max(8))
      .min(1)
      .max(40),
    hasHeaderRow: z.boolean().optional().default(false),
    caption: z.string().max(300).optional(),
  }),
]);

export const BlocksArray = z.array(Block);

export const CreateContentPageBody = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Slug must be lowercase letters, numbers, and hyphens only.'),
  title: z.string().min(1).max(200),
  footerLabel: z.string().max(200).optional().nullable(),
  showInFooter: z.boolean().optional(),
  effectiveDate: z.string().max(200).optional().nullable(),
  lastUpdated: z.string().max(200).optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(2000).optional().nullable(),
  noindex: z.boolean().optional(),
  blocks: BlocksArray.optional(),
});

export const SchedulePublishBody = z
  .object({
    publishAt: z
      .string()
      .min(1)
      .refine((s) => !Number.isNaN(Date.parse(s)), 'Must be an ISO-8601 timestamp.'),
  })
  .strict();

export const UpdateContentPageBody = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9][a-z0-9-]*$/, 'Slug must be lowercase letters, numbers, and hyphens only.')
      .optional(),
    title: z.string().min(1).max(200).optional(),
    footerLabel: z.string().max(200).nullable().optional(),
    showInFooter: z.boolean().optional(),
    effectiveDate: z.string().max(200).nullable().optional(),
    lastUpdated: z.string().max(200).nullable().optional(),
    seoTitle: z.string().max(200).nullable().optional(),
    seoDescription: z.string().max(500).nullable().optional(),
    seoKeywords: z.string().max(500).nullable().optional(),
    ogImage: z.string().max(2000).nullable().optional(),
    noindex: z.boolean().optional(),
    blocks: BlocksArray.optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.slug !== undefined ||
      v.title !== undefined ||
      v.footerLabel !== undefined ||
      v.showInFooter !== undefined ||
      v.effectiveDate !== undefined ||
      v.lastUpdated !== undefined ||
      v.seoTitle !== undefined ||
      v.seoDescription !== undefined ||
      v.seoKeywords !== undefined ||
      v.ogImage !== undefined ||
      v.noindex !== undefined ||
      v.blocks !== undefined,
    'At least one field is required',
  );
