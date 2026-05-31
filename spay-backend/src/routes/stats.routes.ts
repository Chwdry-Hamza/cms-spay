import { Router } from 'express';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { Media } from '../models/Media';
import { Redirect } from '../models/Redirect';
import { Log404 } from '../models/Log404';
import { authRequired } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export const statsRoutes = Router();
statsRoutes.use(authRequired);

/** Walk a Tiptap doc and return true if any node matches `predicate`. */
function tiptapAny(node: any, predicate: (n: any) => boolean): boolean {
  if (!node || typeof node !== 'object') return false;
  if (predicate(node)) return true;
  if (Array.isArray(node.marks) && node.marks.some(predicate)) return true;
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      if (tiptapAny(child, predicate)) return true;
    }
  }
  return false;
}

const hasH1 = (content: any) =>
  tiptapAny(content, (n) => n.type === 'heading' && n.attrs?.level === 1);

const hasInternalLink = (content: any) =>
  tiptapAny(content, (n) => {
    if (n.type !== 'link') return false;
    const href = n.attrs?.href;
    return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
  });

const pct = (num: number, denom: number) =>
  denom === 0 ? 0 : Math.round((num / denom) * 100);

/**
 * GET /api/stats — dashboard summary numbers
 * Returns counts for the dashboard cards and "needs attention" widget.
 */
statsRoutes.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [
      pagesTotal, postsTotal, mediaTotal, redirectsTotal,
      logs404Unresolved, pagesMissingDesc, mediaMissingAlt, recentPages, recentPosts,
      publishedPages, publishedPosts, imageTotal,
    ] = await Promise.all([
      Page.countDocuments({}),
      Post.countDocuments({}),
      Media.countDocuments({}),
      Redirect.countDocuments({}),
      Log404.countDocuments({ resolved: false }),
      Page.countDocuments({ 'seo.description': { $in: ['', null] } }),
      Media.countDocuments({ type: 'image', alt: { $in: ['', null] } }),
      Page.find().sort({ updatedAt: -1 }).limit(5).lean(),
      Post.find().sort({ updatedAt: -1 }).limit(4).lean(),
      Page.find({ status: 'published' }).select('content seo.description').lean(),
      Post.find({ status: 'published' }).select('content seo.description').lean(),
      Media.countDocuments({ type: 'image' }),
    ]);

    // ── SEO health: compute live percentages across all published content ──
    const allPublished = [...publishedPages, ...publishedPosts];
    const totalPublished = allPublished.length;

    const withMetaDesc      = allPublished.filter((d: any) => !!d?.seo?.description?.trim()).length;
    const withH1            = allPublished.filter((d: any) => hasH1(d.content)).length;
    const withInternalLinks = allPublished.filter((d: any) => hasInternalLink(d.content)).length;

    const metaDescriptionPct = pct(withMetaDesc, totalPublished);
    const altTextPct         = pct(imageTotal - mediaMissingAlt, imageTotal);
    const h1Pct              = pct(withH1, totalPublished);
    const internalLinksPct   = pct(withInternalLinks, totalPublished);

    const seoHealth = {
      score: Math.round((metaDescriptionPct + altTextPct + h1Pct + internalLinksPct) / 4),
      metaDescription: metaDescriptionPct,
      altText: altTextPct,
      h1: h1Pct,
      internalLinks: internalLinksPct,
    };

    res.json({
      pages:    { total: pagesTotal, missingDescription: pagesMissingDesc },
      posts:    { total: postsTotal },
      media:    { total: mediaTotal, missingAlt: mediaMissingAlt },
      redirects:{ active: redirectsTotal },
      logs404:  { unresolved: logs404Unresolved },
      seoHealth,
      recent: { pages: recentPages, posts: recentPosts },
    });
  })
);
