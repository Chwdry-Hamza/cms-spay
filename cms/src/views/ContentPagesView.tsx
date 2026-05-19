"use client";

import * as React from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { Card, SectionHeader } from "@/components/Card";
import {
  contentPagesApi,
  type ContentPageSummary,
} from "@/lib/content-pages-api";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function toSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ContentPagesView() {
  const [pages, setPages] = React.useState<ContentPageSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const { pages: list } = await contentPagesApi.list();
      setPages(list);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
    try {
      await contentPagesApi.remove(slug);
      await reload();
    } catch (e) {
      window.alert(`Delete failed: ${(e as Error).message}`);
    }
  };

  return (
    <div
      className="content fade-in"
      style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}
    >
      <Card padding={20}>
        <SectionHeader
          eyebrow="CONTENT"
          title="Pages"
          right={
            <button
              className="btn primary"
              onClick={() => setIsCreateOpen(true)}
              style={{ padding: "8px 14px" }}
            >
              <Icon name="plus" size={13} />
              New page
            </button>
          }
        />

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              background: "rgba(255,107,128,.08)",
              border: "1px solid rgba(255,107,128,.25)",
              color: "#ffb1bd",
              fontSize: 12.5,
            }}
          >
            Could not load pages: {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, color: "var(--text-3)", fontSize: 13 }}>
            Loading pages…
          </div>
        ) : pages.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: 13,
            }}
          >
            No content pages yet. Click "New page" to create one.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                className="mono"
                style={{
                  textAlign: "left",
                  color: "var(--text-3)",
                  fontSize: 10,
                  letterSpacing: ".14em",
                }}
              >
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>TITLE</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>SLUG</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>STATUS</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>WHEN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.slug} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 6px" }}>
                    <Link
                      href={`/content-pages/${encodeURIComponent(p.slug)}`}
                      style={{ fontWeight: 500, color: "var(--text-1)" }}
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td
                    style={{ padding: "12px 6px", color: "var(--text-3)" }}
                    className="mono"
                  >
                    /{p.slug}
                  </td>
                  <td style={{ padding: "12px 6px" }}>
                    {p.scheduledPublishAt ? (
                      <span
                        className="chip"
                        title={`Auto-publishes ${new Date(
                          p.scheduledPublishAt,
                        ).toLocaleString()}`}
                        style={{
                          padding: "3px 8px",
                          background: "rgba(4,186,191,.08)",
                          borderColor: "rgba(4,186,191,.35)",
                          color: "var(--accent-2)",
                        }}
                      >
                        <span
                          className="dot"
                          style={{
                            background: "var(--accent-2)",
                            boxShadow: "0 0 8px var(--accent-2)",
                          }}
                        />
                        Scheduled
                      </span>
                    ) : (
                      <span
                        className="chip"
                        style={{
                          padding: "3px 8px",
                          background:
                            p.status === "published" && !p.isDirty
                              ? "rgba(45,212,154,.08)"
                              : "rgba(255,180,80,.08)",
                          borderColor:
                            p.status === "published" && !p.isDirty
                              ? "rgba(45,212,154,.25)"
                              : "rgba(255,180,80,.25)",
                          color:
                            p.status === "published" && !p.isDirty
                              ? "#93f1c4"
                              : "#ffd8a0",
                        }}
                      >
                        <span
                          className={`dot ${
                            p.status === "published" && !p.isDirty ? "good" : "warn"
                          }`}
                        />
                        {p.isDirty
                          ? "Draft"
                          : p.status === "published"
                          ? "Published"
                          : "Draft"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 6px", color: "var(--text-3)" }}>
                    {p.scheduledPublishAt
                      ? new Date(p.scheduledPublishAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : p.lastPublishedAt
                      ? new Date(p.lastPublishedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ padding: "12px 6px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <Link
                        href={`/content-pages/${encodeURIComponent(p.slug)}`}
                        className="btn icon ghost"
                        title="Edit"
                      >
                        <Icon name="edit" size={13} />
                      </Link>
                      <a
                        href={`${
                          process.env.NEXT_PUBLIC_PREVIEW_URL ||
                          "http://localhost:3000"
                        }/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn icon ghost"
                        title="Open public page"
                      >
                        <Icon name="globe" size={13} />
                      </a>
                      <button
                        className="btn icon ghost"
                        title="Delete"
                        onClick={() => handleDelete(p.slug)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {isCreateOpen && (
        <CreatePageModal
          existingSlugs={pages.map((p) => p.slug)}
          onClose={() => setIsCreateOpen(false)}
          onCreated={async (slug) => {
            setIsCreateOpen(false);
            await reload();
            window.location.href = `/content-pages/${encodeURIComponent(slug)}`;
          }}
        />
      )}
    </div>
  );
}

function CreatePageModal({
  existingSlugs,
  onClose,
  onCreated,
}: {
  existingSlugs: string[];
  onClose: () => void;
  onCreated: (slug: string) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-derive slug from title until the user manually edits the slug field.
  React.useEffect(() => {
    if (!slugTouched) setSlug(toSlug(title));
  }, [title, slugTouched]);

  const slugTaken = existingSlugs.includes(slug);
  const slugValid = SLUG_RE.test(slug);
  const titleValid = title.trim().length > 0;
  const canSubmit = titleValid && slugValid && !slugTaken && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await contentPagesApi.create({ slug, title: title.trim() });
      onCreated(slug);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(2px)",
        zIndex: 200,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass"
        style={{ width: 460, padding: 24, borderRadius: 14 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--accent-2)",
                letterSpacing: ".16em",
                marginBottom: 4,
              }}
            >
              CONTENT
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>New page</h2>
          </div>
          <button className="btn icon ghost" onClick={onClose} title="Close">
            <Icon name="x" size={14} />
          </button>
        </div>

        <label style={{ display: "block", marginBottom: 14 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: ".14em",
              marginBottom: 6,
            }}
          >
            TITLE
          </div>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Refund Policy"
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,.03)",
              border: "1px solid var(--line)",
              color: "var(--text-1)",
              fontSize: 13,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 6 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: ".14em",
              marginBottom: 6,
            }}
          >
            URL SLUG
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              background: "rgba(255,255,255,.03)",
              border: "1px solid var(--line)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                padding: "9px 8px 9px 12px",
                color: "var(--text-3)",
                fontSize: 13,
              }}
            >
              /
            </span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase());
                setSlugTouched(true);
              }}
              placeholder="refund-policy"
              style={{
                flex: 1,
                padding: "9px 12px 9px 0",
                background: "transparent",
                border: "none",
                color: "var(--text-1)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
        </label>

        <div style={{ minHeight: 18, marginBottom: 14, fontSize: 11.5 }}>
          {slug && !slugValid && (
            <span style={{ color: "#ffb1bd" }}>
              Slug must be lowercase letters, numbers, and hyphens only.
            </span>
          )}
          {slug && slugValid && slugTaken && (
            <span style={{ color: "#ffb1bd" }}>
              A page with this slug already exists.
            </span>
          )}
          {slug && slugValid && !slugTaken && (
            <span style={{ color: "var(--text-3)" }}>
              Will be available at{" "}
              <span className="mono" style={{ color: "var(--accent-2)" }}>
                /{slug}
              </span>
            </span>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: 10,
              marginBottom: 14,
              borderRadius: 8,
              background: "rgba(255,107,128,.08)",
              border: "1px solid rgba(255,107,128,.25)",
              color: "#ffb1bd",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={submit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5 }}
          >
            {submitting ? "Creating…" : "Create page"}
          </button>
        </div>
      </div>
    </div>
  );
}
