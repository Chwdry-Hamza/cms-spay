"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import type {
  ContentPageBacklink,
  ContentPageSummary,
} from "@/lib/content-pages-api";

/**
 * Modal opened when the editor tries to delete a content page that other
 * pages currently link to. The plain DELETE call fails fast on the backend
 * with `BACKLINKS_PRESENT` — that error response carries the offending
 * backlink rows, which we surface here alongside a target picker.
 *
 * Forcing a delete is intentionally NOT a UI affordance in Phase 2: the
 * SEO team's spec is "warning OR redirect suggestion", and quietly
 * breaking N inbound links is exactly the failure mode this whole
 * feature exists to prevent. Admin override is available via the API
 * (`DELETE …?force=true`) for emergencies.
 */
export function DeleteWithRedirectModal({
  open,
  slug,
  backlinks,
  candidatePages,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  slug: string;
  backlinks: ContentPageBacklink[];
  /** Every other content page in the workspace — used as redirect targets. */
  candidatePages: ContentPageSummary[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: (redirectTo: string) => void;
}) {
  const [redirectTo, setRedirectTo] = React.useState<string>("");

  // Reset the chosen target each time the modal opens so previous picks
  // don't leak across delete attempts.
  React.useEffect(() => {
    if (open) setRedirectTo("");
  }, [open]);

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
  const eligibleTargets = candidatePages.filter((p) => p.slug !== slug);
  const canConfirm = redirectTo.length > 0 && !busy;

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
          maxWidth: 580,
          maxHeight: "calc(100vh - 104px)",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, rgba(13,20,38,.96), rgba(9,14,28,.96))",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(255,107,128,.05)",
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
                "linear-gradient(135deg, rgba(255,107,128,.95), rgba(255,107,128,.55))",
              display: "grid",
              placeItems: "center",
              color: "#1a0008",
              boxShadow: "0 0 16px -2px rgba(255,107,128,.5)",
            }}
          >
            <Icon name="trash" size={15} />
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
              {backlinks.length} page{backlinks.length === 1 ? "" : "s"} link
              to <span className="mono">/{slug}</span>
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              Pick a redirect target so those inbound links keep working
              after deletion.
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
            // Flex children default to `min-height: auto`, which means they
            // refuse to shrink below their intrinsic content height — that's
            // what was pushing the footer below the viewport. `minHeight: 0`
            // lets this body actually scroll inside the modal's maxHeight
            // box so the footer stays anchored.
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
              background: "rgba(255,107,128,.05)",
              border: "1px solid rgba(255,107,128,.25)",
              fontSize: 12,
              color: "#ffd2d8",
              lineHeight: 1.55,
            }}
          >
            Deleting this page would orphan <strong>{totalLinks}</strong>{" "}
            internal link{totalLinks === 1 ? "" : "s"} across{" "}
            <strong>{backlinks.length}</strong> other page
            {backlinks.length === 1 ? "" : "s"}. Picking a redirect target
            will <strong>rewrite</strong> those pages so their links point
            at the chosen page directly, and also create a{" "}
            <strong>308 redirect</strong> from{" "}
            <span className="mono">/{slug}</span> as a safety net for
            external inbound links.
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
              Pages linking here
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 130,
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
              Redirect target
            </div>
            {eligibleTargets.length === 0 ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px dashed var(--line)",
                  fontSize: 12,
                  color: "var(--text-3)",
                  lineHeight: 1.55,
                }}
              >
                No other content pages exist yet. Create one before deleting
                this page, or use the API directly with{" "}
                <span className="mono">?force=true</span>.
              </div>
            ) : (
              // Clickable scrollable list — mirrors the LinkPickerModal's
              // page directory so the dark theme is consistent and the
              // options are visible (native <select> popovers can't be
              // styled and look out of place in this UI).
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  background: "rgba(255,255,255,.02)",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
                className="nice-scroll"
              >
                <ul
                  style={{ listStyle: "none", margin: 0, padding: 0 }}
                >
                  {eligibleTargets.map((p) => {
                    const selected = redirectTo === p.slug;
                    return (
                      <li key={p.slug}>
                        <button
                          onClick={() => setRedirectTo(p.slug)}
                          style={{
                            all: "unset",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "10px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid var(--line)",
                            background: selected
                              ? "rgba(4,186,191,.08)"
                              : "transparent",
                            transition: "background .12s",
                            boxSizing: "border-box",
                          }}
                          onMouseEnter={(e) => {
                            if (!selected)
                              e.currentTarget.style.background =
                                "rgba(255,255,255,.03)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = selected
                              ? "rgba(4,186,191,.08)"
                              : "transparent";
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              background: selected
                                ? "rgba(4,186,191,.18)"
                                : "rgba(4,186,191,.10)",
                              color: "var(--accent-2)",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon
                              name={selected ? "check" : "pages"}
                              size={12}
                            />
                          </span>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.title}
                            </span>
                            <span
                              className="mono"
                              style={{
                                fontSize: 10.5,
                                color: "var(--text-3)",
                                letterSpacing: ".06em",
                              }}
                            >
                              /{p.slug}
                            </span>
                          </div>
                          <span
                            className={`chip ${
                              p.status === "published" ? "good" : "warn"
                            }`}
                            style={{
                              padding: "2px 8px",
                              fontSize: 9.5,
                              letterSpacing: ".06em",
                            }}
                          >
                            {p.status === "published" ? "PUB" : "DRAFT"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
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
            className="btn primary"
            onClick={() => onConfirm(redirectTo)}
            disabled={!canConfirm}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              opacity: canConfirm ? 1 : 0.5,
              background:
                "linear-gradient(180deg, rgba(255,107,128,.95), rgba(255,107,128,.7))",
              borderColor: "rgba(255,107,128,.7)",
              color: "#1a0008",
            }}
            title="Rewrites all backlinks to point at the chosen page, creates a 308 redirect, then deletes this page"
          >
            <Icon name="trash" size={12} />
            {busy
              ? "Deleting…"
              : `Delete & rewrite links to /${redirectTo || "…"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
