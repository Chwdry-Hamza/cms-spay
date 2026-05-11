"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { Card, SectionHeader } from "@/components/Card";
import { INITIAL_SECTIONS } from "./builder/sectionsData";

export default function SeoSettingsView() {
  const [robots, setRobots] = React.useState(true);
  const [og, setOg] = React.useState(true);
  const [schema, setSchema] = React.useState(true);
  const [sitemap, setSitemap] = React.useState(true);

  const options = [
    { k: "robots", v: robots, set: setRobots, t: "Allow indexing of this site", d: "When off, the landing page serves a noindex, nofollow header" },
    { k: "og", v: og, set: setOg, t: "Auto-generate Open Graph from hero", d: "Spay derives social cards from the Hero section's title, gradient & image" },
    { k: "schema", v: schema, set: setSchema, t: "Inject structured data (JSON-LD)", d: "MobileApplication, Organization, BreadcrumbList for the SPay landing page" },
    { k: "sitemap", v: sitemap, set: setSitemap, t: "Auto-submit sitemap to Google & Bing", d: "Pings search engines on every publish from the builder" },
  ];

  return (
    <div className="content fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card padding={22}>
          <SectionHeader eyebrow="GLOBAL SEO" title="Default metadata" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Site title template</label>
              <input className="input" defaultValue="%page% — SPay · The Money App" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
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
                defaultValue="Send, spend, and earn money & crypto in one app. The SPay app delivers institutional-grade security with the agility of decentralized finance."
                style={{ resize: "vertical", fontSize: 12.5 }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Canonical domain</label>
                <input className="input" defaultValue="https://spay.com" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
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

Sitemap: https://spay.com/sitemap.xml
`}</pre>
        </Card>

        {/* Per-section SEO — derived from sections in the builder */}
        <Card padding={0}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="layers" size={14} style={{ color: "var(--accent-2)" }} />
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em" }}>
                PER-SECTION METADATA
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Anchor & schema map</div>
            </div>
            <span className="chip" style={{ marginLeft: "auto", padding: "2px 8px" }}>
              <Icon name="anchor" size={11} /> Auto-derived
            </span>
          </div>
          <div style={{ padding: 8 }}>
            {INITIAL_SECTIONS.filter((s) => !s.locked && s.type !== "bottomNav" && s.type !== "cookieConsent").slice(0, 9).map((s) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "30px 1fr 160px 80px 60px",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 10,
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(4,186,191,.04)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, rgba(4,186,191,.18), rgba(4,186,191,.04))",
                    border: "1px solid var(--line-2)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--accent-2)",
                  }}
                >
                  <Icon name={s.icon} size={13} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                    {s.file}
                  </div>
                </div>
                <input
                  className="input small mono"
                  defaultValue={`#${s.id.toLowerCase()}`}
                  style={{ fontSize: 11 }}
                />
                <span className="chip" style={{ padding: "2px 8px", fontSize: 10 }}>
                  {s.type === "homeHero" ? "WebPage" : s.type === "features" ? "ItemList" : s.type === "footer" ? "Organization" : "Schema"}
                </span>
                <span className={`toggle on`} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80, alignSelf: "flex-start" }}>
        <Card padding={18}>
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 12 }}>SERP PREVIEW</div>
          <div style={{ padding: 16, borderRadius: 12, background: "#fff", color: "#202124", fontFamily: "Arial, sans-serif" }}>
            <div style={{ fontSize: 11, color: "#5f6368", marginBottom: 4 }}>spay.com</div>
            <div style={{ fontSize: 18, color: "#1a0dab", marginBottom: 4, fontWeight: 400, lineHeight: 1.3 }}>
              SPay — The Money App · Send, spend, earn
            </div>
            <div style={{ fontSize: 12, color: "#4d5156", lineHeight: 1.5 }}>
              Send, spend, and earn money & crypto in one app. Institutional-grade security with the agility of decentralized finance.
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
                <div style={{ fontSize: 22, color: "#fff", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-.02em" }}>
                  THE <span style={{ color: "#46F1C5" }}>MONEY</span> APP
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 6 }}>
                  Send, spend, earn — money & crypto in one app
                </div>
                <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 8 }}>spay.com</div>
              </div>
            </div>
            <div style={{ padding: 10, background: "rgba(9,14,28,.7)" }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>SPAY.COM</div>
              <div style={{ fontSize: 11.5, marginTop: 2 }}>SPay — The Money App</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
