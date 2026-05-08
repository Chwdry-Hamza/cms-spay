"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { Card } from "@/components/Card";
import MediaModal from "./MediaModal";

const NAMES = [
  "hero-banner.jpg", "og-default.png", "team-photo.jpg", "product-shot-01.jpg", "feature-grid.png",
  "dashboard-dark.png", "blog-cover-ai.jpg", "workflow-diagram.svg", "testimonial-1.png", "case-study-cover.jpg",
  "infographic-seo.png", "demo-video-thumb.jpg", "logo-dark.svg", "logo-light.svg", "icon-set-32.png",
  "social-card-twitter.png", "footer-pattern.svg", "about-team.jpg",
];
const SIZES = [
  "340 KB", "82 KB", "1.2 MB", "680 KB", "520 KB", "910 KB", "840 KB", "12 KB", "220 KB", "1.4 MB",
  "480 KB", "120 KB", "4 KB", "4 KB", "64 KB", "180 KB", "22 KB", "2.1 MB",
];

export default function MediaView() {
  const [showModal, setShowModal] = React.useState(false);

  const items = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    name: NAMES[i],
    size: SIZES[i],
    type: i % 5 === 0 ? "svg" : i % 4 === 0 ? "png" : "jpg",
    hue: 160 + ((i * 23) % 60),
  }));

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, border: "1px solid var(--line)", borderRadius: 12, background: "rgba(9,14,28,.5)" }}>
          {["All", "Images", "Videos", "Documents", "SVG"].map((t, i) => (
            <button
              key={t}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: i === 0 ? "rgba(4,186,191,.15)" : "transparent",
                color: i === 0 ? "#fff" : "var(--text-2)",
                fontFamily: "inherit",
                fontSize: 12,
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <Icon
            name="search"
            size={13}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}
          />
          <input className="input" placeholder="Search media…" style={{ paddingLeft: 32, fontSize: 12 }} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn">Sort: Recent <Icon name="chevron-down" size={11} /></button>
          <button className="btn primary" onClick={() => setShowModal(true)}>
            <Icon name="upload" size={13} />Upload
          </button>
        </div>
      </div>

      <Card padding={0} style={{ overflow: "hidden" }}>
        <div
          onClick={() => setShowModal(true)}
          style={{
            padding: 28,
            display: "flex",
            alignItems: "center",
            gap: 18,
            cursor: "pointer",
            background:
              "repeating-linear-gradient(135deg, rgba(4,186,191,.03), rgba(4,186,191,.03) 10px, transparent 10px, transparent 20px)",
            borderBottom: "1px dashed rgba(4,186,191,.25)",
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
            }}
          >
            <Icon name="upload" size={22} style={{ color: "var(--accent-2)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>Drop files here, or click to browse</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
              PNG, JPG, SVG, WEBP up to 25 MB · Optimized & CDN-delivered automatically
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".14em" }}>USED</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>4.2 / 50 GB</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid var(--line)",
                background: "rgba(9,14,28,.4)",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              <div
                style={{
                  aspectRatio: "4/3",
                  position: "relative",
                  background: `linear-gradient(135deg, hsl(${it.hue}, 40%, 28%), hsl(${it.hue + 30}, 30%, 12%))`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name="image" size={28} style={{ color: "rgba(255,255,255,.25)" }} />
                <span
                  className="mono"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(0,0,0,.45)",
                    fontSize: 9,
                    color: "var(--accent-2)",
                    letterSpacing: ".1em",
                  }}
                >
                  {it.type.toUpperCase()}
                </span>
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
                  {it.name}
                </div>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)" }}>{it.size}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showModal && <MediaModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
