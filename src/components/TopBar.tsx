import * as React from "react";
import Icon from "./Icon";

export default function TopBar({
  title,
  subtitle,
  breadcrumb,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        padding: "14px 28px",
        borderBottom: "1px solid var(--line)",
        background: "linear-gradient(180deg, rgba(9,14,28,.85), rgba(9,14,28,.5))",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        {breadcrumb && (
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: ".12em",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            {breadcrumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevron-right" size={10} />}
                <span style={{ color: i === breadcrumb.length - 1 ? "var(--accent-2)" : "inherit" }}>{c}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: "var(--text-2)" }}>{subtitle}</div>}
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: 520, marginLeft: "auto" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Icon
            name="search"
            size={14}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}
          />
          <input
            className="input"
            placeholder="Search pages, keywords, blogs…  ⌘K"
            style={{ paddingLeft: 36, fontSize: 12.5, height: 38 }}
          />
          <span
            className="mono"
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 9.5,
              color: "var(--text-3)",
              border: "1px solid var(--line)",
              padding: "2px 6px",
              borderRadius: 6,
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {actions}
        <button className="btn icon ghost" title="Notifications" style={{ position: "relative" }}>
          <Icon name="bell" size={15} />
          <span
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
            }}
          />
        </button>
        <button className="btn primary" style={{ height: 38 }}>
          <Icon name="sparkles" size={13} />
          New content
        </button>
      </div>
    </header>
  );
}
