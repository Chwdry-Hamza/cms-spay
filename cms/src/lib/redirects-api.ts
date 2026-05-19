/**
 * Thin client for cms-backend's Redirects API.
 */

import { ApiError } from "./builder-api";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export type RedirectReason = "auto-slug-change" | "manual";

export type RedirectRow = {
  fromSlug: string;
  toSlug: string;
  statusCode: 301 | 308;
  reason: RedirectReason;
  note: string | null;
  createdAt: string;
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

export const redirectsApi = {
  list: () => request<{ redirects: RedirectRow[] }>("/api/v1/redirects"),

  create: (body: {
    fromSlug: string;
    toSlug: string;
    statusCode?: 301 | 308;
    note?: string | null;
  }) =>
    request<{ redirect: RedirectRow }>("/api/v1/redirects", {
      method: "POST",
      json: body,
    }),

  update: (
    fromSlug: string,
    body: { toSlug?: string; statusCode?: 301 | 308; note?: string | null },
  ) =>
    request<{ redirect: RedirectRow }>(`/api/v1/redirects/${slugPath(fromSlug)}`, {
      method: "PATCH",
      json: body,
    }),

  remove: (fromSlug: string) =>
    request<{ deleted: true }>(`/api/v1/redirects/${slugPath(fromSlug)}`, {
      method: "DELETE",
    }),
};
