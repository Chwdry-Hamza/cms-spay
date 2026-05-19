import { Page, PageDoc, ILayoutItem } from '../../models/Page';
import { PageRevision, PageRevisionDoc, RevisionKind } from '../../models/PageRevision';
import {
  SECTION_CATALOGUE,
  CatalogueEntry,
  getCatalogueEntry,
} from './sections.catalogue';
import { validateContent, validatePatchedContent } from './sections.content.schemas';
import {
  getActiveSectionKeys,
  refreshManifest,
} from './manifest.service';
import { newInstanceId } from '../../utils/id';
import { BadRequest, Conflict, NotFound } from '../../utils/errors';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const WORKSPACE = 'default'; // single workspace for now

function entryToLayoutItem(entry: CatalogueEntry): ILayoutItem {
  return {
    instanceId: newInstanceId(),
    sectionKey: entry.key,
    type: entry.type,
    name: entry.defaultName,
    file: entry.defaultFile,
    icon: entry.defaultIcon,
    visible: true,
    locked: entry.locked,
    description: entry.description,
    data: structuredClone(entry.defaultData),
  };
}

function snapshot(page: PageDoc) {
  return {
    title: page.title,
    status: page.status,
    layout: page.draftLayout.map((s) => ({
      instanceId: s.instanceId,
      sectionKey: s.sectionKey,
      type: s.type,
      name: s.name,
      file: s.file,
      icon: s.icon,
      visible: s.visible,
      locked: s.locked,
      description: s.description,
      data: s.data,
    })),
  };
}

async function nextVersion(pageId: PageDoc['_id']): Promise<number> {
  const last = await PageRevision.findOne({ pageId }).sort({ version: -1 }).lean();
  return (last?.version ?? 0) + 1;
}

// ─── Catalogue ───────────────────────────────────────────────────────────────
export async function listCatalogue() {
  const active = await getActiveSectionKeys();
  return SECTION_CATALOGUE
    .filter((e) => active.has(e.key))
    .map((e) => ({
      key: e.key,
      type: e.type,
      name: e.defaultName,
      file: e.defaultFile,
      icon: e.defaultIcon,
      locked: e.locked,
      description: e.description,
      defaultData: e.defaultData,
    }));
}

/**
 * Force a re-scan of spay-website and prune orphaned section instances from
 * every page's draftLayout (and publishedLayout). Returns a summary.
 */
export async function syncCatalogue(): Promise<{
  active: string[];
  pruned: Array<{ slug: string; removed: string[] }>;
}> {
  const keys = await refreshManifest();
  const active = [...keys].sort();

  const pages = await Page.find({}, '_id slug draftLayout publishedLayout');
  const pruned: Array<{ slug: string; removed: string[] }> = [];

  for (const page of pages) {
    const removed: string[] = [];

    const filteredDraft = page.draftLayout.filter((s) => {
      if (keys.has(s.sectionKey)) return true;
      removed.push(`${s.sectionKey}:${s.instanceId}`);
      return false;
    });
    const filteredPublished = page.publishedLayout
      ? page.publishedLayout.filter((s) => keys.has(s.sectionKey))
      : page.publishedLayout;

    if (
      filteredDraft.length !== page.draftLayout.length ||
      (page.publishedLayout && filteredPublished &&
        filteredPublished.length !== page.publishedLayout.length)
    ) {
      page.draftLayout = filteredDraft;
      if (page.publishedLayout && filteredPublished) {
        page.publishedLayout = filteredPublished;
      }
      page.isDirty = true;
      await page.save();
      pruned.push({ slug: page.slug, removed });
    }
  }

  if (pruned.length) {
    logger.info({ pruned }, 'syncCatalogue: pruned orphaned sections');
  }
  return { active, pruned };
}

// ─── Pages ───────────────────────────────────────────────────────────────────
export async function getPage(slug: string): Promise<PageDoc> {
  const page = await Page.findOne({ workspaceId: WORKSPACE, slug });
  if (!page) throw NotFound(`Page not found: ${slug}`, 'PAGE_NOT_FOUND');

  // Auto-prune: drop any section instances whose sectionKey is no longer
  // declared by spay-website (PreviewSection removed from page.tsx, or
  // always-on component file deleted).
  const active = await getActiveSectionKeys();
  const before = page.draftLayout.length;
  const kept = page.draftLayout.filter((s) => active.has(s.sectionKey));
  if (kept.length !== before) {
    const removed = page.draftLayout
      .filter((s) => !active.has(s.sectionKey))
      .map((s) => s.sectionKey);
    page.draftLayout = kept;
    page.isDirty = true;
    await page.save();
    logger.info({ slug, removed, count: before - kept.length }, 'auto-pruned orphaned sections');
  }

  return page;
}

export async function createPage(input: {
  slug: string;
  title: string;
  workspaceId?: string;
}): Promise<PageDoc> {
  const workspaceId = input.workspaceId ?? WORKSPACE;
  const existing = await Page.findOne({ workspaceId, slug: input.slug });
  if (existing) throw Conflict(`Page already exists: ${input.slug}`, 'PAGE_EXISTS');

  // Only seed with sections that spay-website currently declares.
  const active = await getActiveSectionKeys();
  const draftLayout = SECTION_CATALOGUE
    .filter((e) => active.has(e.key))
    .map(entryToLayoutItem);

  const page = await Page.create({
    workspaceId,
    slug: input.slug,
    title: input.title,
    status: 'draft',
    isDirty: true,
    draftLayout,
    publishedLayout: null,
    version: 0,
  });

  return page;
}

export async function updatePage(
  slug: string,
  input: {
    title?: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    ogImage?: string | null;
    noindex?: boolean;
  },
): Promise<PageDoc> {
  const page = await getPage(slug);
  if (input.title !== undefined) page.title = input.title;
  if (input.seoTitle !== undefined) page.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) page.seoDescription = input.seoDescription;
  if (input.seoKeywords !== undefined) page.seoKeywords = input.seoKeywords;
  if (input.ogImage !== undefined) page.ogImage = input.ogImage;
  if (input.noindex !== undefined) page.noindex = input.noindex;
  await page.save();
  return page;
}

// ─── Layout mutations ────────────────────────────────────────────────────────
export async function reorderLayout(
  slug: string,
  body: { order?: string[]; fromInstanceId?: string; toInstanceId?: string },
): Promise<PageDoc> {
  const page = await getPage(slug);

  if (body.order) {
    if (body.order.length !== page.draftLayout.length) {
      throw BadRequest('Reorder array length must equal current layout length.', 'REORDER_MISMATCH');
    }
    const map = new Map(page.draftLayout.map((s) => [s.instanceId, s]));
    const next: ILayoutItem[] = [];
    for (const id of body.order) {
      const item = map.get(id);
      if (!item) throw BadRequest(`Unknown instanceId in order: ${id}`, 'UNKNOWN_INSTANCE_ID');
      next.push(item);
    }
    page.draftLayout = next;
  } else if (body.fromInstanceId && body.toInstanceId) {
    const fromIdx = page.draftLayout.findIndex((s) => s.instanceId === body.fromInstanceId);
    const toIdx = page.draftLayout.findIndex((s) => s.instanceId === body.toInstanceId);
    if (fromIdx < 0) throw BadRequest('fromInstanceId not found.', 'UNKNOWN_INSTANCE_ID');
    if (toIdx < 0) throw BadRequest('toInstanceId not found.', 'UNKNOWN_INSTANCE_ID');
    if (fromIdx === toIdx) return page;
    if (page.draftLayout[fromIdx].locked) {
      throw Conflict('Cannot move a locked section.', 'SECTION_LOCKED');
    }
    const next = [...page.draftLayout];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    page.draftLayout = next;
  } else {
    throw BadRequest('Provide either { order } or { fromInstanceId, toInstanceId }.', 'BAD_REORDER_BODY');
  }

  page.isDirty = true;
  page.status = 'draft';
  await page.save();
  return page;
}

export async function addSection(
  slug: string,
  input: { sectionKey: string; position?: number },
): Promise<{ page: PageDoc; instance: ILayoutItem }> {
  const entry = getCatalogueEntry(input.sectionKey);
  if (!entry) throw BadRequest(`Unknown sectionKey: ${input.sectionKey}`, 'UNKNOWN_SECTION_KEY');

  const active = await getActiveSectionKeys();
  if (!active.has(input.sectionKey)) {
    throw BadRequest(
      `Section "${input.sectionKey}" is not declared by spay-website.`,
      'SECTION_NOT_IN_MANIFEST',
    );
  }

  const page = await getPage(slug);
  const instance = entryToLayoutItem(entry);
  const pos =
    input.position === undefined || input.position > page.draftLayout.length
      ? page.draftLayout.length
      : Math.max(0, input.position);
  page.draftLayout.splice(pos, 0, instance);
  page.isDirty = true;
  page.status = 'draft';
  await page.save();
  return { page, instance };
}

export async function deleteSection(slug: string, instanceId: string): Promise<PageDoc> {
  const page = await getPage(slug);
  const idx = page.draftLayout.findIndex((s) => s.instanceId === instanceId);
  if (idx < 0) throw NotFound(`Section instance not found: ${instanceId}`, 'SECTION_NOT_FOUND');
  if (page.draftLayout[idx].locked) {
    throw Conflict('Cannot delete a locked section.', 'SECTION_LOCKED');
  }
  page.draftLayout.splice(idx, 1);
  page.isDirty = true;
  page.status = 'draft';
  await page.save();
  return page;
}

export async function patchSection(
  slug: string,
  instanceId: string,
  patch: { visible?: boolean; name?: string; data?: Record<string, unknown> },
): Promise<{ page: PageDoc; instance: ILayoutItem }> {
  const page = await getPage(slug);
  const idx = page.draftLayout.findIndex((s) => s.instanceId === instanceId);
  if (idx < 0) throw NotFound(`Section instance not found: ${instanceId}`, 'SECTION_NOT_FOUND');

  const item = page.draftLayout[idx];

  if (patch.visible !== undefined) item.visible = patch.visible;
  if (patch.name !== undefined) item.name = patch.name;
  if (patch.data !== undefined) {
    item.data = validatePatchedContent(item.type, item.data ?? {}, patch.data);
  }

  page.draftLayout[idx] = item;
  page.markModified('draftLayout');
  page.isDirty = true;
  page.status = 'draft';
  await page.save();
  return { page, instance: page.draftLayout[idx] };
}

export async function duplicateSection(
  slug: string,
  instanceId: string,
): Promise<{ page: PageDoc; instance: ILayoutItem }> {
  const page = await getPage(slug);
  const idx = page.draftLayout.findIndex((s) => s.instanceId === instanceId);
  if (idx < 0) throw NotFound(`Section instance not found: ${instanceId}`, 'SECTION_NOT_FOUND');
  const original = page.draftLayout[idx];
  const copy: ILayoutItem = {
    ...original,
    instanceId: newInstanceId(),
    name: `${original.name} (copy)`,
    locked: false, // a duplicate is never locked even if the original was
    data: structuredClone(original.data ?? {}),
  };
  page.draftLayout.splice(idx + 1, 0, copy);
  page.isDirty = true;
  page.status = 'draft';
  await page.save();
  return { page, instance: copy };
}

// ─── Save / Publish / Revert ─────────────────────────────────────────────────
async function recordRevision(
  page: PageDoc,
  kind: RevisionKind,
  note?: string,
): Promise<PageRevisionDoc> {
  // Autosave coalescing: if the most recent revision for this page is also an
  // autosave and is younger than AUTOSAVE_MIN_INTERVAL_MS, update it in place.
  if (kind === 'autosave') {
    const latest = await PageRevision.findOne({ pageId: page._id })
      .sort({ createdAt: -1 });
    if (
      latest &&
      latest.kind === 'autosave' &&
      Date.now() - latest.createdAt.getTime() < env.AUTOSAVE_MIN_INTERVAL_MS
    ) {
      latest.snapshot = snapshot(page);
      latest.note = note ?? latest.note;
      await latest.save();
      return latest;
    }
  }

  const version = await nextVersion(page._id);
  const rev = await PageRevision.create({
    pageId: page._id,
    kind,
    version,
    note: note ?? '',
    snapshot: snapshot(page),
    parentRevisionId: page.currentDraftRev ?? null,
  });
  return rev;
}

export async function savePage(
  slug: string,
  body: { kind: 'autosave' | 'manualSave'; note?: string },
): Promise<{ page: PageDoc; revision: PageRevisionDoc }> {
  const page = await getPage(slug);
  const rev = await recordRevision(page, body.kind, body.note);
  page.currentDraftRev = rev._id;
  page.lastSavedAt = new Date();
  page.isDirty = true;
  await page.save();
  return { page, revision: rev };
}

export async function publishPage(
  slug: string,
  query: { force?: boolean },
): Promise<{ page: PageDoc; revision: PageRevisionDoc }> {
  const page = await getPage(slug);

  // Validate every section's content against its type schema.
  for (const item of page.draftLayout) {
    validateContent(item.type, item.data ?? {});
  }

  // No-op detection.
  const draftJson = JSON.stringify(page.draftLayout);
  const publishedJson = JSON.stringify(page.publishedLayout ?? []);
  if (!query.force && draftJson === publishedJson && page.publishedLayout) {
    throw Conflict('Draft is identical to the published version.', 'PUBLISH_NOOP');
  }

  const version = await nextVersion(page._id);
  const rev = await PageRevision.create({
    pageId: page._id,
    kind: 'publish',
    version,
    note: '',
    snapshot: snapshot(page),
    parentRevisionId: page.currentDraftRev ?? null,
  });

  page.publishedLayout = page.draftLayout.map((s) => ({ ...s }));
  page.publishedRevId = rev._id;
  page.status = 'published';
  page.isDirty = false;
  page.version += 1;
  page.lastPublishedAt = new Date();
  await page.save();

  return { page, revision: rev };
}

export async function revertToPublished(slug: string): Promise<PageDoc> {
  const page = await getPage(slug);
  if (!page.publishedLayout) {
    throw Conflict('Page has never been published.', 'NEVER_PUBLISHED');
  }
  page.draftLayout = page.publishedLayout.map((s) => ({ ...s }));
  page.isDirty = false;
  page.status = 'published';
  await page.save();
  return page;
}

/**
 * Wipe the current draft. Used by the "Discard draft" action in the builder.
 *   - If the page has been published before: restore the draft from the last
 *     published layout (same outcome as revertToPublished).
 *   - If the page has never been published: re-seed the draft from the
 *     catalogue defaults — gives the user a clean "factory reset" state.
 * Either way the draft becomes not-dirty.
 */
export async function discardDraft(slug: string): Promise<PageDoc> {
  const page = await getPage(slug);
  if (page.publishedLayout && page.publishedLayout.length > 0) {
    page.draftLayout = page.publishedLayout.map((s) => ({ ...s }));
    page.status = 'published';
  } else {
    const active = await getActiveSectionKeys();
    page.draftLayout = SECTION_CATALOGUE
      .filter((e) => active.has(e.key))
      .map(entryToLayoutItem);
    page.status = 'draft';
  }
  page.isDirty = false;
  await page.save();
  return page;
}

export async function getStatus(slug: string) {
  const page = await Page.findOne({ workspaceId: WORKSPACE, slug }).select(
    'status isDirty version lastSavedAt lastPublishedAt updatedAt',
  );
  if (!page) throw NotFound(`Page not found: ${slug}`, 'PAGE_NOT_FOUND');
  return {
    status: page.status,
    isDirty: page.isDirty,
    version: page.version,
    lastSavedAt: page.lastSavedAt,
    lastPublishedAt: page.lastPublishedAt,
    updatedAt: page.updatedAt,
  };
}

// ─── Revisions ───────────────────────────────────────────────────────────────
export async function listRevisions(slug: string, limit = 50) {
  const page = await getPage(slug);
  const rows = await PageRevision.find({ pageId: page._id })
    .sort({ version: -1 })
    .limit(Math.min(200, Math.max(1, limit)))
    .select('kind version note authorId createdAt')
    .lean();
  // Normalize `_id` to a string `id` field so clients don't have to
  // worry about ObjectId serialization quirks.
  return rows.map((r) => ({
    id: r._id.toString(),
    kind: r.kind,
    version: r.version,
    note: r.note,
    authorId: r.authorId ?? null,
    createdAt: r.createdAt,
  }));
}

export async function getRevision(slug: string, revId: string): Promise<PageRevisionDoc> {
  const page = await getPage(slug);
  const rev = await PageRevision.findOne({ _id: revId, pageId: page._id });
  if (!rev) throw NotFound('Revision not found.', 'REVISION_NOT_FOUND');
  return rev;
}

export async function restoreRevision(slug: string, revId: string): Promise<PageDoc> {
  const page = await getPage(slug);
  const rev = await PageRevision.findOne({ _id: revId, pageId: page._id });
  if (!rev) throw NotFound('Revision not found.', 'REVISION_NOT_FOUND');

  page.draftLayout = rev.snapshot.layout.map((s) => ({ ...s }));
  page.isDirty = true;
  page.status = 'draft';
  await page.save();
  return page;
}

// ─── Preview payload (used by the iframe / standalone preview tab) ───────────
export async function getPreviewPayload(slug: string) {
  const page = await getPage(slug);
  const sections: Record<string, unknown> = {};
  const visibility: Record<string, boolean> = {};
  const order: string[] = [];

  for (const item of page.draftLayout) {
    sections[item.instanceId] = item.data;
    visibility[item.instanceId] = item.visible;
    order.push(item.instanceId);
  }

  return {
    slug: page.slug,
    title: page.title,
    status: page.status,
    isDirty: page.isDirty,
    version: page.version,
    sections,
    visibility,
    order,
    layout: page.draftLayout, // full items for clients that want them
  };
}
