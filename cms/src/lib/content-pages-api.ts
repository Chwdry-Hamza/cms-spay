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
  version: number;
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
  scheduledPublishAt: string | null;
  updatedAt: string;
};

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
    },
  ) =>
    request<{ page: ContentPage }>(`/api/v1/content-pages/${slugPath(slug)}`, {
      method: "PATCH",
      json: body,
    }),

  remove: (slug: string) =>
    request<{ deleted: true }>(`/api/v1/content-pages/${slugPath(slug)}`, {
      method: "DELETE",
    }),

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
};

export function newBlockId(): string {
  return `b${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
