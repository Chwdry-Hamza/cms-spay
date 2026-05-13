import { z } from 'zod';

/**
 * Per-section content schemas.
 * Field names match `sectionsData.ts` in the frontend exactly so a UI patch
 * round-trips without translation.
 *
 * NOTE: These schemas are intentionally permissive (mostly strings) — the
 * frontend already has typed inspectors. We just want to reject obvious
 * garbage and enforce required fields.
 */

const TitlePart = z.object({
  text: z.string(),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a hex color'),
});
const TitleParts = z.array(TitlePart).min(1).max(20);

const ColorHex = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a hex color');
const AssetUrl = z.string().min(1);
const Href = z
  .string()
  .min(1)
  .refine((s) => s.startsWith('/') || /^https?:\/\//.test(s), 'Must be an absolute URL or start with "/"');

// Universal style block — every section accepts it as an optional field.
// `bg.kind === 'none'` (or absent) means "don't override the section's own
// background". `solid` uses bg.color; `gradient` uses bg.start/end/angle.
const BackgroundZ = z
  .object({
    kind: z.enum(['none', 'solid', 'gradient']).optional(),
    color: ColorHex.optional(),
    start: ColorHex.optional(),
    end: ColorHex.optional(),
    angle: z.number().min(0).max(360).optional(),
  })
  .strict()
  .optional();

// Named text-color slots. Each section component reads only the slots it
// cares about (e.g. PaymentSection uses `eyebrow` + `subtitle`; EarnSection
// adds `apr` + `aprLabel`). Unknown keys are silently stripped by Zod.
const TextColorsZ = z
  .object({
    eyebrow: ColorHex.optional(),
    subtitle: ColorHex.optional(),
    body: ColorHex.optional(),
    ctaText: ColorHex.optional(),
    ctaBg: ColorHex.optional(),
    cardTitle: ColorHex.optional(),
    cardDesc: ColorHex.optional(),
    apr: ColorHex.optional(),
    aprLabel: ColorHex.optional(),
    ticker: ColorHex.optional(),
    tagline: ColorHex.optional(),
    link: ColorHex.optional(),
    copyright: ColorHex.optional(),
    tileLabel: ColorHex.optional(),
    tileTitle: ColorHex.optional(),
    tileIcon: ColorHex.optional(),
    message: ColorHex.optional(),
    accent: ColorHex.optional(),
    pair: ColorHex.optional(),
    price: ColorHex.optional(),
    up: ColorHex.optional(),
    down: ColorHex.optional(),
  })
  .optional();

const StyleZ = z
  .object({
    bg: BackgroundZ,
    text: TextColorsZ,
  })
  .strict()
  .optional();

export const AppHeaderContent = z
  .object({
    logoSrc: AssetUrl,
    logoAlt: z.string().default(''),
    ctaLabel: z.string(),
    ctaUrl: Href,
    ctaMobileLabel: z.string().default(''),
    sticky: z.boolean().default(true),
    blur: z.boolean().default(true),
    style: StyleZ,
  })
  .strict();

export const HomeHeroContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    mobileSubtitle: z.string().default(''),
    ctaLabel: z.string(),
    ctaUrl: Href,
    heroImage: AssetUrl,
    gradientStart: ColorHex,
    gradientEnd: ColorHex,
    glowColor: ColorHex,
    style: StyleZ,
  })
  .strict();

export const FeaturesContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    cards: z
      .array(
        z.object({
          title: z.string(),
          desc: z.string(),
          image: AssetUrl,
          bgStart: ColorHex,
          bgEnd: ColorHex,
        }),
      )
      .min(1)
      .max(6),
    style: StyleZ,
  })
  .strict();

export const FeatureGridContent = z
  .object({
    eyebrow: z.string().default(''),
    // New shape — every tile is its own optional sub-object so partial PATCH
    // bodies (which only contain the changed tile) still validate.
    titleParts: TitleParts.optional(),
    // Each tile sub-object is `.partial()` so any individual field can be
    // missing — the renderer falls back to defaults. This makes patches that
    // only touch one field per tile (and older partial saves) valid.
    send: z
      .object({
        label: z.string(),
        title: z.string(),
        body: z.string(),
        badgeText: z.string(),
      })
      .partial()
      .strict()
      .optional(),
    grow: z
      .object({
        label: z.string(),
        statValue: z.string(),
        statUnit: z.string(),
        body: z.string(),
      })
      .partial()
      .strict()
      .optional(),
    spend: z
      .object({
        label: z.string(),
        title: z.string(),
        cardImage: AssetUrl,
      })
      .partial()
      .strict()
      .optional(),
    split: z
      .object({
        title: z.string(),
        body: z.string(),
        amountText: z.string(),
      })
      .partial()
      .strict()
      .optional(),
    business: z
      .object({
        title: z.string(),
        body: z.string(),
        pills: z.array(z.string()).max(6),
      })
      .partial()
      .strict()
      .optional(),
    protect: z
      .object({
        label: z.string(),
        title: z.string(),
        body: z.string(),
        pills: z.array(z.string()).max(6),
      })
      .partial()
      .strict()
      .optional(),
    // Legacy fields from the previous shape — accepted but ignored by the
    // renderer so old records continue to validate.
    title: z.string().optional(),
    tiles: z.array(z.object({ icon: z.string(), label: z.string() })).optional(),
    style: StyleZ,
  })
  .strict();

export const PaymentContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    cardFront: AssetUrl,
    cardBack: AssetUrl,
    flipOnHover: z.boolean().default(true),
    style: StyleZ,
  })
  .strict();

export const TransferContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    mockupImage: AssetUrl,
    style: StyleZ,
  })
  .strict();

export const EarnContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    apr: z.string(),
    aprLabel: z.string(),
    style: StyleZ,
  })
  .strict();

export const CryptoContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    mockupImage: AssetUrl,
    // Legacy field — no longer rendered, but accepted (any array, including
    // empty) so older saved records and stale client patches still validate.
    tickers: z.array(z.string()).optional(),
    style: StyleZ,
  })
  .strict();

const Wallet = z.object({
  name: z.string(),
  status: z.string(),
  label: z.string(),
  balance: z.string(),
});

export const LinkedAccountsContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    centerCard: Wallet,
    wallets: z.array(Wallet).min(1).max(8),
    popup: z.object({
      title: z.string(),
      body: z.string(),
      ctaLabel: z.string(),
      ctaUrl: Href,
    }),
    style: StyleZ,
  })
  .strict();

export const CollaborationsContent = z
  .object({
    titleParts: TitleParts,
    partners: z
      .array(z.object({ name: z.string(), icon: z.string() }))
      .min(1)
      .max(16),
    style: StyleZ,
  })
  .strict();

const OptionalHref = z
  .string()
  .refine(
    (s) => s === '' || s.startsWith('/') || /^https?:\/\//.test(s),
    'Must be an absolute URL or start with "/"',
  );

export const CustomSectionContent = z
  .object({
    layout: z.enum(['text-only', 'image-left', 'image-right']),
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string().default(''),
    imageUrl: z.string().default(''),
    ctaLabel: z.string().default(''),
    ctaUrl: OptionalHref.default(''),
    style: StyleZ,
  })
  .strict();

export const JoinUsContent = z
  .object({
    eyebrow: z.string().default(''),
    titleParts: TitleParts,
    subtitle: z.string(),
    ctaLabel: z.string(),
    ctaUrl: Href,
    photos: z.array(AssetUrl).min(1).max(12),
    style: StyleZ,
  })
  .strict();

export const FooterContent = z
  .object({
    tagline: z.string(),
    links: z
      .array(z.object({ label: z.string(), href: Href }))
      .min(1)
      .max(20),
    copyright: z.string(),
    appStoreUrl: Href,
    playStoreUrl: Href,
    style: StyleZ,
  })
  .strict();

export const BottomNavContent = z
  .object({
    items: z
      .array(z.object({ label: z.string(), icon: z.string(), href: Href }))
      .min(2)
      .max(6),
    style: StyleZ,
  })
  .strict();

export const CookieConsentContent = z
  .object({
    message: z.string(),
    acceptLabel: z.string(),
    declineLabel: z.string(),
    learnMoreUrl: Href,
    style: StyleZ,
  })
  .strict();

export const CurrenciesContent = z
  .object({
    tickers: z
      .array(
        z.object({
          pair: z.string().min(1),
          price: z.string().min(1),
          change: z.string().min(1),
        }),
      )
      .min(1)
      .max(40),
    scrollSeconds: z.number().min(5).max(300).default(40),
    style: StyleZ,
  })
  .strict();

const SCHEMAS = {
  appHeader: AppHeaderContent,
  homeHero: HomeHeroContent,
  features: FeaturesContent,
  featureGrid: FeatureGridContent,
  payment: PaymentContent,
  transfer: TransferContent,
  earn: EarnContent,
  crypto: CryptoContent,
  currencies: CurrenciesContent,
  linkedAccounts: LinkedAccountsContent,
  collaborations: CollaborationsContent,
  customSection: CustomSectionContent,
  joinUs: JoinUsContent,
  footer: FooterContent,
  bottomNav: BottomNavContent,
  cookieConsent: CookieConsentContent,
} as const;

export type SectionTypeKey = keyof typeof SCHEMAS;

export function getSchemaForType(type: string) {
  return (SCHEMAS as Record<string, (typeof SCHEMAS)[SectionTypeKey] | undefined>)[type];
}

/**
 * Validate a full content blob for a given section type.
 * Throws BadRequest with details if invalid.
 */
import { BadRequest } from '../../utils/errors';

export function validateContent(type: string, data: unknown): Record<string, unknown> {
  const schema = getSchemaForType(type);
  if (!schema) {
    throw BadRequest(`Unknown section type: ${type}`, 'UNKNOWN_SECTION_TYPE');
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    throw BadRequest(`Invalid content for section type ${type}.`, 'INVALID_SECTION_CONTENT', details);
  }
  return result.data as Record<string, unknown>;
}

/**
 * Validate a partial patch — used by PATCH /sections/:instanceId.
 * The patch is deep-merged onto the existing data, then re-validated.
 */
export function validatePatchedContent(
  type: string,
  existing: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...existing, ...patch };
  return validateContent(type, merged);
}
