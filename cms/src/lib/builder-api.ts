/**
 * Thin client for the cms-backend Builder API.
 *
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL. Slugs are URL-encoded so the
 * home page "/" becomes "%2F" on the wire.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const SLUG = process.env.NEXT_PUBLIC_BUILDER_PAGE_SLUG || "/";

// ─── Types (mirror the backend shape) ───────────────────────────────────────
export type BackendLayoutItem = {
  instanceId: string;
  sectionKey: string;
  type: string;
  name: string;
  file: string;
  icon: string;
  visible: boolean;
  locked: boolean;
  description: string;
  data: Record<string, unknown>;
};

export type BackendPage = {
  _id: string;
  workspaceId: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  isDirty: boolean;
  draftLayout: BackendLayoutItem[];
  publishedLayout: BackendLayoutItem[] | null;
  version: number;
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
};

export type CatalogueEntry = {
  key: string;
  type: string;
  name: string;
  file: string;
  icon: string;
  locked: boolean;
  description: string;
  defaultData: Record<string, unknown>;
};

export type StatusResponse = {
  status: "draft" | "published";
  isDirty: boolean;
  version: number;
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
  updatedAt: string;
};

// ─── Envelope helpers ───────────────────────────────────────────────────────
type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

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

const slugPath = (slug: string = SLUG) => encodeURIComponent(slug);

// ─── Public API ─────────────────────────────────────────────────────────────
export const builderApi = {
  slug: SLUG,

  getCatalogue: () =>
    request<{ sections: CatalogueEntry[] }>("/api/v1/builder/catalogue"),

  syncCatalogue: () =>
    request<{ active: string[]; pruned: Array<{ slug: string; removed: string[] }> }>(
      "/api/v1/builder/catalogue/sync",
      { method: "POST" },
    ),

  getPage: (slug: string = SLUG) =>
    request<{ page: BackendPage }>(`/api/v1/builder/pages/${slugPath(slug)}`),

  getStatus: (slug: string = SLUG) =>
    request<StatusResponse>(`/api/v1/builder/pages/${slugPath(slug)}/status`),

  reorder: (
    body: { order: string[] } | { fromInstanceId: string; toInstanceId: string },
    slug: string = SLUG,
  ) =>
    request<{ layout: BackendLayoutItem[]; isDirty: boolean }>(
      `/api/v1/builder/pages/${slugPath(slug)}/layout/reorder`,
      { method: "POST", json: body },
    ),

  addSection: (
    body: { sectionKey: string; position?: number },
    slug: string = SLUG,
  ) =>
    request<{ instance: BackendLayoutItem; layout: BackendLayoutItem[] }>(
      `/api/v1/builder/pages/${slugPath(slug)}/sections`,
      { method: "POST", json: body },
    ),

  deleteSection: (instanceId: string, slug: string = SLUG) =>
    request<{ layout: BackendLayoutItem[] }>(
      `/api/v1/builder/pages/${slugPath(slug)}/sections/${instanceId}`,
      { method: "DELETE" },
    ),

  patchSection: (
    instanceId: string,
    body: { visible?: boolean; name?: string; data?: Record<string, unknown> },
    slug: string = SLUG,
  ) =>
    request<{ instance: BackendLayoutItem; isDirty: boolean }>(
      `/api/v1/builder/pages/${slugPath(slug)}/sections/${instanceId}`,
      { method: "PATCH", json: body },
    ),

  duplicateSection: (instanceId: string, slug: string = SLUG) =>
    request<{ instance: BackendLayoutItem; layout: BackendLayoutItem[] }>(
      `/api/v1/builder/pages/${slugPath(slug)}/sections/${instanceId}/duplicate`,
      { method: "POST" },
    ),

  save: (
    body: { kind: "autosave" | "manualSave"; note?: string },
    slug: string = SLUG,
  ) =>
    request<{
      revisionId: string;
      version: number;
      kind: string;
      isDirty: boolean;
      lastSavedAt: string;
    }>(`/api/v1/builder/pages/${slugPath(slug)}/save`, {
      method: "POST",
      json: body,
    }),

  publish: (slug: string = SLUG, force = false) =>
    request<{
      revisionId: string;
      version: number;
      status: "published";
      isDirty: boolean;
      lastPublishedAt: string;
    }>(
      `/api/v1/builder/pages/${slugPath(slug)}/publish${force ? "?force=true" : ""}`,
      { method: "POST" },
    ),

  revertToPublished: (slug: string = SLUG) =>
    request<{ page: BackendPage }>(
      `/api/v1/builder/pages/${slugPath(slug)}/revert-to-published`,
      { method: "POST" },
    ),

  discardDraft: (slug: string = SLUG) =>
    request<{ page: BackendPage }>(
      `/api/v1/builder/pages/${slugPath(slug)}/discard-draft`,
      { method: "POST" },
    ),
};
