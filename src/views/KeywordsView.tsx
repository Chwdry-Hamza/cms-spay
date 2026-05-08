"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { Card, StatCard, SectionHeader } from "@/components/Card";

type Row = { kw: string; pos: number; ch: string; vol: number; diff: number; intent: string };

const KEYWORDS = [
  "ai content optimization",
  "enterprise seo platform",
  "spay cms",
  "best blog editor",
  "core web vitals",
  "metadata generator",
  "schema markup tool",
  "seo audit software",
  "content brief generator",
  "keyword cluster tool",
  "site speed optimizer",
  "indexability checker",
  "sitemap validator",
  "robots.txt tester",
];
const POS = [2, 4, 1, 7, 3, 9, 5, 12, 6, 8, 11, 4, 2, 15];
const CH = ["+4", "+1", "0", "-2", "+6", "+3", "+1", "-4", "+2", "-1", "+5", "+8", "0", "+3"];
const VOL = [18200, 9400, 5800, 12600, 24300, 7200, 4400, 11800, 3200, 6900, 8800, 2200, 1900, 3400];
const DIFF = [78, 62, 45, 84, 72, 38, 52, 68, 40, 58, 66, 28, 32, 44];
const INTENT = [
  "Commercial", "Commercial", "Branded", "Informational", "Informational", "Tool", "Tool", "Commercial", "Tool", "Tool", "Tool", "Tool", "Tool", "Tool",
];

export default function KeywordsView() {
  const data: Row[] = Array.from({ length: 14 }).map((_, i) => ({
    kw: KEYWORDS[i],
    pos: POS[i],
    ch: CH[i],
    vol: VOL[i],
    diff: DIFF[i],
    intent: INTENT[i],
  }));

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Tracked keywords" value="1,284" delta="+42" spark={[60, 62, 66, 70, 74, 78, 82, 86, 90, 92, 96, 100]} />
        <StatCard label="Top 3 positions" value="312" delta="+28" spark={[40, 44, 52, 58, 64, 72, 80, 86, 90, 94, 98, 104]} />
        <StatCard label="Avg position" value="12.4" delta="-1.8" deltaDir="up" spark={[24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12.5, 12.4]} />
        <StatCard label="Opportunities" value="68" delta="+12" spark={[20, 24, 28, 32, 36, 42, 48, 52, 56, 60, 64, 68]} />
      </div>

      <Card padding={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <SectionHeader eyebrow="ALL KEYWORDS" title="Tracking 1,284 keywords" />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Icon
                name="search"
                size={13}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}
              />
              <input className="input" placeholder="Search keywords…" style={{ paddingLeft: 32, fontSize: 12, width: 220 }} />
            </div>
            <button className="btn"><Icon name="filter" size={13} />All intents</button>
            <button className="btn primary"><Icon name="plus" size={13} />Add keyword</button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr className="mono" style={{ textAlign: "left", color: "var(--text-3)", fontSize: 10, letterSpacing: ".14em" }}>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>KEYWORD</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>INTENT</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>POSITION</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>Δ 30D</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>VOLUME</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>DIFFICULTY</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line)", cursor: "pointer" }}>
                <td style={{ padding: "12px 6px" }}>{r.kw}</td>
                <td style={{ padding: "12px 6px" }}>
                  <span className="chip" style={{ padding: "2px 8px", fontSize: 10 }}>{r.intent}</span>
                </td>
                <td style={{ padding: "12px 6px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      minWidth: 28,
                      height: 22,
                      padding: "0 8px",
                      borderRadius: 6,
                      alignItems: "center",
                      justifyContent: "center",
                      background: r.pos <= 3 ? "rgba(4,186,191,.18)" : r.pos <= 10 ? "rgba(255,255,255,.04)" : "rgba(255,107,128,.06)",
                      border: `1px solid ${r.pos <= 3 ? "rgba(4,186,191,.35)" : r.pos <= 10 ? "var(--line)" : "rgba(255,107,128,.2)"}`,
                      fontSize: 11.5,
                      fontWeight: 500,
                    }}
                  >
                    #{r.pos}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 6px",
                    fontFamily: "Geist Mono",
                    color: r.ch.startsWith("+") ? "var(--good)" : r.ch === "0" ? "var(--text-3)" : "var(--bad)",
                  }}
                >
                  {r.ch}
                </td>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", color: "var(--text-2)" }}>{r.vol.toLocaleString()}</td>
                <td style={{ padding: "12px 6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 4, background: "rgba(255,255,255,.05)", borderRadius: 999 }}>
                      <div
                        style={{
                          width: `${r.diff}%`,
                          height: "100%",
                          background: r.diff < 40 ? "var(--good)" : r.diff < 70 ? "var(--warn)" : "var(--bad)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--text-2)" }}>{r.diff}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 6px", textAlign: "right" }}>
                  <button className="btn icon ghost"><Icon name="more" size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
