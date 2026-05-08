import * as React from "react";
import Icon from "@/components/Icon";
import { Card, StatCard, SectionHeader } from "@/components/Card";

const USERS = [
  { n: "Elena Marx", e: "elena@acme.studio", r: "Owner", s: "online", l: "Now" },
  { n: "Mira Chen", e: "mira@acme.studio", r: "Editor", s: "online", l: "Now" },
  { n: "Theo Ramirez", e: "theo@acme.studio", r: "Editor", s: "away", l: "2h ago" },
  { n: "Aisha Patel", e: "aisha@acme.studio", r: "Author", s: "online", l: "Now" },
  { n: "Jonas Berg", e: "jonas@acme.studio", r: "Author", s: "offline", l: "1d ago" },
  { n: "Priya Iyer", e: "priya@acme.studio", r: "Viewer", s: "offline", l: "3d ago" },
];

export default function UsersView() {
  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Total seats" value="12 / 25" hint="Pro plan" />
        <StatCard label="Active today" value="8" delta="+2" />
        <StatCard label="Pending invites" value="3" />
        <StatCard label="Roles" value="4" />
      </div>
      <Card padding={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionHeader eyebrow="WORKSPACE" title="Members" />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn">Manage roles</button>
            <button className="btn primary"><Icon name="plus" size={13} />Invite member</button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr className="mono" style={{ textAlign: "left", color: "var(--text-3)", fontSize: 10, letterSpacing: ".14em" }}>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>NAME</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>ROLE</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>STATUS</th>
              <th style={{ padding: "10px 6px", fontWeight: 400 }}>LAST ACTIVE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, hsl(${180 + i * 30}, 50%, 35%), #0e2e2e)`,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {u.n.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{u.n}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{u.e}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 6px" }}><span className="chip">{u.r}</span></td>
                <td style={{ padding: "12px 6px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span
                      className={`dot ${u.s === "online" ? "good" : u.s === "away" ? "warn" : ""}`}
                      style={{
                        background: u.s === "offline" ? "var(--text-3)" : undefined,
                        boxShadow: u.s === "offline" ? "none" : undefined,
                      }}
                    />
                    {u.s}
                  </span>
                </td>
                <td style={{ padding: "12px 6px", color: "var(--text-3)" }}>{u.l}</td>
                <td style={{ padding: "12px 6px", textAlign: "right" }}>
                  <button className="btn icon ghost"><Icon name="more" size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
