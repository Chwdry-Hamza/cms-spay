import * as React from "react";
import Icon from "@/components/Icon";
import { Card, SectionHeader } from "@/components/Card";

const TREE = [
  { p: "/", d: 0, n: 1 },
  { p: "/blog", d: 0, n: 38 },
  { p: "/blog/[slug]", d: 1, n: 38 },
  { p: "/features", d: 0, n: 1 },
  { p: "/features/[name]", d: 1, n: 12 },
  { p: "/pricing", d: 0, n: 1 },
  { p: "/customers", d: 0, n: 1 },
  { p: "/customers/[story]", d: 1, n: 8 },
  { p: "/about", d: 0, n: 1 },
  { p: "/changelog", d: 0, n: 1 },
  { p: "/changelog/[version]", d: 1, n: 24 },
];

export default function SitemapView() {
  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <SectionHeader
            eyebrow="SITEMAP.XML"
            title="Site structure"
            right={<button className="btn"><Icon name="globe" size={13} />View XML</button>}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "Geist Mono", fontSize: 12 }}>
            {TREE.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: it.d ? "transparent" : "rgba(4,186,191,.04)",
                  borderLeft: it.d ? "none" : "2px solid rgba(4,186,191,.4)",
                  marginLeft: it.d * 24,
                }}
              >
                {it.d > 0 && <span style={{ color: "var(--text-3)" }}>└─</span>}
                <span style={{ color: it.d ? "var(--text-2)" : "#fff", flex: 1 }}>{it.p}</span>
                <span className="chip" style={{ padding: "1px 7px", fontSize: 10 }}>
                  {it.n} URL{it.n > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card padding={18}>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 14 }}>STATUS</div>
            <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 4 }}>1,284</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14 }}>Total URLs in sitemap</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span className="dot good" />
                <span style={{ color: "var(--text-2)", flex: 1 }}>Last submitted</span>
                <span className="mono">2h ago</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span className="dot" />
                <span style={{ color: "var(--text-2)", flex: 1 }}>Google indexed</span>
                <span className="mono">1,117</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span className="dot warn" />
                <span style={{ color: "var(--text-2)", flex: 1 }}>Pending</span>
                <span className="mono">86</span>
              </div>
            </div>
            <button className="btn primary" style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>
              <Icon name="sparkles" size={12} />
              Resubmit to Google
            </button>
          </Card>
          <Card padding={18}>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 12 }}>FEEDS</div>
            {["/sitemap.xml", "/sitemap-pages.xml", "/sitemap-blog.xml", "/rss.xml"].map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderTop: "1px solid var(--line)",
                  fontFamily: "Geist Mono",
                  fontSize: 11.5,
                  color: "var(--accent-2)",
                }}
              >
                <Icon name="link" size={11} style={{ color: "var(--text-3)" }} />
                <span style={{ flex: 1 }}>{p}</span>
                <Icon name="arrow-right" size={11} style={{ color: "var(--text-3)" }} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
