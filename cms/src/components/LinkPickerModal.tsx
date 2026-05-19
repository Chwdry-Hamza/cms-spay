"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import {
  contentPagesApi,
  type ContentPageSummary,
} from "@/lib/content-pages-api";

/**
 * Builds the Markdown the picker inserts back into a text field.
 *
 * - Plain internal/external link → `[label](url)`
 * - "Open in new tab" → `[label](url){:newtab}` — the renderer (both CMS
 *   preview and public site) detects this trailing marker and forces
 *   `target="_blank"`. External `http(s)://` URLs are always opened in a
 *   new tab regardless of the marker, so the marker is mostly meaningful
 *   for internal links.
 */
export function buildLinkMarkdown(
  text: string,
  url: string,
  newTab: boolean,
): string {
  const safeText = text.trim() || url;
  const safeUrl = url.trim();
  return `[${safeText}](${safeUrl})${newTab ? "{:newtab}" : ""}`;
}

/**
 * Modal that lets editors compose a link either by pasting a URL or by
 * picking from the list of existing content pages. Mirrors the
 * `AddSectionModal` styling so the editor feels consistent.
 *
 * Behaviour:
 * - On open, fetches the full content-pages directory once and caches it
 *   for subsequent openings (the list is small).
 * - The "URL / page" input doubles as the search box: typing a query
 *   filters the page list by title or slug.
 * - Selecting a page from the list fills the URL field with `/{slug}` so
 *   the editor still has a chance to tweak it (e.g. add `#section`).
 */
export function LinkPickerModal({
  open,
  initialText,
  initialUrl,
  initialNewTab,
  onClose,
  onInsert,
}: {
  open: boolean;
  initialText: string;
  initialUrl: string;
  initialNewTab: boolean;
  onClose: () => void;
  onInsert: (text: string, url: string, newTab: boolean) => void;
}) {
  const [linkText, setLinkText] = React.useState(initialText);
  const [url, setUrl] = React.useState(initialUrl);
  const [newTab, setNewTab] = React.useState(initialNewTab);
  const [pages, setPages] = React.useState<ContentPageSummary[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Hydrate fields each time the modal opens so each insertion starts from
  // whatever the caller pre-filled (current selection / cursor context).
  React.useEffect(() => {
    if (!open) return;
    setLinkText(initialText);
    setUrl(initialUrl);
    setNewTab(initialNewTab);
  }, [open, initialText, initialUrl, initialNewTab]);

  // Fetch the directory the first time the modal opens, then cache it. The
  // list is light (slug + title + status) so we don't bother re-fetching.
  React.useEffect(() => {
    if (!open || pages !== null) return;
    let cancelled = false;
    contentPagesApi
      .list()
      .then(({ pages: rows }) => {
        if (cancelled) return;
        setPages(rows);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [open, pages]);

  // Esc closes the modal.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const query = url.trim().toLowerCase();
  const filteredPages = (pages ?? []).filter((p) => {
    if (!query) return true;
    // Match against both title and slug so editors can search either way.
    return (
      p.title.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      `/${p.slug}`.startsWith(query)
    );
  });

  const canInsert = url.trim().length > 0;

  const handleInsert = () => {
    if (!canInsert) return;
    onInsert(linkText, url.trim(), newTab);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
        background: "rgba(2,6,16,.7)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "calc(100vh - 64px)",
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
                "linear-gradient(135deg, var(--accent-2), var(--accent))",
              display: "grid",
              placeItems: "center",
              color: "#001819",
              boxShadow: "0 0 16px -2px rgba(4,186,191,.6)",
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
            <span style={{ fontSize: 14, fontWeight: 600 }}>Insert link</span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              Paste a URL or pick from your existing content pages.
            </span>
          </div>
          <button
            className="btn icon ghost"
            onClick={onClose}
            title="Close (Esc)"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div
          className="nice-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 18px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Link text */}
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
              Link text
            </div>
            <input
              className="input small"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="e.g. read our privacy policy"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInsert();
              }}
            />
            <div
              style={{
                fontSize: 10.5,
                color: "var(--text-3)",
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              The visible anchor text. Defaults to the URL if blank.
            </div>
          </div>

          {/* URL / search */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  color: "var(--accent-2)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                URL or page
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 9.5,
                  color: "var(--text-3)",
                  letterSpacing: ".08em",
                }}
              >
                {pages
                  ? `${filteredPages.length}/${pages.length} pages`
                  : "Loading…"}
              </span>
            </div>
            <input
              className="input small"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/about, https://example.com, or search…"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInsert();
              }}
            />
          </div>

          {/* Page directory */}
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 10,
              background: "rgba(255,255,255,.02)",
              maxHeight: 260,
              overflowY: "auto",
            }}
            className="nice-scroll"
          >
            {loadError ? (
              <div
                style={{
                  padding: 14,
                  fontSize: 12,
                  color: "#ffb1bd",
                }}
              >
                Could not load pages: {loadError}
              </div>
            ) : pages === null ? (
              <div
                style={{
                  padding: 14,
                  fontSize: 12,
                  color: "var(--text-3)",
                }}
              >
                Loading content pages…
              </div>
            ) : filteredPages.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  fontSize: 12,
                  color: "var(--text-3)",
                  lineHeight: 1.55,
                }}
              >
                {pages.length === 0
                  ? "No content pages yet. You can still paste an external URL above."
                  : "No matches. Try a different search term, or just paste a URL above."}
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                {filteredPages.map((p) => {
                  const selected = url.trim().toLowerCase() === `/${p.slug}`;
                  return (
                    <li key={p.slug}>
                      <button
                        onClick={() => {
                          setUrl(`/${p.slug}`);
                          // First time the editor picks a page, default the
                          // anchor text to the page title — saves typing.
                          if (!linkText.trim()) setLinkText(p.title);
                        }}
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
                            background: "rgba(4,186,191,.10)",
                            color: "var(--accent-2)",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon name="pages" size={12} />
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
            )}
          </div>

          {/* Open in new tab */}
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 9,
              background: "rgba(255,255,255,.02)",
              border: "1px solid var(--line)",
              fontSize: 13,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={newTab}
              onChange={(e) => setNewTab(e.target.checked)}
            />
            <span>Open in a new tab</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "var(--text-3)",
              }}
            >
              External links open in a new tab automatically.
            </span>
          </label>
        </div>

        {/* Footer actions */}
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
            onClick={onClose}
            style={{ padding: "8px 14px", fontSize: 12.5 }}
          >
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleInsert}
            disabled={!canInsert}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              opacity: canInsert ? 1 : 0.5,
            }}
          >
            <Icon name="plus" size={12} />
            Insert link
          </button>
        </div>
      </div>
    </div>
  );
}
