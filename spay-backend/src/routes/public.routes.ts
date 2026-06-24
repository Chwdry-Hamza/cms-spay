/**
 * Read-only endpoints used by spay-website. No auth required.
 * Returns only PUBLISHED content.
 */
import { Router } from 'express';
import { z } from 'zod';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { Setting } from '../models/Setting';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { validate } from '../middleware/validate.middleware';
import { env } from '../config/env';

export const publicRoutes = Router();

// ─── Runtime page auto-registration ───────────────────────────────
/**
 * POST /api/public/pages/register
 *
 * Lets the website self-register a static route so it appears in the CMS and
 * becomes SEO-editable. Idempotent: uses $setOnInsert, so an existing Page
 * (and any SEO the editor has set on it) is NEVER overwritten — only a missing
 * record is created as a published stub with an empty body. The page BODY for
 * these routes lives in the website; the CMS record exists only for SEO.
 *
 * Secret-gated: when REGISTER_SECRET is set, the caller must send a matching
 * `x-register-secret` header. When unset, allowed only outside production.
 */
const registerSchema = z.object({
  slug: z.string().min(1).max(500),
  title: z.string().min(1).max(300),
  template: z.string().max(50).optional(),
});

publicRoutes.post(
  '/pages/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const configured = env.REGISTER_SECRET;
    const provided = req.header('x-register-secret') ?? '';
    const allowed = configured ? provided === configured : !env.IS_PROD;
    if (!allowed) throw ApiError.forbidden('Page registration is disabled');

    const { slug, title, template } = req.body as z.infer<typeof registerSchema>;
    const page = await Page.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          slug,
          title,
          status: 'published',
          template: template ?? 'Content',
          content: { type: 'doc', content: [] },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    res.json(page);
  }),
);

// ─── Pages ────────────────────────────────────────────────────────

/**
 * GET /api/public/home — returns the page with slug '/' (the landing page).
 * Used by the website's marketing page for SEO metadata. Body is ignored
 * by the landing component; it only reads the seo / title fields.
 * Returns null (not 404) when not configured so the landing still renders.
 */
publicRoutes.get(
  '/home',
  asyncHandler(async (_req, res) => {
    const page = await Page.findOne({ slug: '/', status: 'published' })
      .populate('featuredImage', 'url alt variants width height')
      .lean();
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json(page ?? null);
  })
);

publicRoutes.get(
  '/pages/by-slug/:slug',
  asyncHandler(async (req, res) => {
    const raw = req.params.slug;
    const slug = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);
    const page = await Page.findOne({ slug, status: 'published' })
      .populate('featuredImage', 'url alt variants width height')
      .lean();
    if (!page) throw ApiError.notFound('Page not found');
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json(page);
  })
);

publicRoutes.get(
  '/pages',
  asyncHandler(async (_req, res) => {
    const items = await Page.find({ status: 'published' })
      .select('title slug updatedAt publishedAt seo')
      .sort({ publishedAt: -1 })
      .lean();
    res.set('Cache-Control', 'public, max-age=120');
    res.json({ items });
  })
);

// ─── Posts ────────────────────────────────────────────────────────
publicRoutes.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 24), 100);
    const page = Math.max(1, Number(req.query.page ?? 1));
    const category = String(req.query.category ?? '').trim();
    const tag = String(req.query.tag ?? '').trim();

    const filter: any = { status: 'published' };
    if (category) filter.categoryName = category;
    if (tag) filter.tags = tag;

    const [items, total] = await Promise.all([
      Post.find(filter)
        // List consumers (blog cards, footer dropdown, search) never need the
        // full Tiptap body — excluding it keeps the query + payload small.
        .select('-content')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug color')
        .populate('coverMedia', 'alt')
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

publicRoutes.get(
  '/posts/by-slug/:slug',
  asyncHandler(async (req, res) => {
    const raw = req.params.slug;
    const slug = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);
    const post = await Post.findOne({ slug, status: 'published' })
      .populate('category', 'name slug color')
      .populate('coverMedia', 'alt')
      .lean();
    if (!post) throw ApiError.notFound('Post not found');
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json(post);
  })
);

// ─── Categories ───────────────────────────────────────────────────
publicRoutes.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const items = await Category.find().sort({ name: 1 }).lean();
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ items });
  })
);

/**
 * GET /api/public/categories/by-slug/:slug?page=1&limit=
 *
 * Returns the category metadata + a paginated list of its published posts.
 * `limit` falls back to the category's `pageSize` override, else 12.
 */
publicRoutes.get(
  '/categories/by-slug/:slug',
  asyncHandler(async (req, res) => {
    const raw = req.params.slug;
    const slug = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);
    const category = await Category.findOne({ slug }).lean();
    if (!category) throw ApiError.notFound('Category not found');

    const page = Math.max(1, Number(req.query.page ?? 1));
    const requestedLimit = Number(req.query.limit);
    const limit = Math.max(
      1,
      Math.min(
        100,
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? requestedLimit
          // Default to 6/page to match the blog index (PAGE_SIZE) so categories
          // paginate at the same threshold. A per-category `pageSize` override
          // still wins when set.
          : (category as any).pageSize || 6,
      ),
    );

    const filter: any = { status: 'published', category: category._id };
    const [items, total] = await Promise.all([
      Post.find(filter)
        // List consumers (blog cards, footer dropdown, search) never need the
        // full Tiptap body — excluding it keeps the query + payload small.
        .select('-content')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug color')
        .populate('coverMedia', 'alt')
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json({
      category,
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

// Sitemap data for categories — only those with at least one published post.
// Empty category landing pages are thin content, so we keep them out of the
// sitemap (they're still reachable/indexable, just not advertised to crawlers).
publicRoutes.get(
  '/sitemap/categories',
  asyncHandler(async (_req, res) => {
    const nonEmpty = await Post.distinct('category', { status: 'published' });
    const all = await Category.find({ _id: { $in: nonEmpty } }).select('slug updatedAt').lean();
    const items = all.map((c) => ({
      slug: c.slug,
      updatedAt: (c.updatedAt as any)?.toISOString?.() ?? String(c.updatedAt ?? ''),
    }));
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ items });
  })
);

// ─── Settings (site-wide SEO, analytics) ──────────────────────────
// Only these keys may be read publicly. Anything else (or a secret stored as a
// setting in future) returns null rather than leaking via this open endpoint.
const PUBLIC_SETTING_KEYS = new Set([
  'seo',
  'crawl',
  'organization',
  'analytics',
  'robots',
  // Site-wide default header/body/footer code injection (see SEO settings).
  'codeInjection',
]);

publicRoutes.get(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const key = String(req.params.key);
    res.set('Cache-Control', 'public, max-age=300');
    if (!PUBLIC_SETTING_KEYS.has(key)) {
      res.json(null);
      return;
    }
    const doc = await Setting.findOne({ key }).lean();
    res.json(doc?.value ?? null);
  })
);

// ─── Internal-linking suggestions ─────────────────────────────────
/**
 * GET /api/public/suggestions
 *
 * Returns up to ?limit (default 8) published pages + posts ranked by relevance
 * to the editing context. Used by the CMS's "Internal linking" panel and the
 * Suggested tab of the link-picker modal.
 *
 * Query params:
 *   excludeId         optional — id to never return (the doc being edited)
 *   excludeType       optional — 'page' | 'post'
 *   category          optional — category name (post)
 *   tags              optional — CSV
 *   limit             optional — default 8, max 20
 */
publicRoutes.get(
  '/suggestions',
  asyncHandler(async (req, res) => {
    const excludeId = String(req.query.excludeId ?? '');
    const excludeType = String(req.query.excludeType ?? '');
    const category = String(req.query.category ?? '').trim();
    const tags = String(req.query.tags ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit ?? 8)));

    // Pull a healthy candidate set, score in JS, return top N
    const [pages, posts] = await Promise.all([
      Page.find({ status: 'published' })
        .select('title slug excerpt template seo updatedAt')
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean(),
      Post.find({ status: 'published' })
        .select('title slug excerpt categoryName tags seo cover publishedAt updatedAt')
        .sort({ publishedAt: -1 })
        .limit(50)
        .lean(),
    ]);

    type Suggestion = {
      kind: 'page' | 'post';
      _id: string;
      title: string;
      slug: string;
      url: string;
      excerpt?: string;
      categoryName?: string;
      tags?: string[];
      score: number;
      reasons: string[];
    };

    const score = (item: any, kind: 'page' | 'post'): Suggestion | null => {
      const id = String(item._id);
      if (excludeId && id === excludeId && (!excludeType || excludeType === kind)) return null;

      let s = 0;
      const reasons: string[] = [];

      // Category match (post only)
      if (kind === 'post' && category && item.categoryName === category) {
        s += 5;
        reasons.push(`Same category (${item.categoryName})`);
      }
      // Tag overlap (post only)
      if (kind === 'post' && tags.length && Array.isArray(item.tags)) {
        const shared = item.tags.filter((t: string) => tags.includes(t));
        if (shared.length) {
          s += 2 * shared.length;
          reasons.push(`Shares tag${shared.length === 1 ? '' : 's'}: ${shared.join(', ')}`);
        }
      }
      // Light recency boost so "newer good match" beats "older good match"
      const updated = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
      const ageDays = (Date.now() - updated) / 86_400_000;
      if (ageDays < 30) s += 0.5;
      if (ageDays < 7) s += 0.25;

      if (s <= 0) return null;
      return {
        kind,
        _id: id,
        title: item.title,
        slug: item.slug,
        url: kind === 'page' ? item.slug : `/blog/${item.slug}`,
        excerpt: item.excerpt,
        categoryName: item.categoryName,
        tags: item.tags,
        score: Math.round(s * 10) / 10,
        reasons,
      };
    };

    const ranked: Suggestion[] = [];
    for (const p of pages) {
      const r = score(p, 'page');
      if (r) ranked.push(r);
    }
    for (const p of posts) {
      const r = score(p, 'post');
      if (r) ranked.push(r);
    }
    ranked.sort((a, b) => b.score - a.score);

    res.set('Cache-Control', 'public, max-age=60');
    res.json({ items: ranked.slice(0, limit) });
  })
);

// ─── Public search ────────────────────────────────────────────────
/**
 * GET /api/public/search?q=...&limit=20
 *
 * Searches both Pages and Posts using their text indexes (title, slug,
 * excerpt — Post also indexes tags). Returns a flat ranked list mixing
 * both types, plus a `total` count.
 *
 * Only returns published, indexable content. Search-result pages on the
 * website are themselves noindex'd; this endpoint just powers them.
 */
publicRoutes.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
    if (!q) {
      res.json({ q: '', items: [], total: 0 });
      return;
    }

    // Case-insensitive SUBSTRING search across both collections so partial
    // queries match — e.g. "crypto" finds "cryptocurrency" (Mongo $text only
    // matches whole, stemmed words). The query is escaped for regex safety; we
    // match title/slug/excerpt (+ tags for posts), then rank in JS: title >
    // slug/tags > excerpt. seo.noindex docs are filtered out so hidden content
    // never surfaces.
    const baseFilter = { status: 'published', 'seo.noindex': { $ne: true } } as const;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safe, 'i');
    const ql = q.toLowerCase();

    type Hit =
      | { kind: 'page'; _id: string; title: string; slug: string; excerpt: string; score: number }
      | { kind: 'post'; _id: string; title: string; slug: string; excerpt: string; score: number; categoryName?: string };

    const has = (s: string | undefined) => (s ?? '').toLowerCase().includes(ql);
    const scoreOf = (d: { title?: string; slug?: string; excerpt?: string; tags?: string[] }) =>
      (has(d.title) ? 3 : 0) +
      (has(d.slug) ? 2 : 0) +
      ((d.tags ?? []).some((t) => String(t).toLowerCase().includes(ql)) ? 2 : 0) +
      (has(d.excerpt) ? 1 : 0);

    // Over-fetch a little before JS ranking/slicing so the best matches win.
    const [pages, posts] = await Promise.all([
      Page.find({ ...baseFilter, $or: [{ title: rx }, { slug: rx }, { excerpt: rx }] })
        .select('title slug excerpt')
        .limit(limit * 2)
        .lean(),
      Post.find({ ...baseFilter, $or: [{ title: rx }, { slug: rx }, { excerpt: rx }, { tags: rx }] })
        .select('title slug excerpt categoryName tags')
        .limit(limit * 2)
        .lean(),
    ]);

    const items: Hit[] = [
      ...pages.map((p: any) => ({
        kind: 'page' as const,
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt ?? '',
        score: scoreOf(p),
      })),
      ...posts.map((p: any) => ({
        kind: 'post' as const,
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt ?? '',
        categoryName: p.categoryName,
        score: scoreOf(p),
      })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Search results pages are noindex'd anyway, so a 60s cache is fine and
    // smooths out repeated queries from autocomplete-style hits.
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ q, items, total: items.length });
  })
);

// ─── Sitemap data ────────────────────────────────────────────────
/**
 * Sitemap inclusion rules (applied to both pages and posts):
 *   - status === 'published'   (drafts + scheduled excluded)
 *   - seo.noindex !== true     (per-page noindex toggle excluded)
 *
 * Each endpoint also returns a flat `excluded` array for the CMS preview,
 * so editors can see WHY a URL isn't in the sitemap.
 */
type SitemapEntry = { slug: string; title: string; updatedAt: string; publishedAt?: string | null };
type ExcludedEntry = { slug: string; title: string; reason: 'draft' | 'scheduled' | 'noindex'; updatedAt: string };

function classify(doc: any): 'include' | 'draft' | 'scheduled' | 'noindex' {
  if (doc.status === 'draft') return 'draft';
  if (doc.status === 'scheduled') return 'scheduled';
  if (doc.seo?.noindex === true) return 'noindex';
  return 'include';
}

publicRoutes.get(
  '/sitemap',
  asyncHandler(async (_req, res) => {
    const [pages, posts] = await Promise.all([
      Page.find({ status: 'published', 'seo.noindex': { $ne: true } })
        .select('slug updatedAt publishedAt')
        .lean(),
      Post.find({ status: 'published', 'seo.noindex': { $ne: true } })
        .select('slug updatedAt publishedAt')
        .lean(),
    ]);
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ pages, posts });
  })
);

publicRoutes.get(
  '/sitemap/pages',
  asyncHandler(async (_req, res) => {
    const all = await Page.find({}).select('slug title status updatedAt publishedAt seo.noindex').lean();
    const included: SitemapEntry[] = [];
    const excluded: ExcludedEntry[] = [];
    for (const p of all) {
      const verdict = classify(p);
      if (verdict === 'include') {
        included.push({
          slug: p.slug,
          title: (p as any).title ?? '',
          updatedAt: (p.updatedAt as any)?.toISOString?.() ?? String(p.updatedAt),
          publishedAt: (p as any).publishedAt
            ? ((p as any).publishedAt.toISOString?.() ?? String((p as any).publishedAt))
            : null,
        });
      } else {
        excluded.push({
          slug: p.slug,
          title: (p as any).title ?? '',
          reason: verdict,
          updatedAt: (p.updatedAt as any)?.toISOString?.() ?? String(p.updatedAt),
        });
      }
    }
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ items: included, excluded });
  })
);

publicRoutes.get(
  '/sitemap/posts',
  asyncHandler(async (_req, res) => {
    const all = await Post.find({}).select('slug title status updatedAt publishedAt seo.noindex').lean();
    const included: SitemapEntry[] = [];
    const excluded: ExcludedEntry[] = [];
    for (const p of all) {
      const verdict = classify(p);
      if (verdict === 'include') {
        included.push({
          slug: p.slug,
          title: (p as any).title ?? '',
          updatedAt: (p.updatedAt as any)?.toISOString?.() ?? String(p.updatedAt),
          publishedAt: (p as any).publishedAt
            ? ((p as any).publishedAt.toISOString?.() ?? String((p as any).publishedAt))
            : null,
        });
      } else {
        excluded.push({
          slug: p.slug,
          title: (p as any).title ?? '',
          reason: verdict,
          updatedAt: (p.updatedAt as any)?.toISOString?.() ?? String(p.updatedAt),
        });
      }
    }
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ items: included, excluded });
  })
);
