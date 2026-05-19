"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import type { ContentPageBacklink } from "@/lib/content-pages-api";

/**
 * Modal shown when an editor renames the slug of a page that other pages
 * currently link to. Gives the editor three choices:
 *
 *   1. **Rewrite all backlinks** — every internal link pointing at the old
 *      slug is updated to point at the new slug, in one bulk operation.
 *      A 308 redirect is *also* created automatically (existing behaviour)
 *      so any inbound links we don't know about (external posts, search
 *      results) keep resolving.
 *
 *   2. **Just rename** — the rename + 308 redirect happens; the affected
 *      pages keep their literal `/old-slug` text, so they hop through the
 *      redirect when followed. Cheap fix, but Google notes the chain.
 *
 *   3. **Cancel** — no change.
 *
 * The component is purely presentational: the parent (`ContentPageEditorView`)
 * holds the in-flight save state and decides what each button does. We just
 * surface the choice with enough context (page count + names) so the editor
 * can make an informed call.
 */
export function SlugRenameConfirmModal({
  open,
  fromSlug,
  toSlug,
  backlinks,
  intent,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  fromSlug: string;
  toSlug: string;
  backlinks: ContentPageBacklink[];
  /** Whether this rename is being applied via Save draft or Publish — only
   *  affects button label so the editor sees the action they triggered. */
  intent: "save" | "publish";
  busy: boolean;
  onCancel: () => void;
  onConfirm: (rewriteBacklinks: boolean) => void;
}) {
  // Esc closes the modal — unless we're mid-save, in which case ignore so
  // the user doesn't accidentally cancel halfway through.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const totalLinks = backlinks.reduce((acc, b) => acc + b.links.length, 0);
  const confirmLabel = intent === "publish" ? "Publish" : "Save";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 260,
        background: "rgba(2,6,16,.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 24px 24px",
        overflowY: "auto",
      }}
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "calc(100vh - 104px)",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, rgba(13,20,38,.96), rgba(9,14,28,.96))",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(4,186,191,.05)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 18px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background:
                "linear-gradient(135deg, rgba(245,176,66,.95), rgba(245,176,66,.55))",
              display: "grid",
              placeItems: "center",
              color: "#1a0d00",
              boxShadow: "0 0 16px -2px rgba(245,176,66,.5)",
            }}
          >
            <Icon name="globe" size={15} />
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {backlinks.length} page{backlinks.length === 1 ? "" : "s"} link to{" "}
              <span className="mono">/{fromSlug}</span>
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              Renaming to <span className="mono">/{toSlug}</span>. Keep the
              backlinks working too, or just rename?
            </span>
          </div>
          <button
            className="btn icon ghost"
            onClick={onCancel}
            disabled={busy}
            title="Cancel (Esc)"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div
          className="nice-scroll"
          style={{
            flex: 1,
            // Lets the body shrink past its intrinsic content height so its
            // own `overflowY: auto` engages and the footer stays anchored —
            // without this, long backlink lists push the action buttons
            // below the viewport.
            minHeight: 0,
            overflowY: "auto",
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "rgba(4,186,191,.04)",
              border: "1px solid rgba(4,186,191,.18)",
              fontSize: 12,
              color: "var(--text-2)",
              lineHeight: 1.55,
            }}
          >
            A <strong>308 redirect</strong> from <span className="mono">/{fromSlug}</span>{" "}
            → <span className="mono">/{toSlug}</span> will be created either
            way, so external inbound links keep working. The choice below is
            about whether to also rewrite the literal text inside the{" "}
            {backlinks.length} page{backlinks.length === 1 ? "" : "s"} that
            currently mentions <span className="mono">/{fromSlug}</span> — this
            avoids redirect chains and is the SEO-cleanest outcome.
          </div>

          <div>
            <div
              style={{
                fontSize: 10.5,
                color: "var(--accent-2)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Will be rewritten ({totalLinks} link
              {totalLinks === 1 ? "" : "s"})
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 220,
                overflowY: "auto",
              }}
              className="nice-scroll"
            >
              {backlinks.map((b) => (
                <li
                  key={b.slug}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    background: "rgba(255,255,255,.02)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 500,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.title}
                    </span>
                    <span
                      className={`chip ${
                        b.status === "published" ? "good" : "warn"
                      }`}
                      style={{
                        padding: "1px 6px",
                        fontSize: 9,
                        letterSpacing: ".06em",
                      }}
                    >
                      {b.status === "published" ? "PUB" : "DRAFT"}
                    </span>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: ".06em",
                    }}
                  >
                    /{b.slug} · {b.links.length} link
                    {b.links.length === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 18px",
            borderTop: "1px solid var(--line)",
            background: "rgba(0,0,0,.15)",
          }}
        >
          <button
            className="btn"
            onClick={onCancel}
            disabled={busy}
            style={{ padding: "8px 14px", fontSize: 12.5 }}
          >
            Cancel
          </button>
          <button
            className="btn"
            onClick={() => onConfirm(false)}
            disabled={busy}
            style={{ padding: "8px 14px", fontSize: 12.5 }}
            title="The 308 redirect handles the rename. Existing pages keep their old link text and hop through the redirect."
          >
            {busy ? "Working…" : `${confirmLabel} — keep redirect only`}
          </button>
          <button
            className="btn primary"
            onClick={() => onConfirm(true)}
            disabled={busy}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              opacity: busy ? 0.6 : 1,
            }}
            title="Recommended: rewrites every page that links to this one, so no redirect hop. Each rewritten page becomes a draft."
          >
            <Icon name="globe" size={12} />
            {busy
              ? "Rewriting…"
              : `${confirmLabel} & rewrite ${backlinks.length} page${
                  backlinks.length === 1 ? "" : "s"
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
