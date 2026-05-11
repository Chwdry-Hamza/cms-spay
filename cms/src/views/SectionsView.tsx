"use client";
import * as React from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { Card } from "@/components/Card";
import { INITIAL_SECTIONS, type SectionMeta } from "./builder/sectionsData";

type Filter = "all" | "hero" | "content" | "marketing" | "system";

const FILTERS: { id: Filter; label: string; icon: IconName }[] = [
  { id: "all", label: "All sections", icon: "layers" },
  { id: "hero", label: "Hero & headers", icon: "header" },
  { id: "content", label: "Content blocks", icon: "grid" },
  { id: "marketing", label: "Marketing", icon: "rocket" },
  { id: "system", label: "System", icon: "settings" },
];

const CATEGORY_BY_TYPE: Record<string, Filter> = {
  appHeader: "system",
  homeHero: "hero",
  features: "content",
  featureGrid: "content",
  payment: "content",
  transfer: "content",
  earn: "content",
  crypto: "content",
  linkedAccounts: "content",
  collaborations: "marketing",
  joinUs: "marketing",
  footer: "system",
  bottomNav: "system",
  cookieConsent: "system",
};

export default function SectionsView() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [query, setQuery] = React.useState("");

  const sections = INITIAL_SECTIONS.filter((s) => {
    const cat = CATEGORY_BY_TYPE[s.type];
    const passFilter = filter === "all" || cat === filter;
    const passQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.file.toLowerCase().includes(query.toLowerCase());
    return passFilter && passQuery;
  });

  return (
    <div className="content fade-in">
      {/* Hero strip */}
      <div
        className="glass glow-border"
        style={{
          padding: 24,
          marginBottom: 22,
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div className="grid-bg" />
        <div style={{ position: "relative" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".18em", marginBottom: 8 }}>
            COMPONENT REGISTRY · 13 DETECTED
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-.01em" }}>
            Every block from <span style={{ color: "var(--accent-2)" }}>spay-website</span>, mapped to an editable
            interface.
          </h2>
          <p style={{ margin: "10px 0 16px", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, maxWidth: 720 }}>
            Each React section in your codebase has been auto-detected and given a content schema, an inspector form,
            and a publish workflow. Click into any block to manage its content, or jump straight to the live builder.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/builder" className="btn primary" style={{ padding: "8px 14px" }}>
              <Icon name="builder" size={13} />
              Open builder
            </Link>
            <button className="btn">
              <Icon name="plus" size={13} />
              Detect new components
            </button>
            <button className="btn ghost">
              <Icon name="branch" size={13} />
              Sync from main
            </button>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: 240,
            height: 130,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 6,
          }}
        >
          {INITIAL_SECTIONS.slice(0, 6).map((s, i) => (
            <div
              key={s.id}
              className="section-thumb"
              style={{
                // Deterministic alpha based on index — avoids hydration mismatch
                // that Math.random() would cause between SSR and the client.
                background: `linear-gradient(135deg, rgba(4,186,191,${0.15 + ((i * 7) % 11) / 50}), rgba(14,46,46,.6))`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "var(--accent-2)",
                  opacity: .8,
                }}
              >
                <Icon name={s.icon} size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        <MiniStat icon="layers" label="Total sections" value="13" delta="+2" tone="good" />
        <MiniStat icon="eye" label="Visible on live" value="13" delta="100%" tone="good" />
        <MiniStat icon="image" label="Editable images" value="24" delta="6 unset" tone="warn" />
        <MiniStat icon="link" label="CTA buttons" value="11" delta="3 inactive" tone="warn" />
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="tab-strip">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>
              <Icon name={f.icon} size={11} /> {f.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ position: "relative", width: 280 }}>
          <Icon
            name="search"
            size={13}
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}
          />
          <input
            className="input small"
            placeholder="Search sections, files…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>

        <div className="tab-strip">
          <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}>
            <Icon name="grid" size={11} /> Grid
          </button>
          <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>
            <Icon name="list" size={11} /> List
          </button>
        </div>
      </div>

      {/* Cards / List */}
      {view === "grid" ? <SectionsGrid sections={sections} /> : <SectionsList sections={sections} />}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  delta,
  tone = "good",
}: {
  icon: IconName;
  label: string;
  value: string;
  delta: string;
  tone?: "good" | "warn" | "bad";
}) {
  return (
    <Card padding={14}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(4,186,191,.18), rgba(4,186,191,.04))",
            border: "1px solid var(--line-2)",
            display: "grid",
            placeItems: "center",
            color: "var(--accent-2)",
          }}
        >
          <Icon name={icon} size={16} />
        </span>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".15em" }}>
            {label.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>{value}</span>
            <span className={`chip ${tone}`} style={{ padding: "1px 6px", fontSize: 9.5 }}>
              {delta}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SectionsGrid({ sections }: { sections: SectionMeta[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
      {sections.map((s) => (
        <SectionCard key={s.id} section={s} />
      ))}
    </div>
  );
}

function SectionCard({ section }: { section: SectionMeta }) {
  const fields = countFields(section.data);
  const previewUrl =
    (process.env.NEXT_PUBLIC_PREVIEW_URL || "http://localhost:3000") +
    `?preview=true#${section.id}`;
  return (
    <Card padding={0} style={{ overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Schematic placeholder — sections render in the iframe builder, never here. */}
      <div
        style={{
          aspectRatio: "16 / 9",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--line)",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(4,186,191,.18), transparent 70%), linear-gradient(180deg, #0a1322 0%, #050810 100%)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(4,186,191,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(4,186,191,.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 90%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "var(--accent-2)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                margin: "0 auto",
                background: "linear-gradient(135deg, rgba(4,186,191,.25), rgba(4,186,191,.04))",
                border: "1px solid rgba(4,186,191,.35)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 24px -4px rgba(4,186,191,.5)",
              }}
            >
              <Icon name={section.icon} size={20} />
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", marginTop: 8, color: "var(--text-3)" }}>
              LIVE FROM IFRAME
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(9,14,28,.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--line)",
            color: "var(--accent-2)",
            fontSize: 10,
          }}
        >
          <Icon name={section.icon} size={11} />
          <span className="mono" style={{ letterSpacing: ".1em" }}>
            {section.file.replace(".tsx", "").toUpperCase()}
          </span>
        </div>
        {section.locked && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "3px 6px",
              borderRadius: 6,
              background: "rgba(245,176,66,.12)",
              border: "1px solid rgba(245,176,66,.3)",
              color: "#ffd594",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon name="lock" size={10} /> System
          </div>
        )}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 7px",
            borderRadius: 6,
            background: "rgba(9,14,28,.7)",
            border: "1px solid var(--line-2)",
            color: "var(--accent-2)",
            fontSize: 10,
          }}
          className="mono"
        >
          <Icon name="globe" size={10} /> OPEN
        </a>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{section.name}</span>
          <span
            className="chip"
            style={{
              padding: "1px 6px",
              fontSize: 9.5,
              marginLeft: "auto",
              background: section.visible ? "rgba(45,212,154,.08)" : "rgba(255,107,128,.08)",
              borderColor: section.visible ? "rgba(45,212,154,.25)" : "rgba(255,107,128,.25)",
              color: section.visible ? "#93f1c4" : "#ffb1bd",
            }}
          >
            <span className={`dot ${section.visible ? "good" : "bad"}`} /> {section.visible ? "LIVE" : "HIDDEN"}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{section.description}</p>

        <div style={{ display: "flex", gap: 14, marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
          <FieldStat icon="type" value={fields.text} label="Text" />
          <FieldStat icon="image" value={fields.images} label="Image" />
          <FieldStat icon="button" value={fields.ctas} label="CTA" />
          <Link
            href="/builder"
            className="btn"
            style={{ marginLeft: "auto", padding: "5px 10px", fontSize: 11.5 }}
          >
            <Icon name="edit" size={11} /> Edit
          </Link>
        </div>
      </div>
    </Card>
  );
}

function SectionsList({ sections }: { sections: SectionMeta[] }) {
  return (
    <Card padding={0}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1.4fr 1.6fr 100px 110px 60px",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid var(--line)",
          fontSize: 10,
          color: "var(--text-3)",
          letterSpacing: ".14em",
        }}
        className="mono"
      >
        <span />
        <span>SECTION</span>
        <span>FILE · DESCRIPTION</span>
        <span>FIELDS</span>
        <span>STATUS</span>
        <span />
      </div>
      {sections.map((s, i) => {
        const fields = countFields(s.data);
        return (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1.4fr 1.6fr 100px 110px 60px",
              gap: 12,
              padding: "14px 16px",
              borderBottom: i < sections.length - 1 ? "1px solid var(--line)" : "none",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, rgba(4,186,191,.18), rgba(4,186,191,.04))",
                border: "1px solid var(--line-2)",
                display: "grid",
                placeItems: "center",
                color: "var(--accent-2)",
              }}
            >
              <Icon name={s.icon} size={14} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                {s.file}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>{s.description}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>
              {fields.text}T · {fields.images}I · {fields.ctas}C
            </div>
            <span
              className="chip"
              style={{
                padding: "2px 8px",
                fontSize: 10,
                background: s.visible ? "rgba(45,212,154,.08)" : "rgba(255,107,128,.08)",
                borderColor: s.visible ? "rgba(45,212,154,.25)" : "rgba(255,107,128,.25)",
                color: s.visible ? "#93f1c4" : "#ffb1bd",
                width: "fit-content",
              }}
            >
              <span className={`dot ${s.visible ? "good" : "bad"}`} /> {s.visible ? "LIVE" : "HIDDEN"}
            </span>
            <Link href="/builder" className="btn icon ghost" title="Open in builder">
              <Icon name="arrow-right" size={13} />
            </Link>
          </div>
        );
      })}
    </Card>
  );
}

function FieldStat({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-2)", fontSize: 11 }}>
      <Icon name={icon} size={11} style={{ color: "var(--accent-2)" }} />
      <span style={{ color: "var(--text)", fontWeight: 500 }}>{value}</span>
      <span>{label}</span>
    </div>
  );
}

function countFields(data: Record<string, unknown>): { text: number; images: number; ctas: number } {
  let text = 0;
  let images = 0;
  let ctas = 0;
  const walk = (v: unknown, key = "") => {
    if (typeof v === "string") {
      const k = key.toLowerCase();
      if (k.includes("image") || k.includes("logo") || k.includes("photo") || k.includes("front") || k.includes("back") || k.includes("mockup") || v.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
        images++;
      } else if (k.includes("ctaurl") || k.includes("href") || k.includes("url")) {
        ctas++;
      } else if (v.length > 0) {
        text++;
      }
    } else if (Array.isArray(v)) {
      v.forEach((item) => walk(item, key));
    } else if (v && typeof v === "object") {
      Object.entries(v as Record<string, unknown>).forEach(([k, val]) => walk(val, k));
    }
  };
  walk(data);
  return { text, images, ctas };
}
