import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Sitemap paths that must be invalidated whenever ANY content row changes,
 * so the auto-generated XML keeps matching the live database.
 * Index first, then the per-type sub-sitemap (the caller appends the right one).
 */
const ALWAYS_REVALIDATE = ['/sitemap.xml'];

/**
 * Fires revalidation for a category change: the category landing page,
 * /blog (in case category cards are shown), and the category sitemap.
 */
export function triggerCategoryRevalidate(slug: string): void {
  triggerRevalidate([`/blog/category/${slug}`, '/blog', '/sitemap.xml', '/sitemap-categories.xml']);
}

/**
 * Convenience: fires revalidate for content paths + the sitemap pair for the
 * given content type. Use this from page/post/revision mutation handlers so
 * <lastmod> is never stale by more than the inner fetch window.
 */
export function triggerContentRevalidate(paths: string[] | string, type: 'page' | 'post'): void {
  const list = Array.isArray(paths) ? paths : [paths];
  const sitemap = type === 'page' ? '/sitemap-pages.xml' : '/sitemap-posts.xml';
  triggerRevalidate([...list, ...ALWAYS_REVALIDATE, sitemap]);
}

/**
 * Fires a request to the website's revalidate endpoint after content changes.
 * Fire-and-forget — never blocks the response.
 */
export function triggerRevalidate(paths: string[] | string): void {
  if (!env.WEBSITE_REVALIDATE_URL) {
    logger.debug('[revalidate] WEBSITE_REVALIDATE_URL not configured; skipping');
    return;
  }

  const list = Array.isArray(paths) ? paths : [paths];

  fetch(env.WEBSITE_REVALIDATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-spay-secret': env.WEBSITE_REVALIDATE_SECRET,
    },
    body: JSON.stringify({ paths: list }),
  })
    .then((res) => {
      if (!res.ok) {
        logger.warn(`[revalidate] website responded ${res.status} for ${list.join(', ')}`);
      } else {
        logger.info(`[revalidate] queued ${list.join(', ')}`);
      }
    })
    .catch((err) => {
      logger.warn('[revalidate] request failed', err);
    });
}
