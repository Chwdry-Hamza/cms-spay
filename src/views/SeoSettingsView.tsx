"use client";
import * as React from "react";
import { Card, SectionHeader } from "@/components/Card";

export default function SeoSettingsView() {
  const [robots, setRobots] = React.useState(true);
  const [og, setOg] = React.useState(true);
  const [schema, setSchema] = React.useState(true);
  const [sitemap, setSitemap] = React.useState(true);

  const options = [
    { k: "robots", v: robots, set: setRobots, t: "Allow indexing of this site", d: "When off, all pages serve a noindex, nofollow header" },
    { k: "og", v: og, set: setOg, t: "Auto-generate Open Graph images", d: "Spay creates social cards from page title + brand colors" },
    { k: "schema", v: schema, set: setSchema, t: "Inject structured data (JSON-LD)", d: "Article, BreadcrumbList, Product, FAQ, Organization" },
    { k: "sitemap", v: sitemap, set: setSitemap, t: "Auto-submit sitemap to Google & Bing", d: "Pings search engines on every publish" },
  ];

  return (
    <div className="content fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card padding={22}>
          <SectionHeader eyebrow="GLOBAL SEO" title="Default metadata" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Site title template</label>
              <input className="input" defaultValue="%page% — Spay" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                Use <span className="mono" style={{ color: "var(--accent-2)" }}>%page%</span> and{" "}
                <span className="mono" style={{ color: "var(--accent-2)" }}>%site%</span> as variables
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Default meta description</label>
              <textarea
                className="input"
                rows={3}
                defaultValue="Spay is the modern SEO CMS for content teams. Plan, write, optimize, and ship — all from a single workspace."
                style={{ resize: "vertical", fontSize: 12.5 }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Canonical domain</label>
                <input className="input" defaultValue="https://spay.studio" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Default language</label>
                <input className="input" defaultValue="en-US" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
              </div>
            </div>
          </div>
        </Card>

        <Card padding={22}>
          <SectionHeader eyebrow="ADVANCED" title="Indexing & crawlers" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {options.map((o) => (
              <div
                key={o.k}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--line)" }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{o.t}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{o.d}</div>
                </div>
                <div className={`toggle ${o.v ? "on" : ""}`} onClick={() => o.set(!o.v)} role="switch" aria-checked={o.v} />
              </div>
            ))}
          </div>
        </Card>

        <Card padding={22}>
          <SectionHeader eyebrow="ROBOTS.TXT" title="Crawler directives" />
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: 16,
              borderRadius: 12,
              background: "rgba(9,14,28,.7)",
              border: "1px solid var(--line)",
              fontSize: 12,
              color: "var(--text-2)",
              lineHeight: 1.7,
              overflowX: "auto",
            }}
          >{`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/internal
Disallow: /preview/

Sitemap: https://spay.studio/sitemap.xml
`}</pre>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80, alignSelf: "flex-start" }}>
        <Card padding={18}>
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 12 }}>SERP PREVIEW</div>
          <div style={{ padding: 16, borderRadius: 12, background: "#fff", color: "#202124", fontFamily: "Arial, sans-serif" }}>
            <div style={{ fontSize: 11, color: "#5f6368", marginBottom: 4 }}>spay.studio › blog</div>
            <div style={{ fontSize: 18, color: "#1a0dab", marginBottom: 4, fontWeight: 400, lineHeight: 1.3 }}>
              How AI is reshaping technical SEO in 2026 — Spay
            </div>
            <div style={{ fontSize: 12, color: "#4d5156", lineHeight: 1.5 }}>
              A practical look at how generative engines are changing the SEO playbook — and what to do about it.
            </div>
          </div>
        </Card>
        <Card padding={18}>
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 12 }}>OPEN GRAPH</div>
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
            <div
              style={{
                aspectRatio: "1.91/1",
                background: "linear-gradient(135deg, #04babf, #0e2e2e)",
                display: "grid",
                placeItems: "center",
                position: "relative",
              }}
            >
              <div className="grid-bg" />
              <div style={{ textAlign: "center", padding: 16, position: "relative" }}>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 600, lineHeight: 1.3 }}>How AI is reshaping technical SEO</div>
                <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 4 }}>spay.studio</div>
              </div>
            </div>
            <div style={{ padding: 10, background: "rgba(9,14,28,.7)" }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>SPAY.STUDIO</div>
              <div style={{ fontSize: 11.5, marginTop: 2 }}>How AI is reshaping technical SEO in 2026</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
