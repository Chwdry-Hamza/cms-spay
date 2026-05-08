"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { Card } from "@/components/Card";

const POSTS = [
  { t: "How AI is reshaping technical SEO in 2026", a: "Mira Chen", d: "May 6, 2026", s: "published", score: 94, views: "42.1k", cat: "AI" },
  { t: "A field guide to Core Web Vitals", a: "Theo Ramirez", d: "May 6, 2026", s: "published", score: 88, views: "18.4k", cat: "Performance" },
  { t: "Building a content engine: the Spay playbook", a: "Elena Marx", d: "May 5, 2026", s: "review", score: 76, views: "—", cat: "Strategy" },
  { t: "Internal linking strategies that scale", a: "Aisha Patel", d: "May 4, 2026", s: "draft", score: 62, views: "—", cat: "On-page" },
  { t: "Schema.org for ecommerce: a complete guide", a: "Mira Chen", d: "May 2, 2026", s: "published", score: 91, views: "9.8k", cat: "Schema" },
  { t: "When to use noindex vs canonical", a: "Theo Ramirez", d: "Apr 29, 2026", s: "published", score: 86, views: "14.2k", cat: "Technical" },
  { t: "Backlink outreach templates that convert", a: "Aisha Patel", d: "Apr 27, 2026", s: "scheduled", score: 84, views: "—", cat: "Outreach" },
];

export default function BlogsView() {
  const router = useRouter();
  const [filter, setFilter] = React.useState<string>("all");

  const tabs = [
    { k: "all", l: "All", n: POSTS.length },
    { k: "published", l: "Published", n: POSTS.filter((p) => p.s === "published").length },
    { k: "draft", l: "Drafts", n: POSTS.filter((p) => p.s === "draft").length },
    { k: "review", l: "In review", n: POSTS.filter((p) => p.s === "review").length },
    { k: "scheduled", l: "Scheduled", n: POSTS.filter((p) => p.s === "scheduled").length },
  ];
  const list = filter === "all" ? POSTS : POSTS.filter((p) => p.s === filter);

  const openEditor = (title?: string) => {
    if (title) router.push(`/blogs/editor?title=${encodeURIComponent(title)}`);
    else router.push("/blogs/editor");
  };

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, border: "1px solid var(--line)", borderRadius: 12, background: "rgba(9,14,28,.5)" }}>
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: filter === t.k ? "rgba(4,186,191,.15)" : "transparent",
                color: filter === t.k ? "#fff" : "var(--text-2)",
                fontFamily: "inherit",
                fontSize: 12.5,
                boxShadow: filter === t.k ? "inset 0 0 0 1px rgba(4,186,191,.3)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t.l}
              <span className="mono" style={{ fontSize: 9.5, color: filter === t.k ? "var(--accent-2)" : "var(--text-3)" }}>{t.n}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <button className="btn"><Icon name="calendar" size={13} />This month</button>
          <button className="btn primary" onClick={() => openEditor()}><Icon name="plus" size={13} />New post</button>
        </div>
      </div>

      <Card padding={0} glow style={{ overflow: "hidden", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 200 }}>
          <div style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <span className="chip" style={{ alignSelf: "flex-start", marginBottom: 12 }}>
              <Icon name="sparkles" size={10} />AI ASSISTED
            </span>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, letterSpacing: "-.02em", fontWeight: 600 }}>Generate a brief from any URL</h2>
            <p style={{ margin: "0 0 16px", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.55, maxWidth: 460 }}>
              Spay AI analyzes the SERP, extracts entity coverage gaps and produces an outlined brief in under 30 seconds.
            </p>
            <div style={{ display: "flex", gap: 8, maxWidth: 440 }}>
              <input className="input" placeholder="https://example.com/article" style={{ flex: 1 }} />
              <button className="btn primary"><Icon name="sparkles" size={12} />Analyze</button>
            </div>
          </div>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <div className="grid-bg" />
            <svg viewBox="0 0 400 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <defs>
                <radialGradient id="bloom" cx="80%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#04babf" stopOpacity=".6" />
                  <stop offset="100%" stopColor="#04babf" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="400" height="200" fill="url(#bloom)" />
              {[40, 60, 80, 100, 120].map((r, i) => (
                <circle
                  key={i}
                  cx="320"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="rgba(4,186,191,.18)"
                  strokeDasharray="3 5"
                  style={{ animation: `spin ${20 + i * 5}s linear infinite`, transformOrigin: "320px 100px" }}
                />
              ))}
              <circle cx="320" cy="100" r="22" fill="rgba(4,186,191,.18)" />
              <circle cx="320" cy="100" r="10" fill="#04babf" style={{ filter: "drop-shadow(0 0 12px #04babf)" }} />
            </svg>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 14 }}>
        {list.map((p, i) => (
          <Card key={i} padding={0} style={{ overflow: "hidden", cursor: "pointer", transition: "all .2s" }}>
            <div onClick={() => openEditor(p.t)}>
              <div
                style={{
                  height: 120,
                  position: "relative",
                  overflow: "hidden",
                  background: `linear-gradient(135deg, hsl(${180 + i * 22}, 50%, 30%), #0e2e2e)`,
                }}
              >
                <div className="grid-bg" />
                <div style={{ position: "absolute", top: 12, left: 12 }}>
                  <span className={`chip ${p.s === "published" ? "good" : p.s === "review" ? "warn" : ""}`}>
                    <span className={`dot ${p.s === "published" ? "good" : p.s === "review" ? "warn" : ""}`} />
                    {p.s}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,.5)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(4,186,191,.3)",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: "var(--accent-2)" }}>SEO</span> {p.score}
                </div>
                <div className="mono" style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: "var(--text-3)" }}>
                  {p.cat.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 8, minHeight: 39 }}>{p.t}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-3)" }}>
                  <span>{p.a} · {p.d}</span>
                  <span><Icon name="eye" size={11} /> {p.views}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
