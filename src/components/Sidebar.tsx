"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

type NavItem = { id: string; label: string; href: string; icon: IconName; count?: number };

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: "dashboard" },
  { id: "pages", label: "Pages", href: "/pages", icon: "pages", count: 142 },
  { id: "blogs", label: "Blogs", href: "/blogs", icon: "blogs", count: 38 },
  { id: "analytics", label: "SEO Analytics", href: "/analytics", icon: "analytics" },
  { id: "keywords", label: "Keywords", href: "/keywords", icon: "keywords", count: 1284 },
  { id: "media", label: "Media Library", href: "/media", icon: "media" },
  { id: "redirects", label: "Redirects", href: "/redirects", icon: "redirects" },
  { id: "sitemap", label: "Sitemap", href: "/sitemap", icon: "sitemap" },
  { id: "users", label: "Users", href: "/users", icon: "users" },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // editor route counts as blogs
  if (href === "/blogs") return pathname === "/blogs" || pathname.startsWith("/blogs/");
  if (href === "/settings") return pathname === "/settings" || pathname === "/seo-settings";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar() {
  const pathname = usePathname() || "/";
  return (
    <aside
      className="sidebar"
      style={{
        borderRight: "1px solid var(--line)",
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "sticky",
        top: 0,
        height: "100vh",
        background: "linear-gradient(180deg, rgba(14,46,46,.25), rgba(9,14,28,.65))",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 14px" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 0 0 1px rgba(4,186,191,.3), 0 0 18px -2px rgba(4,186,191,.5)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spay-logo.jpeg" alt="Spay" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>
            Spay<span style={{ color: "var(--accent)" }}>.</span>
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".15em" }}>
            SEO · CMS · v3.2
          </div>
        </div>
      </div>

      <button className="btn" style={{ justifyContent: "space-between", width: "100%", padding: "8px 10px", borderRadius: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, #04babf, #0e2e2e)" }} />
          <span style={{ fontSize: 12.5 }}>Acme Studio</span>
        </span>
        <Icon name="chevron-down" size={14} />
      </button>

      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 1 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".18em", padding: "10px 12px 6px" }}>
          NAVIGATION
        </div>
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 10,
                background: active ? "rgba(4,186,191,.10)" : "transparent",
                color: active ? "#fff" : "var(--text-2)",
                fontSize: 13,
                position: "relative",
                textAlign: "left",
                boxShadow: active ? "inset 0 0 0 1px rgba(4,186,191,.25), 0 0 18px -8px rgba(4,186,191,.6)" : "none",
                transition: "all .15s ease",
              }}
            >
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    background: "var(--accent)",
                    borderRadius: 2,
                    boxShadow: "0 0 10px var(--accent)",
                  }}
                />
              )}
              <Icon name={item.icon} size={16} stroke={active ? 1.8 : 1.6} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count != null && (
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: active ? "var(--accent-2)" : "var(--text-3)",
                    background: active ? "rgba(4,186,191,.1)" : "rgba(255,255,255,.03)",
                    padding: "2px 6px",
                    borderRadius: 999,
                  }}
                >
                  {item.count > 999 ? `${(item.count / 1000).toFixed(1)}k` : item.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="glass glow-border" style={{ marginTop: "auto", padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "radial-gradient(circle at 30% 30%, #1ad6db, #04babf 60%, #0e2e2e)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 16px -2px rgba(4,186,191,.6)",
            }}
          >
            <Icon name="sparkles" size={14} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Spay AI</div>
          <span className="chip" style={{ padding: "2px 6px", fontSize: 9, marginLeft: "auto" }}>BETA</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.45, marginBottom: 10 }}>
          Generate optimized meta, headings & briefs from any URL.
        </div>
        <button className="btn primary" style={{ width: "100%", padding: "7px 10px", fontSize: 12, justifyContent: "center" }}>
          Open assistant
          <Icon name="arrow-right" size={12} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderTop: "1px solid var(--line)", marginTop: 4 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1ad6db, #0e2e2e)",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#001819",
            boxShadow: "0 0 0 2px rgba(4,186,191,.2)",
          }}
        >
          EM
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Elena Marx
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)" }}>elena@acme.studio</div>
        </div>
        <button className="btn icon ghost" title="Sign out">
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>
  );
}
