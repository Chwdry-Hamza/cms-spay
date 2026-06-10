import { z } from 'zod';

export const statusEnum = z.enum(['draft', 'published', 'scheduled']);

export const seoSchema = z.object({
  title:       z.string().max(200).default(''),
  description: z.string().max(400).default(''),
  canonical:   z.string().max(500).default(''),
  noindex:     z.boolean().default(false),
  nofollow:    z.boolean().default(false),
  og: z.object({
    title:       z.string().max(200).default(''),
    description: z.string().max(400).default(''),
    image:       z.string().max(500).default(''),
  }).default({}),
  twitter: z.object({
    card:        z.string().max(80).default('summary_large_image'),
    title:       z.string().max(200).default(''),
    description: z.string().max(400).default(''),
    image:       z.string().max(500).default(''),
  }).default({}),
}).default({});

/**
 * Per-page Structured Data (JSON-LD) — surfaces in Google rich results.
 *
 *   type=none    → nothing extra emitted (the global Organization + Breadcrumb
 *                  schemas still render; for posts the intrinsic BlogPosting
 *                  also still renders)
 *   type=article → Article JSON-LD built from the page fields + Organization
 *   type=faq     → FAQPage from the `faq` Q&A list
 *   type=service → Service JSON-LD from the `service` fields, provider=Org
 *   type=custom  → user-pasted raw JSON-LD, injected verbatim if it parses
 */
export const structuredDataSchema = z.object({
  type: z.enum(['none', 'article', 'faq', 'service', 'custom']).default('none'),
  faq: z.array(z.object({
    q: z.string().max(300).default(''),
    a: z.string().max(2000).default(''),
  })).default([]),
  service: z.object({
    name:        z.string().max(200).default(''),
    description: z.string().max(500).default(''),
    serviceType: z.string().max(100).default(''),
    areaServed:  z.string().max(200).default(''),
    priceRange:  z.string().max(40).default(''),
  }).default({}),
  customJsonLd: z.string().max(20_000).default(''),
}).default({});

/**
 * Per-page performance hooks. All booleans default to "do the normal thing"
 * so most pages can leave these untouched.
 *
 *   skipAnalytics      — don't fire GA4 / GTM on this page
 *                        (use for legal pages, login confirmation, etc.)
 *   disableCache       — force this page to render dynamically every request
 *                        (use sparingly; defeats ISR)
 *   lazyLoadImages     — add loading="lazy" to body images. Default true.
 */
export const performanceSchema = z.object({
  skipAnalytics:     z.boolean().default(false),
  disableCache:      z.boolean().default(false),
  lazyLoadImages:    z.boolean().default(true),
}).default({});

export const listQuerySchema = z.object({
  q:        z.string().optional(),
  status:   z.string().optional(),
  category: z.string().optional(),
  sort:     z.string().optional(),       // e.g. "-updatedAt"
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export function buildSort(sortStr?: string, fallback: Record<string, 1 | -1> = { updatedAt: -1 }) {
  if (!sortStr) return fallback;
  const result: Record<string, 1 | -1> = {};
  for (const seg of sortStr.split(',')) {
    const trimmed = seg.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('-')) result[trimmed.slice(1)] = -1;
    else result[trimmed] = 1;
  }
  return Object.keys(result).length ? result : fallback;
}
