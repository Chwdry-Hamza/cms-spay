import { SECTION_CATALOGUE } from './sections.catalogue';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

/**
 * Source of truth for "which sections exist in spay-website".
 *
 * The home page on spay-website now renders fully dynamically from the CMS
 * layout (see `DynamicPage.tsx`), so the "what's in page.tsx" scan is no
 * longer meaningful — every catalogue entry is renderable as long as its
 * component is registered in `DynamicPage`'s COMPONENT_MAP.
 *
 * We keep the cache so callers (e.g. addSection's manifest gate) don't pay
 * to re-derive on every request, even though the work is trivial today.
 */

let cached: { keys: Set<string>; at: number } | null = null;

export async function refreshManifest(): Promise<Set<string>> {
  const keys = new Set<string>(SECTION_CATALOGUE.map((e) => e.key));
  cached = { keys, at: Date.now() };
  logger.info(
    { sections: [...keys].sort(), count: keys.size },
    'section manifest refreshed from catalogue',
  );
  return keys;
}

export async function getActiveSectionKeys(): Promise<Set<string>> {
  if (cached && Date.now() - cached.at < env.SECTION_MANIFEST_CACHE_MS) {
    return cached.keys;
  }
  return refreshManifest();
}

export function getCachedSectionKeysSync(): Set<string> | null {
  return cached?.keys ?? null;
}

export function invalidateManifestCache(): void {
  cached = null;
}
