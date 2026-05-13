"use client";
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
      <button
        className="btn icon ghost sidebar-toggle"
        title="Toggle navigation"
        onClick={() => {
          if (typeof window !== "undefined") window.dispatchEvent(new Event("sidebar:toggle"));
        }}
        style={{ flexShrink: 0 }}
      >
        <Icon name="menu" size={16} />
      </button>

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

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {actions}
      </div>
    </header>
  );
}
