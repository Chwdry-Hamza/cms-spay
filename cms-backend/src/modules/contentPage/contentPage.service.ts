import { ContentPage, ContentPageDoc, IBlock } from '../../models/ContentPage';
import {
  ContentPageRevision,
  ContentPageRevisionDoc,
  ContentRevisionKind,
} from '../../models/ContentPageRevision';
import { Redirect } from '../../models/Redirect';
import { recordSlugChange } from '../redirect/redirect.service';
import { BadRequest, Conflict, NotFound } from '../../utils/errors';
import {
  extractInternalLinks,
  rewriteInternalLinksInBlocks,
} from './links';

/**
 * Canonicalize an editor-supplied tag list to the form we store + index:
 * lowercase, trimmed, internal whitespace collapsed, empty entries
 * dropped, duplicates removed (case-insensitively, since we lowercase).
 *
 * Doing this in one place means the multikey index never has to deal
 * with "Privacy", "privacy", "privacy " as three different keys, and the
 * autocomplete query can group cleanly on the literal string.
 */
function normalizeTags(input: string[] | undefined): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const tag = raw.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!tag) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

const REVISION_RETENTION = 50;
const AUTOSAVE_COALESCE_MS = 30_000;

/**
 * Build a serializable snapshot of the page's editor-facing state, used by
 * the revision history. Drops Mongoose internals so `revision.snapshot`
 * round-trips cleanly through `restore()`.
 */
function buildSnapshot(page: ContentPageDoc) {
  return {
    title: page.title,
    slug: page.slug,
    blocks: page.draftBlocks.map((b) => ({ ...b })),
    seoTitle: page.seoTitle ?? null,
    seoDescription: page.seoDescription ?? null,
    seoKeywords: page.seoKeywords ?? null,
    ogImage: page.ogImage ?? null,
    noindex: page.noindex ?? false,
    effectiveDate: page.effectiveDate ?? null,
    lastUpdated: page.lastUpdated ?? null,
    footerLabel: page.footerLabel ?? null,
    showInFooter: page.showInFooter ?? true,
  };
}

async function nextRevisionVersion(contentPageId: ContentPageDoc['_id']): Promise<number> {
  const last = await ContentPageRevision.findOne({ contentPageId })
    .sort({ version: -1 })
    .select('version')
    .lean();
  return (last?.version ?? 0) + 1;
}

/**
 * Snapshot the current ContentPage state into the revision log. Autosaves
 * within `AUTOSAVE_COALESCE_MS` of the previous autosave are merged into
 * that row instead of creating a new one — keeps the history readable when
 * the editor is typing rapidly. Trims the collection to keep at most
 * `REVISION_RETENTION` rows per page.
 */
async function recordContentRevision(
  page: ContentPageDoc,
  kind: ContentRevisionKind,
  note = '',
): Promise<ContentPageRevisionDoc> {
  if (kind === 'autosave') {
    const latest = await ContentPageRevision.findOne({ contentPageId: page._id })
      .sort({ createdAt: -1 });
    if (
      latest &&
      latest.kind === 'autosave' &&
      Date.now() - latest.createdAt.getTime() < AUTOSAVE_COALESCE_MS
    ) {
      latest.snapshot = buildSnapshot(page);
      if (note) latest.note = note;
      await latest.save();
      return latest;
    }
  }

  const version = await nextRevisionVersion(page._id);
  const rev = await ContentPageRevision.create({
    contentPageId: page._id,
    kind,
    version,
    note,
    snapshot: buildSnapshot(page),
  });

  // Trim older revisions beyond the retention cap so the collection size
  // stays predictable. Cheapest in a single bulk delete by createdAt.
  const overflow = await ContentPageRevision.find({ contentPageId: page._id })
    .sort({ createdAt: -1 })
    .skip(REVISION_RETENTION)
    .select('_id')
    .lean();
  if (overflow.length > 0) {
    await ContentPageRevision.deleteMany({
      _id: { $in: overflow.map((o) => o._id) },
    });
  }

  return rev;
}

const WORKSPACE = 'default';

export async function listContentPages() {
  const pages = await ContentPage.find({ workspaceId: WORKSPACE })
    .select(
      'slug title status isDirty lastPublishedAt lastSavedAt updatedAt scheduledPublishAt',
    )
    .sort({ updatedAt: -1 })
    .lean();
  return pages.map((p) => ({
    slug: p.slug,
    title: p.title,
    status: p.status,
    isDirty: p.isDirty,
    lastPublishedAt: p.lastPublishedAt,
    lastSavedAt: p.lastSavedAt,
    updatedAt: p.updatedAt,
    scheduledPublishAt: p.scheduledPublishAt ?? null,
  }));
}

export async function getContentPage(slug: string): Promise<ContentPageDoc> {
  const page = await ContentPage.findOne({ workspaceId: WORKSPACE, slug });
  if (!page) throw NotFound(`Content page not found: ${slug}`, 'CONTENT_PAGE_NOT_FOUND');
  return page;
}

export async function createContentPage(input: {
  slug: string;
  title: string;
  footerLabel?: string | null;
  showInFooter?: boolean;
  effectiveDate?: string | null;
  lastUpdated?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
  blocks?: IBlock[];
  tags?: string[];
}): Promise<ContentPageDoc> {
  const existing = await ContentPage.findOne({ workspaceId: WORKSPACE, slug: input.slug });
  if (existing) throw Conflict(`Content page already exists: ${input.slug}`, 'CONTENT_PAGE_EXISTS');

  if (input.slug === '/') {
    throw BadRequest('Slug "/" is reserved for the home page.', 'RESERVED_SLUG');
  }

  const blocks = input.blocks ?? [];
  return ContentPage.create({
    workspaceId: WORKSPACE,
    slug: input.slug,
    title: input.title,
    footerLabel: input.footerLabel ?? null,
    showInFooter: input.showInFooter ?? true,
    status: 'draft',
    isDirty: true,
    effectiveDate: input.effectiveDate ?? null,
    lastUpdated: input.lastUpdated ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    seoKeywords: input.seoKeywords ?? null,
    ogImage: input.ogImage ?? null,
    noindex: input.noindex ?? false,
    draftBlocks: blocks,
    publishedBlocks: null,
    outgoingLinks: extractInternalLinks(blocks),
    tags: normalizeTags(input.tags),
    version: 0,
  });
}

export async function updateContentPage(
  slug: string,
  input: {
    slug?: string;
    title?: string;
    footerLabel?: string | null;
    showInFooter?: boolean;
    effectiveDate?: string | null;
    lastUpdated?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    ogImage?: string | null;
    noindex?: boolean;
    blocks?: IBlock[];
    tags?: string[];
  },
): Promise<ContentPageDoc> {
  const page = await getContentPage(slug);

  // Slug rename — preserve inbound SEO equity by auto-creating a 308 redirect
  // from the old slug to the new one. Validate before touching the doc so we
  // don't half-update on a conflict.
  let slugChangedFrom: string | null = null;
  if (input.slug !== undefined && input.slug !== page.slug) {
    if (input.slug === '/') {
      throw BadRequest('Slug "/" is reserved for the home page.', 'RESERVED_SLUG');
    }
    const clashWithPage = await ContentPage.findOne({
      workspaceId: WORKSPACE,
      slug: input.slug,
    })
      .select('_id')
      .lean();
    if (clashWithPage) {
      throw Conflict(`A page with slug "${input.slug}" already exists.`, 'CONTENT_PAGE_EXISTS');
    }
    // If a manual redirect already occupies the new slug as its `fromSlug`,
    // remove it — the new live page should win.
    await Redirect.deleteOne({ workspaceId: WORKSPACE, fromSlug: input.slug });

    slugChangedFrom = page.slug;
    page.slug = input.slug;
  }

  if (input.title !== undefined) page.title = input.title;
  if (input.footerLabel !== undefined) page.footerLabel = input.footerLabel;
  if (input.showInFooter !== undefined) page.showInFooter = input.showInFooter;
  if (input.effectiveDate !== undefined) page.effectiveDate = input.effectiveDate;
  if (input.lastUpdated !== undefined) page.lastUpdated = input.lastUpdated;
  if (input.seoTitle !== undefined) page.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) page.seoDescription = input.seoDescription;
  if (input.seoKeywords !== undefined) page.seoKeywords = input.seoKeywords;
  if (input.ogImage !== undefined) page.ogImage = input.ogImage;
  if (input.noindex !== undefined) page.noindex = input.noindex;
  if (input.tags !== undefined) {
    page.tags = normalizeTags(input.tags);
    page.markModified('tags');
  }
  if (input.blocks !== undefined) {
    page.draftBlocks = input.blocks;
    page.markModified('draftBlocks');
  }
  // Keep the outgoing-link index in sync with the (possibly new) draft
  // blocks. Cheap to recompute even on field-only updates because it just
  // walks the existing block array.
  page.outgoingLinks = extractInternalLinks(page.draftBlocks);
  page.markModified('outgoingLinks');
  page.isDirty = true;
  page.status = 'draft';
  page.lastSavedAt = new Date();
  await page.save();

  if (slugChangedFrom) {
    await recordSlugChange(slugChangedFrom, page.slug);
  }

  // Snapshot for the History panel. Treated as autosave so consecutive
  // small edits coalesce instead of cluttering the timeline.
  await recordContentRevision(page, 'autosave');

  return page;
}

export async function publishContentPage(slug: string): Promise<ContentPageDoc> {
  const page = await getContentPage(slug);
  page.publishedBlocks = page.draftBlocks.map((b) => ({ ...b }));
  page.status = 'published';
  page.isDirty = false;
  page.version += 1;
  page.lastPublishedAt = new Date();
  // An explicit publish supersedes any pending schedule.
  page.scheduledPublishAt = null;
  await page.save();
  // Publish snapshot — never coalesces, always a distinct point on the
  // timeline so editors can roll back to "the last published version".
  await recordContentRevision(page, 'publish');
  return page;
}

/**
 * Queue a page to be auto-published at `publishAt`. The actual publish is
 * done by the scheduler worker (see `scheduler.ts`) — this just stores the
 * timestamp and keeps the page in `draft` so the public site doesn't see
 * the new blocks until the moment arrives.
 *
 * The minimum lead time is 30 seconds — anything shorter is treated as
 * "publish now" by promoting straight to `publishContentPage`. This avoids
 * a race between the response returning and the next scheduler tick.
 */
export async function schedulePublishContentPage(
  slug: string,
  publishAt: Date,
): Promise<ContentPageDoc> {
  const now = Date.now();
  const ts = publishAt.getTime();
  if (Number.isNaN(ts)) {
    throw BadRequest('Invalid publish-at timestamp.', 'INVALID_SCHEDULE');
  }
  if (ts - now < 30_000) {
    // Treat near-immediate schedules as a direct publish for predictability.
    return publishContentPage(slug);
  }

  const page = await getContentPage(slug);
  page.scheduledPublishAt = publishAt;
  page.isDirty = true;
  page.lastSavedAt = new Date();
  await page.save();
  return page;
}

/**
 * Clear a pending schedule. No-op if the page wasn't scheduled.
 */
export async function cancelScheduledPublish(slug: string): Promise<ContentPageDoc> {
  const page = await getContentPage(slug);
  if (page.scheduledPublishAt) {
    page.scheduledPublishAt = null;
    await page.save();
  }
  return page;
}

/**
 * Used by the scheduler worker — returns ContentPages whose
 * `scheduledPublishAt` is in the past and still queued. Limited to a small
 * batch per tick so a backlog after a server restart drains gracefully.
 */
export async function listDueScheduledPages(limit = 25) {
  return ContentPage.find({
    workspaceId: WORKSPACE,
    scheduledPublishAt: { $ne: null, $lte: new Date() },
  })
    .limit(limit)
    .select('slug');
}

export async function discardContentPageDraft(slug: string): Promise<ContentPageDoc> {
  const page = await getContentPage(slug);
  if (page.publishedBlocks && page.publishedBlocks.length > 0) {
    page.draftBlocks = page.publishedBlocks.map((b) => ({ ...b }));
    page.status = 'published';
  } else {
    page.draftBlocks = [];
    page.status = 'draft';
  }
  page.outgoingLinks = extractInternalLinks(page.draftBlocks);
  page.markModified('outgoingLinks');
  page.isDirty = false;
  // Discard reverts to the published state, so any pending schedule should
  // also go away — otherwise we'd auto-publish whatever the editor just
  // told us to throw out.
  page.scheduledPublishAt = null;
  await page.save();
  return page;
}

export async function deleteContentPage(slug: string): Promise<void> {
  const page = await getContentPage(slug);
  await ContentPageRevision.deleteMany({ contentPageId: page._id });
  await page.deleteOne();
}

// ─── Tags + related pages ────────────────────────────────────────────────────

/**
 * Distinct tag usage across every content page in the workspace. Sorted
 * by usage count (most popular first), then alphabetic for stable order
 * when counts tie. Powers the tag-input autocomplete in the editor so
 * the SEO team doesn't end up with `finance`, `Finance`, `FINANCE`, and
 * a stray typo all referring to the same concept.
 *
 * Capped at 200 rows — the autocomplete dropdown can't show more than
 * that meaningfully, and unbounded results would scale linearly with
 * tag soup growth.
 */
export async function listAllContentPageTags(): Promise<
  Array<{ tag: string; usage: number }>
> {
  const rows = await ContentPage.aggregate<{
    _id: string;
    usage: number;
  }>([
    { $match: { workspaceId: WORKSPACE } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', usage: { $sum: 1 } } },
    { $sort: { usage: -1, _id: 1 } },
    { $limit: 200 },
  ]);
  return rows.map((r) => ({ tag: r._id, usage: r.usage }));
}

/** Compact representation of a related page returned by the picker. */
export interface RelatedPageRow {
  slug: string;
  title: string;
  status: 'draft' | 'published';
  tags: string[];
  /** How many tags this page shares with the reference page. */
  overlap: number;
  updatedAt: Date | null;
}

/**
 * Pages most likely to be relevant to internal-link to from the page
 * with `referenceSlug`. Ranking:
 *
 *   1. **Tag overlap** — pages sharing the most tags rank first.
 *   2. **Recency** — among ties, the most-recently-updated page wins.
 *
 * If the reference page has no tags, returns an empty list (no signal to
 * rank by). Self is filtered out so a page can't recommend itself.
 */
export async function listRelatedContentPages(
  referenceSlug: string,
  limit = 8,
): Promise<RelatedPageRow[]> {
  const ref = await getContentPage(referenceSlug);
  const refTags = Array.isArray(ref.tags) ? ref.tags : [];
  if (refTags.length === 0) return [];

  const rows = await ContentPage.aggregate<{
    slug: string;
    title: string;
    status: 'draft' | 'published';
    tags: string[];
    overlap: number;
    updatedAt: Date | null;
  }>([
    {
      $match: {
        workspaceId: WORKSPACE,
        slug: { $ne: referenceSlug },
        tags: { $in: refTags },
      },
    },
    {
      $addFields: {
        overlap: {
          $size: { $setIntersection: ['$tags', refTags] },
        },
      },
    },
    { $sort: { overlap: -1, updatedAt: -1 } },
    { $limit: Math.min(50, Math.max(1, limit)) },
    {
      $project: {
        _id: 0,
        slug: 1,
        title: 1,
        status: 1,
        tags: 1,
        overlap: 1,
        updatedAt: 1,
      },
    },
  ]);
  return rows;
}

// ─── Backlinks + rename/delete safety ────────────────────────────────────────

/** Lightweight view of a page returned by the backlinks endpoint. */
export interface BacklinkRow {
  slug: string;
  title: string;
  status: 'draft' | 'published';
  links: { anchor: string; blockId: string }[];
}

/**
 * Find every page whose draft contains at least one internal link pointing
 * at `slug`. Self-links are filtered out — a page can point to itself
 * (e.g. an anchor jump) but that doesn't count as a backlink for the
 * "what will break if I rename/delete this?" question.
 */
export async function listContentPageBacklinks(slug: string): Promise<BacklinkRow[]> {
  // Touch the page first so we 404 cleanly if the slug doesn't exist —
  // saves the frontend from showing an empty panel on a typo.
  await getContentPage(slug);
  const rows = await ContentPage.find({
    workspaceId: WORKSPACE,
    'outgoingLinks.targetSlug': slug,
  })
    .select('slug title status outgoingLinks')
    .lean();
  return rows
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      status: p.status,
      links: (p.outgoingLinks ?? [])
        .filter((l) => l.targetSlug === slug)
        .map((l) => ({
          anchor: l.anchor ?? '',
          blockId: l.blockId ?? '',
        })),
    }));
}

/**
 * Rewrite every internal link pointing at `fromSlug` to point at `toSlug`
 * across every page that contains such a link. Mutates the draft blocks of
 * each affected page (NOT the published copy — editors still have to
 * publish to make the change live). Returns one row per page that actually
 * had a replacement made, including how many links were rewritten on it.
 *
 * Called from the slug-rename flow when the editor confirms "rewrite all
 * backlinks too" — also usable as a standalone admin operation.
 */
export async function rewriteInternalLinks(
  fromSlug: string,
  toSlug: string,
): Promise<Array<{ slug: string; title: string; replacements: number }>> {
  if (fromSlug === toSlug) return [];
  const candidates = await ContentPage.find({
    workspaceId: WORKSPACE,
    'outgoingLinks.targetSlug': fromSlug,
  });
  const summary: Array<{ slug: string; title: string; replacements: number }> = [];
  for (const page of candidates) {
    if (page.slug === fromSlug) continue; // never rewrite the page being renamed (its blocks belong to it, not the index target)
    const { blocks, replacements } = rewriteInternalLinksInBlocks(
      page.draftBlocks,
      fromSlug,
      toSlug,
    );
    if (replacements === 0) continue;
    page.draftBlocks = blocks;
    page.markModified('draftBlocks');
    page.outgoingLinks = extractInternalLinks(page.draftBlocks);
    page.markModified('outgoingLinks');
    page.isDirty = true;
    page.lastSavedAt = new Date();
    await page.save();
    // Snapshot the rewrite in the revision history so editors can see
    // "rewritten because /about was renamed" if they go looking later.
    await recordContentRevision(
      page,
      'manualSave',
      `Rewrote ${replacements} link${replacements === 1 ? '' : 's'} from /${fromSlug} to /${toSlug}`,
    );
    summary.push({
      slug: page.slug,
      title: page.title,
      replacements,
    });
  }
  return summary;
}

/**
 * Delete a content page with backlink protection. Default behaviour is
 * to *refuse* deletion if any other page links to this one — the
 * controller surfaces this as a 409 with `code: BACKLINKS_PRESENT` plus
 * the offending pages so the UI can prompt for a redirect target.
 *
 * Pass `redirectTo` to allow the delete by:
 *   1. Rewriting every page that currently links to this slug so it points
 *      at the redirect target directly — no redirect hop for internal
 *      links, which is the SEO-cleanest outcome.
 *   2. Creating a 308 redirect from this slug to the target — safety net
 *      for external inbound links (blog posts, search results, etc.) we
 *      don't know about.
 *   3. Deleting the page and its revision history.
 *
 * Pass `force: true` for an admin-style "delete anyway" path — backlinks
 * will simply 404 after this until they're rewritten by a human. Neither
 * the rewrite nor the redirect creation happens in force mode.
 */
export async function deleteContentPageSafely(
  slug: string,
  opts: { redirectTo?: string | null; force?: boolean } = {},
): Promise<{
  deleted: true;
  redirectCreated: string | null;
  rewritten: Array<{ slug: string; title: string; replacements: number }>;
}> {
  const page = await getContentPage(slug);

  const backlinks = await listContentPageBacklinks(slug);

  let redirectCreated: string | null = null;
  let rewritten: Array<{
    slug: string;
    title: string;
    replacements: number;
  }> = [];

  if (opts.redirectTo) {
    // Validate the redirect target exists (and isn't this same page) so
    // we don't strand inbound links on a slug that itself 404s.
    if (opts.redirectTo === slug) {
      throw BadRequest(
        'Redirect target cannot be the page being deleted.',
        'INVALID_REDIRECT_TARGET',
      );
    }
    const target = await ContentPage.findOne({
      workspaceId: WORKSPACE,
      slug: opts.redirectTo,
    })
      .select('_id')
      .lean();
    if (!target) {
      throw BadRequest(
        `Redirect target "${opts.redirectTo}" does not exist.`,
        'INVALID_REDIRECT_TARGET',
      );
    }
    // Rewrite backlinks FIRST so the literal text in every source page
    // points at the new target. This matches the "Save & rewrite" path
    // on slug rename and avoids redirect chains on every click. The 308
    // is still added below as a safety net for inbound links we can't
    // see (external blogs, search results).
    if (backlinks.length > 0) {
      rewritten = await rewriteInternalLinks(slug, opts.redirectTo);
    }
    await recordSlugChange(slug, opts.redirectTo);
    redirectCreated = opts.redirectTo;
  } else if (backlinks.length > 0 && !opts.force) {
    throw Conflict(
      `Cannot delete /${slug}: ${backlinks.length} page${
        backlinks.length === 1 ? '' : 's'
      } link to it. Provide a redirect target or pass force=true.`,
      'BACKLINKS_PRESENT',
      { backlinks },
    );
  }

  await ContentPageRevision.deleteMany({ contentPageId: page._id });
  await page.deleteOne();
  return { deleted: true, redirectCreated, rewritten };
}

// ─── Revision history ────────────────────────────────────────────────────────

export async function listContentPageRevisions(slug: string, limit = 50) {
  const page = await getContentPage(slug);
  const rows = await ContentPageRevision.find({ contentPageId: page._id })
    .sort({ createdAt: -1 })
    .limit(Math.min(200, Math.max(1, limit)))
    .select('kind version note authorId createdAt')
    .lean();
  return rows.map((r) => ({
    id: r._id.toString(),
    kind: r.kind,
    version: r.version,
    note: r.note,
    authorId: r.authorId ?? null,
    createdAt: r.createdAt,
  }));
}

/**
 * Restore a revision into the current draft. Doesn't publish — the editor
 * still has to review and click Publish (or Save) afterwards. Title and
 * SEO fields are also restored so reverting an entire page works as
 * expected; the slug is intentionally left alone to avoid silently
 * triggering a redirect chain.
 */
export async function restoreContentPageRevision(
  slug: string,
  revisionId: string,
): Promise<ContentPageDoc> {
  const page = await getContentPage(slug);

  // Validate the id format up front so a bad URL gives a clearer error than
  // Mongoose's default CastError. ContentPageRevision IDs are 24-char hex
  // ObjectIds.
  if (!/^[a-f0-9]{24}$/.test(revisionId)) {
    throw NotFound(
      `Revision id "${revisionId}" is not a valid format.`,
      'REVISION_NOT_FOUND',
    );
  }

  // Two-step lookup so the error message tells us *which* constraint
  // failed: missing doc vs. cross-page mismatch.
  const rev = await ContentPageRevision.findOne({ _id: revisionId });
  if (!rev) {
    // eslint-disable-next-line no-console
    console.warn('[contentPage] restore: revision not found in DB', {
      revisionId,
      slug,
      pageId: page._id.toString(),
    });
    throw NotFound(
      `Revision ${revisionId} does not exist.`,
      'REVISION_NOT_FOUND',
    );
  }
  if (rev.contentPageId.toString() !== page._id.toString()) {
    // eslint-disable-next-line no-console
    console.warn('[contentPage] restore: revision belongs to a different page', {
      revisionId,
      revContentPageId: rev.contentPageId.toString(),
      currentSlug: slug,
      currentPageId: page._id.toString(),
    });
    throw NotFound(
      'This revision belongs to a different page.',
      'REVISION_PAGE_MISMATCH',
    );
  }

  const s = rev.snapshot;
  page.title = s.title;
  page.draftBlocks = s.blocks.map((b) => ({ ...b }));
  page.markModified('draftBlocks');
  page.outgoingLinks = extractInternalLinks(page.draftBlocks);
  page.markModified('outgoingLinks');
  page.seoTitle = s.seoTitle ?? null;
  page.seoDescription = s.seoDescription ?? null;
  page.seoKeywords = s.seoKeywords ?? null;
  page.ogImage = s.ogImage ?? null;
  page.noindex = s.noindex ?? false;
  page.effectiveDate = s.effectiveDate ?? null;
  page.lastUpdated = s.lastUpdated ?? null;
  page.footerLabel = s.footerLabel ?? null;
  page.showInFooter = s.showInFooter ?? true;
  page.isDirty = true;
  page.status = 'draft';
  page.lastSavedAt = new Date();
  await page.save();

  // Mark the restore itself in history so editors can see the rollback
  // event (and roll back the rollback if needed).
  await recordContentRevision(
    page,
    'manualSave',
    `Restored from revision v${rev.version}`,
  );

  return page;
}

export async function getPublishedContentPage(slug: string) {
  const page = await ContentPage.findOne({ workspaceId: WORKSPACE, slug }).lean();
  if (!page) throw NotFound(`Content page not found: ${slug}`, 'CONTENT_PAGE_NOT_FOUND');
  if (!page.publishedBlocks)
    throw NotFound('Content page has not been published yet.', 'NOT_PUBLISHED');
  return {
    slug: page.slug,
    title: page.title,
    effectiveDate: page.effectiveDate,
    lastUpdated: page.lastUpdated,
    seoTitle: page.seoTitle ?? null,
    seoDescription: page.seoDescription ?? null,
    seoKeywords: page.seoKeywords ?? null,
    ogImage: page.ogImage ?? null,
    noindex: page.noindex ?? false,
    blocks: page.publishedBlocks,
    version: page.version,
    publishedAt: page.lastPublishedAt,
    // SEO freshness signal — auto-tracked by Mongoose, not user-editable.
    updatedAt: page.updatedAt,
  };
}

export async function listPublishedContentPages() {
  // createdAt asc so the seeded pages keep their original order and new pages
  // append at the end (predictable footer order).
  // `showInFooter` is NOT filtered here — callers like generateStaticParams
  // need every published slug. Footer rendering filters on the client.
  const pages = await ContentPage.find({
    workspaceId: WORKSPACE,
    publishedBlocks: { $ne: null },
  })
    .select('slug title footerLabel showInFooter')
    .sort({ createdAt: 1 })
    .lean();
  return pages.map((p) => ({
    slug: p.slug,
    title: p.title,
    footerLabel: p.footerLabel ?? null,
    showInFooter: p.showInFooter ?? true,
  }));
}
