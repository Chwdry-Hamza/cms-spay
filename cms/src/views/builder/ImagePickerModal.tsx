"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import {
  BUNDLED_ASSETS,
  type UploadedItem,
  formatBytes,
  ingestFile,
  loadUploaded,
  saveUploaded,
  validateImageFile,
  MAX_FILE_BYTES,
} from "@/lib/media";

/**
 * Modal that lets the user pick an image for an inspector field. They can
 * either:
 *   - reuse a previously-uploaded image from the local media library
 *   - reuse a bundled asset shipped in spay-website/public/
 *   - upload a new image from their device
 *
 * Whatever they pick is returned via `onSelect(url)` — that URL is either a
 * `/path/to/file.png` (bundled) or a `data:image/...;base64,...` (uploaded).
 * Both work as-is in `next/image` (unoptimized) and the inspector's preview.
 */
export function ImagePickerModal({
  currentSrc,
  onSelect,
  onClose,
}: {
  currentSrc?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  type Tab = "library" | "bundled" | "upload";
  const [tab, setTab] = React.useState<Tab>("library");
  const [uploads, setUploads] = React.useState<UploadedItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Hydrate uploads on open. If the user uploads while the modal is open
  // we'll bump this state directly.
  React.useEffect(() => {
    const list = loadUploaded();
    setUploads(list);
    // Auto-route to whichever tab has content so the modal feels useful on
    // first open.
    if (list.length === 0) setTab("bundled");
  }, []);

  // Close on Escape for keyboard parity with other modals.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filteredUploads = uploads.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredBundled = BUNDLED_ASSETS.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()),
  );

  const ingestFiles = async (files: FileList | File[] | null | undefined) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setError(null);
    setBusy(true);
    try {
      const created: UploadedItem[] = [];
      for (const f of list) {
        const err = validateImageFile(f);
        if (err) {
          setError(err);
          continue;
        }
        const item = await ingestFile(f);
        created.push(item);
      }
      if (created.length > 0) {
        // Re-read from storage so we stay in sync with anything else that
        // wrote to it (e.g. the Media library page in another tab).
        setUploads(loadUploaded());
        // Auto-select the first newly uploaded image — feels like a one-click
        // flow: click slot → upload → done.
        onSelect(created[0].dataUrl);
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file");
    } finally {
      setBusy(false);
    }
  };

  const deleteUpload = (id: string) => {
    const next = uploads.filter((u) => u.id !== id);
    setUploads(next);
    saveUploaded(next);
  };

  // ESC + click-outside both close.
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(3, 6, 14, 0.65)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        animation: "fadeIn .2s ease",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass glow-border"
        style={{
          width: "min(820px, 100%)",
          maxHeight: "min(720px, 90vh)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          boxShadow: "0 40px 100px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(4,186,191,.1)",
          animation: "fadeIn .25s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 3 }}
            >
              IMAGE PICKER
            </div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Choose an image</div>
          </div>
          <button className="btn icon ghost" onClick={onClose} title="Close (Esc)">
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Tab strip — its own row so the Upload tab never gets clipped on
            narrow viewports. The strip itself scrolls horizontally as a
            fallback if a future tab is added and the modal is very narrow. */}
        <div
          style={{
            padding: "12px 22px 0",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <div
            className="tab-strip nice-scroll"
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              flexShrink: 0,
            }}
          >
            <button
              className={tab === "library" ? "on" : ""}
              style={{ fontSize: 12, whiteSpace: "nowrap" }}
              onClick={() => setTab("library")}
            >
              <Icon name="image" size={12} /> Library
              <span
                className="mono"
                style={{
                  marginLeft: 6,
                  padding: "1px 6px",
                  borderRadius: 999,
                  fontSize: 9,
                  background: "rgba(255,255,255,.06)",
                  color: "var(--text-3)",
                }}
              >
                {uploads.length}
              </span>
            </button>
            <button
              className={tab === "bundled" ? "on" : ""}
              style={{ fontSize: 12, whiteSpace: "nowrap" }}
              onClick={() => setTab("bundled")}
            >
              <Icon name="grid" size={12} /> Bundled
            </button>
            <button
              className={tab === "upload" ? "on" : ""}
              style={{ fontSize: 12, whiteSpace: "nowrap" }}
              onClick={() => setTab("upload")}
            >
              <Icon name="upload" size={12} /> Upload
            </button>
          </div>
        </div>

        {/* Filter search — separate row, hidden on the Upload tab where
            it's irrelevant. Sits flush below the tab strip so the layout
            stays vertically compact. */}
        {tab !== "upload" && (
          <div
            style={{
              padding: "10px 22px 12px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon
                name="search"
                size={13}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-3)",
                }}
              />
              <input
                className="input small"
                placeholder="Filter by name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 28, fontSize: 12, width: "100%" }}
              />
            </div>
          </div>
        )}
        {tab === "upload" && (
          <div style={{ height: 12, borderBottom: "1px solid var(--line)" }} />
        )}

        {/* Body */}
        <div
          className="nice-scroll"
          style={{ flex: 1, overflowY: "auto", padding: 18, minHeight: 280 }}
        >
          {tab === "library" && (
            <LibraryGrid
              items={filteredUploads}
              currentSrc={currentSrc}
              empty={
                uploads.length === 0
                  ? "Nothing uploaded yet. Switch to Upload to add your first image."
                  : "No matches for your filter."
              }
              onSelect={(u) => {
                onSelect(u.dataUrl);
                onClose();
              }}
              onDelete={deleteUpload}
            />
          )}

          {tab === "bundled" && (
            <BundledGrid
              names={filteredBundled}
              currentSrc={currentSrc}
              empty="No matches for your filter."
              onSelect={(path) => {
                onSelect(path);
                onClose();
              }}
            />
          )}

          {tab === "upload" && (
            <UploadPane
              busy={busy}
              dragOver={dragOver}
              error={error}
              onBrowse={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                ingestFiles(e.dataTransfer.files);
              }}
            />
          )}
        </div>

        {/* Hidden file input — always mounted so we can trigger from the
            Upload tab and from drag-and-drop fallback. */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            ingestFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {/* Footer */}
        <div
          style={{
            padding: "10px 22px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          <span>
            Max {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB per file · stored locally
          </span>
          <button className="btn" onClick={onClose} style={{ padding: "6px 14px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function LibraryGrid({
  items,
  currentSrc,
  empty,
  onSelect,
  onDelete,
}: {
  items: UploadedItem[];
  currentSrc?: string;
  empty: string;
  onSelect: (item: UploadedItem) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) return <EmptyState text={empty} />;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 10,
      }}
    >
      {items.map((u) => (
        <Tile
          key={u.id}
          src={u.dataUrl}
          name={u.name}
          meta={`${u.type.replace("image/", "").toUpperCase()} · ${formatBytes(u.size)}`}
          selected={currentSrc === u.dataUrl}
          onClick={() => onSelect(u)}
          onDelete={() => onDelete(u.id)}
        />
      ))}
    </div>
  );
}

function BundledGrid({
  names,
  currentSrc,
  empty,
  onSelect,
}: {
  names: { name: string; size: string }[];
  currentSrc?: string;
  empty: string;
  onSelect: (path: string) => void;
}) {
  if (names.length === 0) return <EmptyState text={empty} />;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 10,
      }}
    >
      {names.map((a) => {
        const path = `/${a.name}`;
        const ext = (a.name.split(".").pop() || "").toUpperCase();
        return (
          <Tile
            key={a.name}
            src={path}
            name={a.name}
            meta={`${ext} · ${a.size}`}
            selected={currentSrc === path}
            onClick={() => onSelect(path)}
          />
        );
      })}
    </div>
  );
}

function UploadPane({
  busy,
  dragOver,
  error,
  onBrowse,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  busy: boolean;
  dragOver: boolean;
  error: string | null;
  onBrowse: () => void;
  onDragOver: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onBrowse}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onBrowse();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        minHeight: 240,
        borderRadius: 14,
        border: `2px dashed ${dragOver ? "rgba(4,186,191,.65)" : "rgba(4,186,191,.3)"}`,
        background: dragOver
          ? "rgba(4,186,191,.10)"
          : "rgba(4,186,191,.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 32,
        cursor: busy ? "wait" : "pointer",
        transition: "background .15s ease, border-color .15s ease",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "rgba(4,186,191,.12)",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 0 24px -6px rgba(4,186,191,.5)",
        }}
      >
        <Icon name="upload" size={22} style={{ color: "var(--accent-2)" }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>
        {busy ? "Reading…" : "Drop files here, or click to browse"}
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".12em" }}>
        PNG · JPG · SVG · WEBP · MAX {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB
      </div>
      {error && (
        <div style={{ fontSize: 11.5, color: "var(--bad, #ff6b80)", marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

function Tile({
  src,
  name,
  meta,
  selected,
  onClick,
  onDelete,
}: {
  src: string;
  name: string;
  meta: string;
  selected?: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: selected ? "2px solid var(--accent-2)" : "1px solid var(--line)",
        background: "rgba(9,14,28,.4)",
        cursor: "pointer",
        position: "relative",
        transition: "transform .15s ease, border-color .15s ease",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          aspectRatio: "4/3",
          position: "relative",
          background: "#0a1322",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {selected && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "var(--accent-2)",
              color: "#001819",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".08em",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            CURRENT
          </div>
        )}
        {onDelete && hover && (
          <button
            className="btn icon"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24 }}
          >
            <Icon name="x" size={11} />
          </button>
        )}
      </div>
      <div style={{ padding: 8 }}>
        <div
          style={{
            fontSize: 11,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
          title={name}
        >
          {name}
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>
          {meta}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        minHeight: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: "var(--text-3)",
        fontSize: 13,
        textAlign: "center",
        padding: 24,
      }}
    >
      <Icon name="image" size={28} style={{ opacity: 0.4 }} />
      <div style={{ maxWidth: 360 }}>{text}</div>
    </div>
  );
}
