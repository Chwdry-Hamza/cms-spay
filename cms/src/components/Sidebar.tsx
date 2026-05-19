"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

type NavItem = { id: string; label: string; href: string; icon: IconName; count?: number; badge?: string };

const NAV_PRIMARY: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: "dashboard" },
  { id: "builder", label: "Landing Page Builder", href: "/builder", icon: "builder", badge: "LIVE" },
  { id: "content-pages", label: "Pages", href: "/content-pages", icon: "pages" },
  { id: "sections", label: "Sections", href: "/sections", icon: "layers", count: 13 },
  { id: "media", label: "Media Library", href: "/media", icon: "media" },
];

const NAV_SECONDARY: NavItem[] = [

  { id: "seo", label: "SEO Settings", href: "/seo-settings", icon: "globe" },
  { id: "redirects", label: "Redirects", href: "/redirects", icon: "arrow-right" },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: "analytics" },
  { id: "users", label: "Users", href: "/users", icon: "users", count: 8 },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

type Viewport = "mobile" | "tablet" | "desktop";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/builder") return pathname === "/builder" || pathname.startsWith("/builder/");
  if (href === "/sections") return pathname === "/sections" || pathname.startsWith("/sections/");
  if (href === "/content-pages")
    return pathname === "/content-pages" || pathname.startsWith("/content-pages/");
  return pathname === href || pathname.startsWith(href + "/");
}

function NavGroup({
  label,
  items,
  pathname,
  showLabels,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  showLabels: boolean;
}) {
  // Hide the whole group (including its header) when there are no items —
  // otherwise the "ADMIN" label still renders above an empty space.
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 1 }}>
      {showLabels && (
        <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".18em", padding: "10px 12px 6px" }}>
          {label}
        </div>
      )}
      {!showLabels && <div style={{ height: 14 }} />}
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            title={!showLabels ? item.label : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: showLabels ? "8px 12px" : "10px",
              justifyContent: showLabels ? "flex-start" : "center",
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
            {showLabels && <span style={{ flex: 1 }}>{item.label}</span>}
            {showLabels && item.badge && (
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  color: "#001819",
                  background: "linear-gradient(180deg, var(--accent-2), var(--accent))",
                  padding: "2px 6px",
                  borderRadius: 999,
                  letterSpacing: ".08em",
                  fontWeight: 600,
                  boxShadow: "0 0 12px -2px rgba(4,186,191,.7)",
                }}
              >
                {item.badge}
              </span>
            )}
            {showLabels && item.count != null && (
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
            {/* Collapsed-rail badge dot for items with badge/count */}
            {!showLabels && (item.badge || item.count != null) && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent-2)",
                  boxShadow: "0 0 8px var(--accent-2)",
                }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Detect viewport on mount + on resize.
  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setViewport("mobile");
      else if (w < 1280) setViewport("tablet");
      else setViewport("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Sensible defaults per viewport.
  React.useEffect(() => {
    if (viewport === "tablet") setCollapsed(true);
    else if (viewport === "desktop") setCollapsed(false);
    if (viewport !== "mobile") setMobileOpen(false);
  }, [viewport]);

  // Listen for the hamburger button event from the TopBar.
  React.useEffect(() => {
    const handler = () => {
      if (viewport === "mobile") setMobileOpen((o) => !o);
      else setCollapsed((c) => !c);
    };
    window.addEventListener("sidebar:toggle", handler);
    return () => window.removeEventListener("sidebar:toggle", handler);
  }, [viewport]);

  // Mirror sidebar state to <body> so global CSS can adapt the .app grid.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("sidebar-collapsed", collapsed && viewport !== "mobile");
    document.body.classList.toggle("sidebar-mobile", viewport === "mobile");
    document.body.classList.toggle("sidebar-mobile-open", mobileOpen);
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewport, collapsed, mobileOpen]);

  // Close drawer on navigation.
  React.useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close drawer on Escape.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isMobile = viewport === "mobile";
  const showLabels = !collapsed || (isMobile && mobileOpen);

  const widthExpanded = 248;
  const widthRail = 72;
  const widthDrawer = 280;
  const width = isMobile ? widthDrawer : collapsed ? widthRail : widthExpanded;

  const sidebar = (
    <aside
      className="sidebar"
      style={{
        width,
        borderRight: "1px solid var(--line)",
        padding: showLabels ? "20px 14px" : "20px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        background: "linear-gradient(180deg, rgba(14,46,46,.25), rgba(9,14,28,.85))",
        backdropFilter: "blur(20px)",
        zIndex: 100,
        transform: isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "transform .25s ease, width .2s ease, padding .2s ease",
        boxShadow: isMobile && mobileOpen ? "0 30px 80px -10px rgba(0,0,0,.6)" : undefined,
      }}
      aria-hidden={isMobile && !mobileOpen}
    >
      {/* Logo + collapse toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: showLabels ? "4px 6px 14px" : "4px 0 14px",
          justifyContent: showLabels ? "flex-start" : "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
            boxShadow: "0 0 0 1px rgba(4,186,191,.3), 0 0 18px -2px rgba(4,186,191,.5)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spay-logo.jpeg" alt="Spay" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {showLabels && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>
              Spay<span style={{ color: "var(--accent)" }}>.</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: ".15em" }}>
              VISUAL · CMS · v4.0
            </div>
          </div>
        )}
        {!isMobile && showLabels && (
          <button
            className="btn icon ghost"
            title="Collapse sidebar"
            onClick={() => setCollapsed(true)}
            style={{ width: 28, height: 28 }}
          >
            <Icon name="chevron-right" size={13} style={{ transform: "rotate(180deg)" }} />
          </button>
        )}
        {isMobile && (
          <button
            className="btn icon ghost"
            title="Close menu"
            onClick={() => setMobileOpen(false)}
            style={{ width: 28, height: 28 }}
          >
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {/* Workspace switcher (compact in rail mode) */}
      {showLabels ? (
        <button className="btn" style={{ justifyContent: "space-between", width: "100%", padding: "8px 10px", borderRadius: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, #04babf, #0e2e2e)", flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Acme Studio</span>
          </span>
          <Icon name="chevron-down" size={14} />
        </button>
      ) : (
        <button
          className="btn icon"
          title="Acme Studio"
          style={{ width: "100%", height: 36, padding: 0, borderRadius: 10 }}
        >
          <span style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, #04babf, #0e2e2e)" }} />
        </button>
      )}

      {!isMobile && !showLabels && (
        <button
          className="btn icon ghost"
          title="Expand sidebar"
          onClick={() => setCollapsed(false)}
          style={{ width: "100%", height: 32, marginTop: 4 }}
        >
          <Icon name="chevron-right" size={13} />
        </button>
      )}

      <NavGroup label="WORKSPACE" items={NAV_PRIMARY} pathname={pathname} showLabels={showLabels} />
      <NavGroup label="ADMIN" items={NAV_SECONDARY} pathname={pathname} showLabels={showLabels} />

      {/* Footer: user */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: showLabels ? "10px 8px" : "10px 0",
          justifyContent: showLabels ? "flex-start" : "center",
          borderTop: "1px solid var(--line)",
        }}
      >
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
            flexShrink: 0,
          }}
          title={!showLabels ? "Elena Marx" : undefined}
        >
          EM
        </div>
        {showLabels && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Elena Marx
              </div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)" }}>elena@acme.studio</div>
            </div>
            <button className="btn icon ghost" title="Sign out">
              <Icon name="logout" size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {sidebar}
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(2px)",
            zIndex: 90,
            animation: "fadeIn .2s ease",
          }}
        />
      )}
    </>
  );
}
