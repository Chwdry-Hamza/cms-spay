import { Router } from 'express';

import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';

export const incomingLinksRoutes = Router();
incomingLinksRoutes.use(authRequired);

type IncomingRef = {
  sourceType: 'page' | 'post';
  sourceId: string;
  sourceTitle: string;
  sourceSlug: string;
  /** anchor text fragments that link to the target */
  anchorTexts: string[];
};

/**
 * Walks a TipTap JSON doc and returns every text node that has a link mark
 * whose href matches one of `targetHrefs`. Returns just the anchor strings.
 */
function findAnchorsForHrefs(doc: any, targetHrefs: Set<string>): string[] {
  const hits: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === 'text' && Array.isArray(node.marks)) {
      const link = node.marks.find((m: any) => m.type === 'link');
      if (link?.attrs?.href && targetHrefs.has(link.attrs.href)) {
        hits.push(node.text ?? '');
      }
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return hits;
}

/**
 * GET /api/incoming-links/page/:id
 * GET /api/incoming-links/post/:id
 *
 * Scans all pages + posts for internal links that point at this target.
 */
incomingLinksRoutes.get(
  '/:type/:id',
  asyncHandler(async (req, res) => {
    const type = String(req.params.type);
    const id = String(req.params.id);
    if (type !== 'page' && type !== 'post') throw ApiError.badRequest('type must be "page" or "post"');

    // Look up the target so we know its slug
    const target =
      type === 'page'
        ? await Page.findById(id).select('slug title').lean()
        : await Post.findById(id).select('slug title').lean();
    if (!target) throw ApiError.notFound('Target not found');

    // Hrefs that count as "linking to this target"
    const slug = (target as any).slug as string;
    const hrefs = new Set<string>();
    if (type === 'page') {
      // Pages: stored slugs always start with '/' (normalized). Cover both forms.
      hrefs.add(slug);
      if (!slug.startsWith('/')) hrefs.add('/' + slug);
      else hrefs.add(slug.replace(/^\//, ''));
    } else {
      // Posts: live URL is /blog/<slug>
      hrefs.add(`/blog/${slug}`);
      hrefs.add(`blog/${slug}`);
    }

    // Pull every page + post and grep the content
    const [pages, posts] = await Promise.all([
      Page.find({}).select('_id title slug content').lean(),
      Post.find({}).select('_id title slug content').lean(),
    ]);

    const refs: IncomingRef[] = [];

    for (const p of pages) {
      // skip self
      if (type === 'page' && String(p._id) === id) continue;
      const anchors = findAnchorsForHrefs(p.content, hrefs);
      if (anchors.length) {
        refs.push({
          sourceType: 'page',
          sourceId: String(p._id),
          sourceTitle: p.title,
          sourceSlug: p.slug,
          anchorTexts: dedupe(anchors),
        });
      }
    }

    for (const p of posts) {
      if (type === 'post' && String(p._id) === id) continue;
      const anchors = findAnchorsForHrefs(p.content, hrefs);
      if (anchors.length) {
        refs.push({
          sourceType: 'post',
          sourceId: String(p._id),
          sourceTitle: p.title,
          sourceSlug: p.slug,
          anchorTexts: dedupe(anchors),
        });
      }
    }

    res.json({
      target: { type, id, slug, title: (target as any).title },
      total: refs.length,
      items: refs,
    });
  })
);

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
