"use client";
import * as React from "react";

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function AreaChart({
  data,
  color = "#04babf",
  height = 180,
  showAxis = true,
  secondary,
}: {
  data: number[];
  color?: string;
  height?: number;
  showAxis?: boolean;
  label?: string;
  secondary?: number[];
}) {
  const W = 720, H = height, padX = 8, padY = 18;
  const max = Math.max(...data, ...(secondary || [0]));
  const min = Math.min(...data, ...(secondary || [max]));
  const range = max - min || 1;
  const stepX = (W - padX * 2) / (data.length - 1);
  const toPts = (arr: number[]): [number, number][] =>
    arr.map((v, i) => [padX + i * stepX, padY + (1 - (v - min) / range) * (H - padY * 2)]);
  const pts = toPts(data);
  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1][0]} ${H - padY} L ${pts[0][0]} ${H - padY} Z`;
  const sPts = secondary ? toPts(secondary) : null;
  const sPath = sPts ? smoothPath(sPts) : null;
  const gradId = React.useId();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="60%" stopColor={color} stopOpacity="0.10" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${gradId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {showAxis && [0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={padX}
          x2={W - padX}
          y1={padY + (i * (H - padY * 2)) / 3}
          y2={padY + (i * (H - padY * 2)) / 3}
          stroke="rgba(140,220,220,0.06)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={areaPath} fill={`url(#area-${gradId})`} />
      {sPath && <path d={sPath} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeDasharray="3 4" />}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" filter={`url(#glow-${gradId})`} />
      {pts.length > 0 && (
        <g>
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="6" fill={color} opacity="0.18" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill="#fff" opacity=".6" />
        </g>
      )}
    </svg>
  );
}

export function BarChart({
  data,
  color = "#04babf",
  height = 140,
  labels,
}: {
  data: number[];
  color?: string;
  height?: number;
  labels?: string[];
}) {
  const W = 720, H = height, padX = 8, padY = 18, gap = 6;
  const max = Math.max(...data) || 1;
  const bw = (W - padX * 2 - gap * (data.length - 1)) / data.length;
  const gradId = React.useId();
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} width="100%" height={H + 18} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`bar-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const h = (v / max) * (H - padY * 2);
        const x = padX + i * (bw + gap);
        const y = padY + (H - padY * 2) - h;
        return (
          <g key={i}>
            <rect x={x} y={padY} width={bw} height={H - padY * 2} fill="rgba(255,255,255,.02)" rx="3" />
            <rect x={x} y={y} width={bw} height={h} fill={`url(#bar-${gradId})`} rx="3" />
            {labels && (
              <text x={x + bw / 2} y={H + 12} fill="rgba(180,220,222,.5)" fontSize="9" fontFamily="Geist Mono" textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function RadialScore({
  value = 78,
  label = "SEO Score",
  size = 130,
  stroke = 10,
  color = "#04babf",
}: {
  value?: number;
  label?: string;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const gradId = React.useId();
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`rad-${gradId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#1ad6db" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#rad-${gradId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: "drop-shadow(0 0 6px rgba(4,186,191,.6))", transition: "stroke-dashoffset 1s ease" }}
      />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fill="#fff" fontSize="26" fontWeight="600" fontFamily="Geist">
        {value}
      </text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fill="rgba(180,220,222,.6)" fontSize="9" fontFamily="Geist Mono" letterSpacing="1">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}

export function Sparkline({
  data,
  color = "#04babf",
  height = 36,
  width = 100,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts: [number, number][] = data.map((v, i) => [i * step, height - ((v - min) / range) * height]);
  const path = smoothPath(pts);
  const gradId = React.useId();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sp-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#sp-${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function StackedBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,.04)" }}>
      {segments.map((s, i) => (
        <div
          key={i}
          title={`${s.label}: ${s.value}%`}
          style={{
            width: `${(s.value / total) * 100}%`,
            background: s.color,
            boxShadow: i === 0 ? `0 0 12px ${s.color}` : "none",
            transition: "width .8s ease",
          }}
        />
      ))}
    </div>
  );
}

export function Heatmap({ weeks = 26 }: { weeks?: number }) {
  // deterministic pseudo-random
  let s = 7;
  const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3 }}>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 3 }}>
          {Array.from({ length: 7 }).map((_, d) => {
            const v = rng();
            const a = v < 0.4 ? 0.05 : v < 0.6 ? 0.18 : v < 0.8 ? 0.45 : v < 0.95 ? 0.75 : 1;
            return (
              <div
                key={d}
                style={{
                  aspectRatio: "1",
                  borderRadius: 2,
                  background: `rgba(4, 186, 191, ${a})`,
                  boxShadow: a > 0.7 ? `0 0 6px rgba(4,186,191,.5)` : "none",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function WorldDots({ active = "na" }: { active?: "na" | "eu" | "asia" }) {
  return (
    <svg viewBox="0 0 360 180" style={{ width: "100%", height: "auto" }}>
      {Array.from({ length: 18 }).map((_, r) =>
        Array.from({ length: 36 }).map((_, c) => {
          const x = c * 10 + 5;
          const y = r * 10 + 5;
          const inland =
            (c > 5 && c < 13 && r > 4 && r < 11) ||
            (c > 16 && c < 22 && r > 4 && r < 9) ||
            (c > 18 && c < 26 && r > 8 && r < 13) ||
            (c > 22 && c < 32 && r > 5 && r < 11) ||
            (c > 28 && c < 33 && r > 12 && r < 15);
          if (!inland) return null;
          const hot =
            (active === "na" && c < 13) ||
            (active === "eu" && c > 16 && c < 22) ||
            (active === "asia" && c > 22 && c < 32);
          return (
            <circle
              key={`${r}-${c}`}
              cx={x}
              cy={y}
              r={hot ? 1.6 : 1}
              fill={hot ? "#04babf" : "rgba(140,220,222,.18)"}
              style={{ filter: hot ? "drop-shadow(0 0 2px #04babf)" : "none" }}
            />
          );
        })
      )}
    </svg>
  );
}
