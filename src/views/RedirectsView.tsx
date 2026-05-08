import * as React from "react";
import Icon from "@/components/Icon";
import { Card, StatCard, SectionHeader } from "@/components/Card";

const ROWS = [
  { f: "/old-blog/seo-tips", t: "/blog/seo-tips-2026", code: 301, hits: 1284, last: "2h ago" },
  { f: "/features/optimizer", t: "/features/ai-content-optimizer", code: 301, hits: 842, last: "4h ago" },
  { f: "/v2/*", t: "/v3/*", code: 301, hits: 4218, last: "1d ago" },
  { f: "/blog/old-slug", t: "/blog/new-slug", code: 302, hits: 64, last: "3d ago" },
  { f: "/legacy-pricing", t: "/pricing", code: 301, hits: 2014, last: "5h ago" },
];

export default function RedirectsView() {
  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <StatCard label="Active redirects" value="184" hint="across the site" />
        <StatCard label="Hits this month" value="14,820" delta="+8.2%" spark={[40, 42, 46, 50, 54, 58, 62, 68, 72, 76, 82, 88]} />
        <StatCard label="Broken links" value="0" hint="Last scan: 12 min ago" />
      </div>

      <Card padding={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12 }}>
          <SectionHeader eyebrow="MANAGE" title="URL redirects" />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn">Import CSV</button>
            <button className="btn primary"><Icon name="plus" size={13} />New redirect</button>
          </div>
        </div>
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: "rgba(9,14,28,.5)",
            border: "1px solid var(--line)",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr 80px auto",
            gap: 10,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input className="input" placeholder="/from-path" style={{ fontFamily: "Geist Mono", fontSize: 12 }} />
          <Icon name="arrow-right" size={14} style={{ color: "var(--text-3)" }} />
          <input className="input" placeholder="/to-path" style={{ fontFamily: "Geist Mono", fontSize: 12 }} />
          <select className="input" style={{ padding: "10px", fontSize: 12, fontFamily: "Geist Mono" }} defaultValue="301">
            <option value="301">301</option>
            <option value="302">302</option>
            <option value="307">307</option>
          </select>
          <button className="btn primary">Add</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr className="mono" style={{ textAlign: "left", color: "var(--text-3)", fontSize: 10, letterSpacing: ".14em" }}>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>FROM</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>TO</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>CODE</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>HITS</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>LAST</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", color: "var(--text-2)" }}>{r.f}</td>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", color: "var(--accent-2)" }}>{r.t}</td>
                <td style={{ padding: "12px 6px" }}>
                  <span className="chip" style={{ padding: "2px 8px", fontFamily: "Geist Mono" }}>{r.code}</span>
                </td>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono" }}>{r.hits.toLocaleString()}</td>
                <td style={{ padding: "12px 6px", color: "var(--text-3)" }}>{r.last}</td>
                <td style={{ padding: "12px 6px", textAlign: "right" }}>
                  <button className="btn icon ghost"><Icon name="trash" size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
