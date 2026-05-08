"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { Card, StatCard, SectionHeader } from "@/components/Card";
import { AreaChart, RadialScore, Sparkline, Heatmap, WorldDots } from "@/components/charts";

export default function DashboardView() {
  const trafficData = [320, 380, 350, 420, 480, 460, 520, 580, 640, 600, 720, 780, 850, 820, 920, 980, 1040, 1120, 1080, 1180, 1240, 1320, 1280, 1380];
  const trafficCompare = [310, 340, 320, 360, 380, 400, 440, 460, 500, 510, 540, 580, 600, 620, 640, 680, 700, 720, 740, 770, 800, 820, 840, 870];
  const [tab, setTab] = React.useState("30d");

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Organic traffic" value="1.38M" delta="+18.4%" spark={[40,50,48,60,72,68,82,90,86,94,108,120,118,132]} hint="vs last 30 days"/>
        <StatCard label="Keywords ranking" value="8,412" delta="+412" spark={[60,55,62,70,68,74,82,80,86,92,90,98,104,108]} hint="312 in top 3"/>
        <StatCard label="Avg. SEO score" value="92.6" delta="+3.2" spark={[70,72,71,74,76,78,80,82,84,86,88,90,91,92]} hint="across 142 pages"/>
        <StatCard label="Indexed pages" value="1,284" delta="-1.1%" deltaDir="down" spark={[100,98,99,101,100,102,103,101,99,98,97,98,99,99]} hint="22 pending"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 4 }}>
                SEARCH PERFORMANCE
              </div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Organic traffic</div>
            </div>
            <div style={{ display: "flex", gap: 6, padding: 4, background: "rgba(9,14,28,.7)", borderRadius: 10, border: "1px solid var(--line)" }}>
              {["7d", "30d", "90d", "1y"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: 11.5,
                    cursor: "pointer",
                    background: tab === t ? "rgba(4,186,191,.18)" : "transparent",
                    color: tab === t ? "#fff" : "var(--text-2)",
                    boxShadow: tab === t ? "inset 0 0 0 1px rgba(4,186,191,.3)" : "none",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 32, marginBottom: 12, alignItems: "baseline" }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-.02em" }}>1,384,920</div>
              <div style={{ fontSize: 11, color: "var(--text-2)", display: "flex", gap: 8, alignItems: "center" }}>
                <span className="dot good" />
                Visits this period
              </div>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".14em" }}>IMPRESSIONS</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>24.8M</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".14em" }}>AVG CTR</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>5.59%</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".14em" }}>AVG POSITION</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>14.2</div>
              </div>
            </div>
          </div>

          <AreaChart data={trafficData} secondary={trafficCompare} height={210} />

          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--text-2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 2, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
              This period
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 1, background: "rgba(255,255,255,.25)", borderTop: "1px dashed rgba(255,255,255,.25)" }} />
              Previous
            </span>
          </div>
        </Card>

        <Card padding={20} style={{ display: "flex", flexDirection: "column" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 4 }}>SITE HEALTH</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Overall SEO score</div>
          <div style={{ display: "grid", placeItems: "center", padding: "8px 0 12px" }}>
            <RadialScore value={92} size={160} stroke={12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            {[
              { label: "Technical SEO", val: 96, color: "#04babf" },
              { label: "Content quality", val: 88, color: "#1ad6db" },
              { label: "Backlinks", val: 81, color: "#2dd49a" },
              { label: "Performance", val: 94, color: "#04babf" },
            ].map((b) => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-2)" }}>{b.label}</span>
                  <span className="mono" style={{ color: "#fff" }}>{b.val}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,.04)", borderRadius: 999 }}>
                  <div
                    style={{
                      width: `${b.val}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${b.color}, #1ad6db)`,
                      borderRadius: 999,
                      boxShadow: `0 0 8px ${b.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <SectionHeader
            eyebrow="TOP KEYWORDS"
            title="Keyword rankings"
            right={
              <button className="btn ghost" style={{ fontSize: 12 }}>
                View all <Icon name="arrow-right" size={11} />
              </button>
            }
          />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr className="mono" style={{ textAlign: "left", color: "var(--text-3)", fontSize: 10, letterSpacing: ".14em" }}>
                <th style={{ padding: "8px 6px", fontWeight: 400 }}>KEYWORD</th>
                <th style={{ padding: "8px 6px", fontWeight: 400 }}>POSITION</th>
                <th style={{ padding: "8px 6px", fontWeight: 400 }}>CHANGE</th>
                <th style={{ padding: "8px 6px", fontWeight: 400 }}>VOLUME</th>
                <th style={{ padding: "8px 6px", fontWeight: 400 }}>TREND</th>
              </tr>
            </thead>
            <tbody>
              {[
                { kw: "ai content optimization", pos: 2, ch: "+4", vol: "18,200", trend: [40,42,46,52,58,64,72,80,86] },
                { kw: "enterprise seo platform", pos: 4, ch: "+1", vol: "9,400", trend: [60,62,58,60,64,68,72,76,82] },
                { kw: "spay cms", pos: 1, ch: "0", vol: "5,800", trend: [80,82,84,88,92,96,98,98,99] },
                { kw: "best blog editor 2026", pos: 7, ch: "-2", vol: "12,600", trend: [70,72,74,68,64,60,58,62,64] },
                { kw: "core web vitals checker", pos: 3, ch: "+6", vol: "24,300", trend: [20,28,38,50,60,72,82,90,94] },
                { kw: "metadata generator", pos: 9, ch: "+3", vol: "7,200", trend: [40,42,44,52,58,62,66,70,72] },
              ].map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name="keywords" size={13} style={{ color: "var(--accent-2)", opacity: 0.7 }} />
                      {r.kw}
                    </div>
                  </td>
                  <td style={{ padding: "12px 6px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 28,
                        height: 22,
                        padding: "0 8px",
                        borderRadius: 6,
                        background: r.pos <= 3 ? "rgba(4,186,191,.15)" : "rgba(255,255,255,.04)",
                        color: r.pos <= 3 ? "#fff" : "var(--text-2)",
                        border: r.pos <= 3 ? "1px solid rgba(4,186,191,.3)" : "1px solid var(--line)",
                        fontSize: 11.5,
                        fontWeight: 500,
                      }}
                    >
                      #{r.pos}
                    </span>
                  </td>
                  <td style={{ padding: "12px 6px" }}>
                    <span
                      style={{
                        color: r.ch.startsWith("+") ? "var(--good)" : r.ch === "0" ? "var(--text-3)" : "var(--bad)",
                        fontFamily: "Geist Mono",
                        fontSize: 11.5,
                      }}
                    >
                      {r.ch}
                    </span>
                  </td>
                  <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", fontSize: 11.5, color: "var(--text-2)" }}>{r.vol}</td>
                  <td style={{ padding: "12px 6px" }}>
                    <Sparkline data={r.trend} width={80} height={22} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card padding={20}>
          <SectionHeader
            eyebrow="ACTIVITY"
            title="Recent blog posts"
            right={
              <button className="btn ghost" style={{ fontSize: 12 }}>
                <Icon name="plus" size={12} />
                New
              </button>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { t: "How AI is reshaping technical SEO in 2026", a: "Mira Chen", d: "2h ago", s: "published", score: 94 },
              { t: "A field guide to Core Web Vitals", a: "Theo Ramirez", d: "5h ago", s: "published", score: 88 },
              { t: "Building a content engine: Spay playbook", a: "Elena Marx", d: "1d ago", s: "review", score: 76 },
              { t: "Internal linking strategies that scale", a: "Aisha Patel", d: "2d ago", s: "draft", score: 62 },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  background: "rgba(9,14,28,.4)",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: `conic-gradient(var(--accent) ${p.score * 3.6}deg, rgba(255,255,255,.06) 0)`,
                    display: "grid",
                    placeItems: "center",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "absolute", inset: 3, borderRadius: 8, background: "var(--bg-2)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600 }}>
                    {p.score}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.t}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{p.a}</span>
                    <span>·</span>
                    <span>{p.d}</span>
                    <span
                      className={`chip ${p.s === "published" ? "good" : p.s === "review" ? "warn" : ""}`}
                      style={{ marginLeft: "auto", padding: "1px 6px", fontSize: 9 }}
                    >
                      {p.s}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <SectionHeader eyebrow="GOOGLE" title="Indexing status" />
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
            <RadialScore value={87} label="Indexed" size={120} stroke={10} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            {[
              { l: "Indexed", n: 1117, c: "var(--good)" },
              { l: "Discovered, not indexed", n: 86, c: "var(--warn)" },
              { l: "Crawled, not indexed", n: 54, c: "var(--accent-2)" },
              { l: "Excluded", n: 27, c: "var(--bad)" },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.c, boxShadow: `0 0 8px ${s.c}` }} />
                <span style={{ flex: 1, color: "var(--text-2)" }}>{s.l}</span>
                <span className="mono" style={{ color: "#fff" }}>{s.n}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader eyebrow="LAST 26 WEEKS" title="Publishing cadence" />
          <Heatmap weeks={26} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11, color: "var(--text-3)" }}>
            <span>Less</span>
            <div style={{ display: "flex", gap: 3 }}>
              {[0.05, 0.18, 0.45, 0.75, 1].map((a, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(4,186,191,${a})` }} />
              ))}
            </div>
            <span>More</span>
          </div>
          <div style={{ marginTop: 14, padding: 12, background: "rgba(4,186,191,.06)", borderRadius: 12, border: "1px solid rgba(4,186,191,.15)" }}>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 4 }}>You published</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>184 posts</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>over the last 26 weeks · 7.1/week avg</div>
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader eyebrow="GEOGRAPHY" title="Traffic by region" />
          <div style={{ padding: "4px 0 8px" }}>
            <WorldDots active="na" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            {[
              { r: "North America", v: 48, n: "662k" },
              { r: "Europe", v: 28, n: "387k" },
              { r: "Asia Pacific", v: 16, n: "221k" },
              { r: "Latin America", v: 8, n: "114k" },
            ].map((r) => (
              <div key={r.r}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                  <span style={{ color: "var(--text-2)" }}>{r.r}</span>
                  <span className="mono" style={{ color: "#fff" }}>
                    {r.n} <span style={{ color: "var(--text-3)" }}>· {r.v}%</span>
                  </span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,.04)", borderRadius: 999 }}>
                  <div
                    style={{
                      width: `${r.v * 2}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
