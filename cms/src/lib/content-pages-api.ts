/**
 * Thin client for cms-backend's Content Pages API.
 */

import { ApiError } from "./builder-api";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ContentBlock =
  | { id: string; type: "heading"; level: HeadingLevel; parts: { text: string; color?: string }[] }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "note"; text: string }
  | { id: string; type: "divider" }
  | {
      id: string;
      type: "table";
      rows: string[][];
      hasHeaderRow: boolean;
      caption?: string;
    };

export type ContentRevisionKind = "autosave" | "manualSave" | "publish";

export type ContentPageRevisionRow = {
  id: string;
  kind: ContentRevisionKind;
  version: number;
  note: string;
  authorId: string | null;
  createdAt: string;
};

export type ContentPageSummary = {
  slug: string;
  title: string;
  status: "draft" | "published";
  isDirty: boolean;
  lastPublishedAt: string | null;
  lastSavedAt: string | null;
  scheduledPublishAt: string | null;
  updatedAt: string;
};

export type ContentPage = {
  slug: string;
  title: string;
  footerLabel: string | null;
  showInFooter: boolean;
  status: "draft" | "published";
  isDirty: boolean;
  effectiveDate: string | null;
  lastUpdated: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  noindex: boolean;
  draftBlocks: ContentBlock[];
  publishedBlocks: ContentBlock[] | null;
  tags: string[];
  version: number;
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
  scheduledPublishAt: string | null;
  updatedAt: string;
};

export type RelatedContentPage = {
  slug: string;
  title: string;
  status: "draft" | "published";
  tags: string[];
  overlap: number;
  updatedAt: string | null;
};

export type TagUsage = { tag: string; usage: number };

type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  let body: Envelope<T> | undefined;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError("BAD_RESPONSE", `Non-JSON response from ${path} (${res.status})`);
  }

  if (!body.ok) {
    throw new ApiError(body.error.code, body.error.message, body.error.details);
  }
  return body.data;
}

const slugPath = (slug: string) => encodeURIComponent(slug);

export const contentPagesApi = {
  list: () =>
    request<{ pages: ContentPageSummary[] }>("/api/v1/content-pages"),

  get: (slug: string) =>
    request<{ page: ContentPage }>(`/api/v1/content-pages/${slugPath(slug)}`),

  create: (body: {
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
    blocks?: ContentBlock[];
    tags?: string[];
  }) =>
    request<{ page: ContentPage }>("/api/v1/content-pages", {
      method: "POST",
      json: body,
    }),

  update: (
    slug: string,
    body: {
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
      blocks?: ContentBlock[];
      tags?: string[];
    },
  ) =>
    request<{ page: ContentPage }>(`/api/v1/content-pages/${slugPath(slug)}`, {
      method: "PATCH",
      json: body,
    }),

  /**
   * Delete a content page. Backlink-aware: if other pages currently link
   * to this slug, the backend refuses with `code: BACKLINKS_PRESENT` and
   * `error.details.backlinks` lists the offending pages. Pass `redirectTo`
   * to (1) rewrite every page that links here so it points at the target
   * directly, and (2) also create a 308 from this slug as a safety net for
   * external inbound links. Pass `force` to delete without rewriting or
   * redirecting (admin override — backlinks will 404 afterwards).
   */
  remove: (
    slug: string,
    opts?: { redirectTo?: string | null; force?: boolean },
  ) => {
    const params = new URLSearchParams();
    if (opts?.redirectTo) params.set("redirectTo", opts.redirectTo);
    if (opts?.force) params.set("force", "true");
    const qs = params.toString();
    return request<{
      deleted: true;
      redirectCreated: string | null;
      rewritten: Array<{
        slug: string;
        title: string;
        replacements: number;
      }>;
    }>(
      `/api/v1/content-pages/${slugPath(slug)}${qs ? `?${qs}` : ""}`,
      { method: "DELETE" },
    );
  },

  publish: (slug: string) =>
    request<{ page: ContentPage }>(
      `/api/v1/content-pages/${slugPath(slug)}/publish`,
      { method: "POST" },
    ),

  discardDraft: (slug: string) =>
    request<{ page: ContentPage }>(
      `/api/v1/content-pages/${slugPath(slug)}/discard-draft`,
      { method: "POST" },
    ),

  schedulePublish: (slug: string, publishAt: string) =>
    request<{ page: ContentPage }>(
      `/api/v1/content-pages/${slugPath(slug)}/schedule-publish`,
      { method: "POST", json: { publishAt } },
    ),

  cancelSchedule: (slug: string) =>
    request<{ page: ContentPage }>(
      `/api/v1/content-pages/${slugPath(slug)}/cancel-schedule`,
      { method: "POST" },
    ),

  listRevisions: (slug: string) =>
    request<{ revisions: ContentPageRevisionRow[] }>(
      `/api/v1/content-pages/${slugPath(slug)}/revisions`,
    ),

  restoreRevision: (slug: string, revisionId: string) =>
    request<{ page: ContentPage }>(
      `/api/v1/content-pages/${slugPath(slug)}/revisions/${encodeURIComponent(
        revisionId,
      )}/restore`,
      { method: "POST" },
    ),

  /**
   * Pages that currently link to `slug`. Used by the editor's "Pages
   * linking here" panel and by the slug-rename / delete safety prompts to
   * show editors what will break before they commit.
   */
  listBacklinks: (slug: string) =>
    request<{ backlinks: ContentPageBacklink[] }>(
      `/api/v1/content-pages/${slugPath(slug)}/backlinks`,
    ),

  /**
   * Every distinct tag currently in use, with its usage count. Powers
   * the tag-input autocomplete in the editor so editors converge on a
   * shared vocabulary instead of typo'ing their own variants.
   */
  listTags: () =>
    request<{ tags: TagUsage[] }>("/api/v1/content-pages/tags"),

  /**
   * Pages most relevant to the given slug, ranked by tag overlap then
   * recency. Used by the "Related pages" section of the link picker so
   * editors can spot natural internal-link opportunities while writing.
   */
  listRelated: (slug: string, limit = 8) =>
    request<{ related: RelatedContentPage[] }>(
      `/api/v1/content-pages/${slugPath(slug)}/related?limit=${limit}`,
    ),

  /**
   * Bulk-rewrite every `[label](/fromSlug)` reference to `[label](/toSlug)`
   * across every page's draft blocks. The editor calls this after
   * confirming a slug rename with backlinks. Doesn't auto-publish — each
   * affected page becomes dirty so it can be reviewed first.
   */
  rewriteInternalLinks: (fromSlug: string, toSlug: string) =>
    request<{
      rewritten: Array<{ slug: string; title: string; replacements: number }>;
      totalPages: number;
      totalReplacements: number;
    }>("/api/v1/content-pages/internal-link-rewrites", {
      method: "POST",
      json: { fromSlug, toSlug },
    }),
};

export type ContentPageBacklink = {
  slug: string;
  title: string;
  status: "draft" | "published";
  links: { anchor: string; blockId: string }[];
};

export function newBlockId(): string {
  return `b${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
