import * as React from "react";
import Icon from "./Icon";
import { Sparkline } from "./charts";

export function Card({
  children,
  style,
  padding = 18,
  glow = false,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number;
  glow?: boolean;
  className?: string;
}) {
  return (
    <div className={`glass ${glow ? "glow-border" : ""}${className ? " " + className : ""}`} style={{ padding, ...style }}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaDir = "up",
  spark,
  hint,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: "up" | "down";
  spark?: number[];
  hint?: string;
}) {
  return (
    <Card padding={18} glow style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".16em" }}>
          {label.toUpperCase()}
        </div>
        {delta && (
          <span className={`chip ${deltaDir === "up" ? "good" : "bad"}`} style={{ padding: "2px 7px" }}>
            <Icon name={deltaDir === "up" ? "trend-up" : "trend-down"} size={10} />
            {delta}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 4 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: "var(--text-3)" }}>{hint}</div>}
      {spark && (
        <div style={{ marginTop: 10, marginLeft: -8, marginRight: -8 }}>
          <Sparkline data={spark} width={300} height={36} />
        </div>
      )}
    </Card>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
      <div>
        {eyebrow && (
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 6 }}>
            {eyebrow}
          </div>
        )}
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: "-.005em" }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}
