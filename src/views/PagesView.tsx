import * as React from "react";
import Icon from "@/components/Icon";
import { Card, SectionHeader } from "@/components/Card";

const ROWS = [
  { p: "/", t: "Homepage", s: "live", score: 96, last: "2h ago", views: "248k" },
  { p: "/pricing", t: "Pricing & plans", s: "live", score: 94, last: "1d ago", views: "42k" },
  { p: "/features", t: "Features overview", s: "live", score: 88, last: "3d ago", views: "31k" },
  { p: "/about", t: "About Spay", s: "live", score: 82, last: "1w ago", views: "12k" },
  { p: "/customers", t: "Customer stories", s: "live", score: 86, last: "4d ago", views: "18k" },
  { p: "/changelog", t: "Product changelog", s: "live", score: 79, last: "6h ago", views: "8.4k" },
  { p: "/legal/dpa", t: "Data processing addendum", s: "live", score: 64, last: "2mo ago", views: "1.2k" },
  { p: "/blog", t: "Blog index", s: "live", score: 91, last: "2h ago", views: "88k" },
  { p: "/changelog/v3", t: "Spay 3.0 — what's new", s: "draft", score: 71, last: "just now", views: "—" },
];

export default function PagesView() {
  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card padding={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <SectionHeader eyebrow="142 PAGES" title="All pages" />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn"><Icon name="filter" size={13} />All statuses</button>
            <button className="btn primary"><Icon name="plus" size={13} />New page</button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr className="mono" style={{ textAlign: "left", color: "var(--text-3)", fontSize: 10, letterSpacing: ".14em" }}>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>PATH</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>TITLE</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>STATUS</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>SEO</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>VIEWS / 30D</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>UPDATED</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", fontSize: 11.5, color: "var(--accent-2)" }}>{r.p}</td>
                <td style={{ padding: "12px 6px" }}>{r.t}</td>
                <td style={{ padding: "12px 6px" }}>
                  <span className={`chip ${r.s === "live" ? "good" : ""}`}>
                    <span className={`dot ${r.s === "live" ? "good" : ""}`} />
                    {r.s}
                  </span>
                </td>
                <td style={{ padding: "12px 6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 70, height: 4, background: "rgba(255,255,255,.05)", borderRadius: 999 }}>
                      <div
                        style={{
                          width: `${r.score}%`,
                          height: "100%",
                          borderRadius: 999,
                          background:
                            r.score >= 85
                              ? "linear-gradient(90deg, var(--good), var(--accent))"
                              : r.score >= 70
                              ? "linear-gradient(90deg, var(--warn), var(--accent))"
                              : "var(--bad)",
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: 10.5 }}>{r.score}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", color: "var(--text-2)" }}>{r.views}</td>
                <td style={{ padding: "12px 6px", color: "var(--text-3)" }}>{r.last}</td>
                <td style={{ padding: "12px 6px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button className="btn icon ghost"><Icon name="eye" size={13} /></button>
                    <button className="btn icon ghost"><Icon name="edit" size={13} /></button>
                    <button className="btn icon ghost"><Icon name="more" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
