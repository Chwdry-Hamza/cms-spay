"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { Card } from "@/components/Card";
import {
  BUNDLED_ASSETS,
  MAX_FILE_BYTES,
  type UploadedItem,
  formatBytes,
  loadUploaded,
  readAsDataURL,
  saveUploaded,
  validateImageFile,
} from "@/lib/media";

export default function MediaView() {
  const [uploaded, setUploaded] = React.useState<UploadedItem[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Hydrate from localStorage on mount.
  React.useEffect(() => {
    setUploaded(loadUploaded());
  }, []);

  // Auto-dismiss toast after a short delay.
  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const persist = (next: UploadedItem[]) => {
    setUploaded(next);
    saveUploaded(next);
  };

  const ingestFiles = async (files: FileList | File[] | null | undefined) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const accepted: File[] = [];
    let firstError: string | null = null;
    for (const f of list) {
      const err = validateImageFile(f);
      if (err) {
        if (!firstError) firstError = err;
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length === 0) {
      setError(firstError ?? "Only image files up to 6 MB are accepted.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const items: UploadedItem[] = await Promise.all(
        accepted.map(async (f) => ({
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: await readAsDataURL(f),
          uploadedAt: Date.now(),
        })),
      );
      persist([...items, ...uploaded]);
    } catch {
      setError("Failed to read one or more files.");
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`Copied ${label}`);
    } catch {
      setToast("Copy failed");
    }
  };

  const deleteUploaded = (id: string) => {
    persist(uploaded.filter((u) => u.id !== id));
  };

  // Total localStorage footprint is roughly the sum of base64 dataUrl lengths.
  const usedBytes = uploaded.reduce((acc, u) => acc + u.dataUrl.length, 0);

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card padding={0} style={{ overflow: "hidden" }}>
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

        {/* Upload zone — click anywhere or drag-and-drop. */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
            e.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            ingestFiles(e.dataTransfer.files);
          }}
          style={{
            padding: 28,
            display: "flex",
            alignItems: "center",
            gap: 18,
            cursor: busy ? "wait" : "pointer",
            background: dragOver
              ? "rgba(4,186,191,.10)"
              : "repeating-linear-gradient(135deg, rgba(4,186,191,.03), rgba(4,186,191,.03) 10px, transparent 10px, transparent 20px)",
            borderBottom: "1px dashed rgba(4,186,191,.25)",
            transition: "background .15s ease",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(4,186,191,.1)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 24px -6px rgba(4,186,191,.5)",
              flexShrink: 0,
            }}
          >
            <Icon name="upload" size={22} style={{ color: "var(--accent-2)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>
              {busy ? "Reading files…" : "Drop images here, or click to browse"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
              PNG · JPG · SVG · WEBP up to 6 MB · Stored locally for use across sections
            </div>
            {error && (
              <div style={{ fontSize: 11.5, color: "var(--bad, #ff6b80)", marginTop: 6 }}>
                {error}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".14em" }}>
              UPLOADED
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {uploaded.length} {uploaded.length === 1 ? "item" : "items"} · {formatBytes(usedBytes)}
            </div>
          </div>
        </div>

        {/* User uploads (most recent first). */}
        {uploaded.length > 0 && (
          <div style={{ padding: 16 }}>
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                color: "var(--text-3)",
                letterSpacing: ".14em",
                marginBottom: 10,
              }}
            >
              YOUR UPLOADS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {uploaded.map((u) => (
                <AssetTile
                  key={u.id}
                  src={u.dataUrl}
                  name={u.name}
                  meta={`${u.type.replace("image/", "").toUpperCase()} · ${formatBytes(u.size)}`}
                  onCopyUrl={() => copyToClipboard(u.dataUrl, "data URL")}
                  onDelete={() => deleteUploaded(u.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bundled defaults so users always have a starter palette. */}
        <div style={{ padding: 16, paddingTop: uploaded.length > 0 ? 0 : 16 }}>
          <div
            className="mono"
            style={{
              fontSize: 9.5,
              color: "var(--text-3)",
              letterSpacing: ".14em",
              marginBottom: 10,
            }}
          >
            BUNDLED ASSETS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {BUNDLED_ASSETS.map((it) => {
              const path = `/${it.name}`;
              const type = (it.name.split(".").pop() || "").toUpperCase();
              return (
                <AssetTile
                  key={it.name}
                  src={path}
                  name={it.name}
                  meta={`${type} · ${it.size}`}
                  onCopyUrl={() => copyToClipboard(path, "path")}
                />
              );
            })}
          </div>
        </div>
      </Card>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(4,186,191,.15)",
            border: "1px solid rgba(4,186,191,.4)",
            color: "var(--text)",
            fontSize: 12.5,
            zIndex: 200,
            boxShadow: "0 20px 60px -10px rgba(0,0,0,.6)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="check" size={13} style={{ color: "var(--accent-2)" }} />
          {toast}
        </div>
      )}
    </div>
  );
}

function AssetTile({
  src,
  name,
  meta,
  onCopyUrl,
  onDelete,
}: {
  src: string;
  name: string;
  meta: string;
  onCopyUrl: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--line)",
        background: "rgba(9,14,28,.4)",
        transition: "transform .15s ease, border-color .15s ease",
        position: "relative",
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: 8,
            background:
              "linear-gradient(to top, rgba(9,14,28,.85), rgba(9,14,28,0) 50%)",
            opacity: 0,
            transition: "opacity .15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <button
            className="btn icon"
            title="Copy URL"
            onClick={(e) => {
              e.stopPropagation();
              onCopyUrl();
            }}
            style={{ width: 28, height: 28 }}
          >
            <Icon name="link" size={12} />
          </button>
          {onDelete && (
            <button
              className="btn icon"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ width: 28, height: 28 }}
            >
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <div
          style={{
            fontSize: 11.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
          title={name}
        >
          {name}
        </div>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)" }}>
          {meta}
        </div>
      </div>
    </div>
  );
}
