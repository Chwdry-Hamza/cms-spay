import * as React from "react";
import Icon from "@/components/Icon";
import { Card, SectionHeader } from "@/components/Card";

const INTEGRATIONS = [
  { n: "Google Search Console", d: "Verified · sync every 6h", on: true },
  { n: "Google Analytics 4", d: "Property G-9F8X2L", on: true },
  { n: "Ahrefs", d: "API key configured", on: true },
  { n: "Slack", d: "Notifications to #seo-team", on: true },
  { n: "Zapier", d: "4 zaps connected", on: false },
  { n: "Webhooks", d: "2 endpoints configured", on: true },
];

export default function SettingsView() {
  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 920 }}>
      <Card padding={22}>
        <SectionHeader eyebrow="WORKSPACE" title="General" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Workspace name</label>
            <input className="input" defaultValue="Acme Studio" />
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Slug</label>
            <input className="input" defaultValue="acme-studio" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Primary domain</label>
            <input className="input" defaultValue="https://acme.studio" style={{ fontFamily: "Geist Mono", fontSize: 12.5 }} />
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Time zone</label>
            <input className="input" defaultValue="America/New_York" />
          </div>
        </div>
      </Card>

      <Card padding={22}>
        <SectionHeader eyebrow="INTEGRATIONS" title="Connected services" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {INTEGRATIONS.map((it) => (
            <div
              key={it.n}
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(9,14,28,.4)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(4,186,191,.2), rgba(14,46,46,.4))",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name="globe" size={16} style={{ color: "var(--accent-2)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.n}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {it.d}
                </div>
              </div>
              <span className={`chip ${it.on ? "good" : ""}`} style={{ padding: "2px 8px" }}>
                <span
                  className={`dot ${it.on ? "good" : ""}`}
                  style={{
                    background: !it.on ? "var(--text-3)" : undefined,
                    boxShadow: !it.on ? "none" : undefined,
                  }}
                />
                {it.on ? "Active" : "Off"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card padding={22}>
        <SectionHeader eyebrow="DANGER ZONE" title="Account deletion" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,107,128,.2)",
            background: "rgba(255,107,128,.04)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>Delete this workspace</div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
              All pages, blogs, and analytics history will be permanently removed.
            </div>
          </div>
          <button className="btn" style={{ borderColor: "rgba(255,107,128,.3)", color: "#ffb1bd" }}>
            Delete workspace
          </button>
        </div>
      </Card>
    </div>
  );
}
