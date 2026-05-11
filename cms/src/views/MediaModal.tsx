"use client";
import * as React from "react";
import Icon from "@/components/Icon";

type FileItem = { name: string; size: string; progress: number; status: "uploading" | "done" };

export default function MediaModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = React.useState<FileItem[]>([
    { name: "hero-banner-2026.jpg", size: "2.4 MB", progress: 100, status: "done" },
    { name: "team-offsite-photo.jpg", size: "4.8 MB", progress: 72, status: "uploading" },
    { name: "product-demo.png", size: "1.1 MB", progress: 100, status: "done" },
  ]);

  React.useEffect(() => {
    const t = setInterval(() => {
      setFiles((fs) =>
        fs.map((f) =>
          f.status === "uploading"
            ? {
                ...f,
                progress: Math.min(100, f.progress + 4),
                status: f.progress >= 96 ? "done" : "uploading",
              }
            : f
        )
      );
    }, 250);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
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
          width: "min(640px, 100%)",
          padding: 24,
          boxShadow: "0 40px 100px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(4,186,191,.1)",
          animation: "fadeIn .3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 4 }}>
              MEDIA LIBRARY
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Upload files</div>
          </div>
          <button className="btn icon ghost" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div
          style={{
            padding: 32,
            borderRadius: 16,
            border: "2px dashed rgba(4,186,191,.3)",
            background: "rgba(4,186,191,.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(4,186,191,.12)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 24px -4px rgba(4,186,191,.5)",
            }}
          >
            <Icon name="upload" size={22} style={{ color: "var(--accent-2)" }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Drop files to upload</div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
            or <span style={{ color: "var(--accent-2)", cursor: "pointer" }}>browse from your computer</span>
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".12em", marginTop: 4 }}>
            PNG · JPG · SVG · WEBP · MAX 25MB
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }} className="nice-scroll">
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(9,14,28,.5)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #04babf, #0e2e2e)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="image" size={16} style={{ color: "#001819" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{f.size}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,.04)", borderRadius: 999, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${f.progress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                      boxShadow: `0 0 6px var(--accent)`,
                      transition: "width .25s",
                    }}
                  />
                </div>
              </div>
              {f.status === "done" ? (
                <Icon name="check" size={16} style={{ color: "var(--good)" }} />
              ) : (
                <span className="mono" style={{ fontSize: 10.5, color: "var(--accent-2)" }}>{f.progress}%</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
            <Icon name="check" size={11} style={{ color: "var(--good)" }} /> Auto-optimization & alt text suggestions enabled
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary">Insert into media</button>
          </div>
        </div>
      </div>
    </div>
  );
}
