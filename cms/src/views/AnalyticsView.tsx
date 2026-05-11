"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { Card, StatCard, SectionHeader } from "@/components/Card";
import { AreaChart, BarChart, Sparkline, StackedBar } from "@/components/charts";

export default function AnalyticsView() {
  const traffic = [320, 380, 350, 420, 480, 460, 520, 580, 640, 600, 720, 780, 850, 820, 920, 980, 1040, 1120];
  const ctr = [3.2, 3.4, 3.6, 3.5, 3.9, 4.1, 4.3, 4.2, 4.6, 4.8, 5.1, 5.3, 5.4, 5.6, 5.5, 5.7, 5.6, 5.59];

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Clicks" value="1.38M" delta="+18.4%" spark={traffic.slice(-12)} />
        <StatCard label="Impressions" value="24.8M" delta="+22.1%" spark={[60, 68, 72, 80, 78, 86, 92, 98, 104, 110, 118, 128]} />
        <StatCard label="Avg CTR" value="5.59%" delta="+0.42pp" spark={ctr.slice(-12).map((x) => x * 10)} />
        <StatCard label="Avg position" value="14.2" delta="-2.8" deltaDir="up" spark={[28, 26, 25, 24, 22, 21, 20, 19, 18, 16, 15, 14]} />
      </div>

      <Card padding={20}>
        <SectionHeader
          eyebrow="LAST 90 DAYS"
          title="Search performance"
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <span className="chip"><span className="dot" />Clicks</span>
              <span className="chip"><span className="dot good" />CTR</span>
            </div>
          }
        />
        <AreaChart data={traffic} secondary={ctr.map((x) => x * 200)} height={260} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <SectionHeader eyebrow="DEVICE" title="Traffic split" />
          <StackedBar
            segments={[
              { label: "Desktop", value: 58, color: "#04babf" },
              { label: "Mobile", value: 36, color: "#1ad6db" },
              { label: "Tablet", value: 6, color: "#0e2e2e" },
            ]}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
            {[
              { l: "Desktop", v: "58%", n: "802k", c: "#04babf" },
              { l: "Mobile", v: "36%", n: "498k", c: "#1ad6db" },
              { l: "Tablet", v: "6%", n: "82k", c: "#0e2e2e" },
            ].map((s) => (
              <div key={s.l} style={{ padding: 12, borderRadius: 12, background: "rgba(9,14,28,.4)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.c, boxShadow: `0 0 6px ${s.c}` }} />
                  <span style={{ fontSize: 11, color: "var(--text-2)" }}>{s.l}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{s.v}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{s.n}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader eyebrow="TRAFFIC SOURCES" title="Where visitors come from" />
          <BarChart
            data={[820, 412, 288, 184, 96, 62, 38]}
            labels={["Google", "Direct", "Referral", "Bing", "Social", "LinkedIn", "DDG"]}
            height={170}
          />
        </Card>
      </div>

      <Card padding={20}>
        <SectionHeader
          eyebrow="SECTION ENGAGEMENT"
          title="How each landing section performs"
          right={
            <button className="btn ghost" style={{ fontSize: 12 }}>
              Export <Icon name="arrow-right" size={11} />
            </button>
          }
        />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr className="mono" style={{ textAlign: "left", color: "var(--text-3)", fontSize: 10, letterSpacing: ".14em" }}>
              <th style={{ padding: "8px 6px", fontWeight: 400 }}>SECTION</th>
              <th style={{ padding: "8px 6px", fontWeight: 400 }}>VIEWS</th>
              <th style={{ padding: "8px 6px", fontWeight: 400 }}>IMPRESSIONS</th>
              <th style={{ padding: "8px 6px", fontWeight: 400 }}>CTR</th>
              <th style={{ padding: "8px 6px", fontWeight: 400 }}>SCROLL%</th>
              <th style={{ padding: "8px 6px", fontWeight: 400 }}>30-DAY</th>
            </tr>
          </thead>
          <tbody>
            {[
              { p: "/#hero", c: "284,180", i: "612k", ctr: "9.41%", pos: 100, t: [40, 46, 52, 58, 64, 72, 80, 86, 92] },
              { p: "/#features", c: "238,440", i: "498k", ctr: "7.21%", pos: 92, t: [50, 52, 56, 60, 68, 72, 78, 82, 84] },
              { p: "/#payment", c: "201,890", i: "382k", ctr: "6.73%", pos: 78, t: [60, 62, 68, 70, 72, 76, 78, 80, 82] },
              { p: "/#transfer", c: "188,220", i: "318k", ctr: "5.73%", pos: 64, t: [40, 44, 48, 54, 60, 66, 70, 74, 78] },
              { p: "/#earn", c: "164,680", i: "241k", ctr: "6.09%", pos: 51, t: [80, 82, 84, 86, 88, 90, 92, 94, 96] },
              { p: "/#join-us", c: "112,440", i: "201k", ctr: "12.19%", pos: 38, t: [20, 28, 38, 50, 62, 72, 80, 84, 86] },
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono", fontSize: 11.5, color: "var(--text-2)" }}>{r.p}</td>
                <td style={{ padding: "12px 6px", fontWeight: 500 }}>{r.c}</td>
                <td style={{ padding: "12px 6px", color: "var(--text-2)" }}>{r.i}</td>
                <td style={{ padding: "12px 6px", color: "var(--accent-2)" }}>{r.ctr}</td>
                <td style={{ padding: "12px 6px", fontFamily: "Geist Mono" }}>{r.pos}</td>
                <td style={{ padding: "12px 6px" }}>
                  <Sparkline data={r.t} width={90} height={24} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
