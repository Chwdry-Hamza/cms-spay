"use client";

import * as React from "react";
import Icon from "./Icon";

export type HistoryRevisionKind = "autosave" | "manualSave" | "publish";

export type HistoryRevision = {
  id: string;
  kind: HistoryRevisionKind;
  version: number;
  note: string;
  authorId: string | null;
  createdAt: string;
};

/**
 * Slide-in panel from the right that lists a page's revision history.
 * Used by both the Content Pages editor and the Landing Page Builder —
 * each calls in with its own fetcher + restore handler.
 *
 * The panel keeps its data in-component, so opening it triggers a fresh
 * list fetch and restoring kicks off a `onRestore` callback that the
 * parent handles (parent reloads the page state).
 */
export function HistoryPanel({
  open,
  onClose,
  fetchRevisions,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  fetchRevisions: () => Promise<HistoryRevision[]>;
  onRestore: (revisionId: string) => Promise<void>;
}) {
  const [revisions, setRevisions] = React.useState<HistoryRevision[] | null>(
    null,
  );
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  // Load whenever the panel opens. Re-fetch each time to pick up any new
  // autosaves that happened while it was closed.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadError(null);
    setRevisions(null);
    fetchRevisions()
      .then((rows) => {
        if (cancelled) return;
        setRevisions(rows);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [open, fetchRevisions]);

  // Esc closes the panel.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleRestore = async (rev: HistoryRevision) => {
    const label = formatTimestamp(rev.createdAt);
    if (
      !window.confirm(
        `Restore "${label}"?\n\nThe current draft will be replaced with this revision's content. You'll still need to Save or Publish afterwards.`,
      )
    ) {
      return;
    }
    setRestoringId(rev.id);
    try {
      await onRestore(rev.id);
      onClose();
    } catch (e) {
      window.alert(`Restore failed: ${(e as Error).message}`);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(4px)",
            zIndex: 199,
          }}
        />
      )}

      {/* Slide-in panel */}
      <aside
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: "100vw",
          background: "linear-gradient(180deg, rgba(14,46,46,.55), rgba(9,14,28,.95))",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid var(--line-2)",
          boxShadow: "0 30px 80px -10px rgba(0,0,0,.6)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .25s ease",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
              color: "#001819",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 14px -2px rgba(4,186,191,.6)",
            }}
          >
            <Icon name="history" size={13} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Revision history</div>
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                color: "var(--text-3)",
                letterSpacing: ".1em",
              }}
            >
              LAST 50 SNAPSHOTS
            </div>
          </div>
          <button
            className="btn icon ghost"
            onClick={onClose}
            title="Close"
            style={{ width: 28, height: 28 }}
          >
            <Icon name="x" size={13} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 60px" }}>
          {loadError && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "rgba(255,107,128,.08)",
                border: "1px solid rgba(255,107,128,.25)",
                color: "#ffb1bd",
                fontSize: 12.5,
              }}
            >
              Could not load history: {loadError}
            </div>
          )}
          {!loadError && revisions === null && (
            <div style={{ color: "var(--text-3)", fontSize: 12, padding: 8 }}>
              Loading…
            </div>
          )}
          {revisions && revisions.length === 0 && (
            <div
              style={{
                padding: 28,
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 12.5,
                lineHeight: 1.55,
              }}
            >
              No revisions yet. Snapshots are created automatically on each
              save and publish.
            </div>
          )}
          {revisions && revisions.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {revisions.map((r, idx) => (
                <li
                  key={r.id}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,.02)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <KindChip kind={r.kind} />
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        letterSpacing: ".1em",
                      }}
                    >
                      v{r.version}
                    </span>
                    {idx === 0 && (
                      <span
                        className="mono"
                        style={{
                          fontSize: 9.5,
                          color: "var(--accent-2)",
                          letterSpacing: ".14em",
                          marginLeft: "auto",
                        }}
                      >
                        LATEST
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>
                    {formatTimestamp(r.createdAt)}
                  </div>
                  {r.note && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-3)",
                        lineHeight: 1.45,
                        fontStyle: "italic",
                      }}
                    >
                      {r.note}
                    </div>
                  )}
                  <button
                    className="btn"
                    onClick={() => handleRestore(r)}
                    disabled={restoringId !== null}
                    style={{
                      alignSelf: "flex-start",
                      padding: "5px 12px",
                      fontSize: 11.5,
                      marginTop: 2,
                      opacity:
                        restoringId !== null && restoringId !== r.id ? 0.5 : 1,
                    }}
                  >
                    <Icon name="history" size={11} />
                    {restoringId === r.id ? "Restoring…" : "Restore"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

function KindChip({ kind }: { kind: HistoryRevisionKind }) {
  const styling: Record<
    HistoryRevisionKind,
    { label: string; bg: string; border: string; color: string }
  > = {
    publish: {
      label: "Published",
      bg: "rgba(45,212,154,.08)",
      border: "rgba(45,212,154,.3)",
      color: "#93f1c4",
    },
    manualSave: {
      label: "Manual save",
      bg: "rgba(4,186,191,.08)",
      border: "rgba(4,186,191,.3)",
      color: "var(--accent-2)",
    },
    autosave: {
      label: "Autosave",
      bg: "rgba(140,170,180,.08)",
      border: "var(--line)",
      color: "var(--text-3)",
    },
  };
  const s = styling[kind];
  return (
    <span
      className="chip"
      style={{
        padding: "2px 7px",
        fontSize: 10,
        background: s.bg,
        borderColor: s.border,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
