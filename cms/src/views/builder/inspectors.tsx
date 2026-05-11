"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import type { SectionMeta } from "./sectionsData";

export type Patch = (next: Record<string, unknown>) => void;

/* ---------- Reusable controls ---------- */
function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field-group">
      <div className="field-label">
        <span style={{ textTransform: "uppercase", letterSpacing: ".1em", fontSize: 10, color: "var(--accent-2)" }}>{label}</span>
        {hint && <span className="hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, ...rest }: any) {
  return (
    <input
      className="input small"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: any) {
  return (
    <textarea
      className="textarea"
      rows={rows}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function ColorRow({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="swatch"
        style={{ padding: 0, background: value, width: 28, height: 28 }}
      />
      <input
        className="input small mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, fontSize: 11 }}
      />
      {label && (
        <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: "auto" }} className="mono">
          {label}
        </span>
      )}
    </div>
  );
}

function ImageSlot({ src, onChange }: { src: string; onChange: (v: string) => void }) {
  return (
    <div className="image-slot" onClick={() => onChange(src)}>
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" />
          <div className="overlay">
            <span className="mono" style={{ fontSize: 10, color: "var(--text-2)" }}>
              {src.split("/").pop()}
            </span>
            <span className="btn icon" style={{ width: 28, height: 28 }}>
              <Icon name="upload" size={12} />
            </span>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--text-3)" }}>
          <Icon name="upload" size={18} />
          <span style={{ fontSize: 11 }}>Drop image or click to upload</span>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
      <span style={{ fontSize: 12.5, color: "var(--text)" }}>{label}</span>
      <span className={`toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} />
    </label>
  );
}

function TitlePartsEditor({
  parts,
  onChange,
}: {
  parts: { text: string; color: string }[];
  onChange: (parts: { text: string; color: string }[]) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="color"
            className="swatch"
            value={p.color}
            onChange={(e) => {
              const next = [...parts];
              next[i] = { ...p, color: e.target.value };
              onChange(next);
            }}
            style={{ padding: 0, background: p.color, width: 28, height: 28, flexShrink: 0 }}
          />
          <input
            className="input small"
            value={p.text}
            onChange={(e) => {
              const next = [...parts];
              next[i] = { ...p, text: e.target.value };
              onChange(next);
            }}
          />
          <button
            className="btn icon ghost"
            title="Remove"
            onClick={() => {
              const next = parts.filter((_, ix) => ix !== i);
              onChange(next);
            }}
          >
            <Icon name="x" size={12} />
          </button>
        </div>
      ))}
      <button
        className="btn"
        style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
        onClick={() => onChange([...parts, { text: "TEXT", color: "#ffffff" }])}
      >
        <Icon name="plus" size={12} />
        Add segment
      </button>
    </div>
  );
}

/* ---------- Section-specific inspector forms ---------- */

function AppHeaderInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Logo" hint="PNG · SVG">
        <ImageSlot src={d.logoSrc} onChange={(v) => patch({ logoSrc: v })} />
        <div style={{ marginTop: 8 }}>
          <TextInput value={d.logoAlt} onChange={(v: string) => patch({ logoAlt: v })} placeholder="Alt text" />
        </div>
      </FieldGroup>
      <FieldGroup label="Primary CTA">
        <TextInput value={d.ctaLabel} onChange={(v: string) => patch({ ctaLabel: v })} placeholder="Button label" />
        <div style={{ marginTop: 8 }}>
          <TextInput value={d.ctaUrl} onChange={(v: string) => patch({ ctaUrl: v })} placeholder="https://..." />
        </div>
        <div style={{ marginTop: 8 }}>
          <TextInput value={d.ctaMobileLabel} onChange={(v: string) => patch({ ctaMobileLabel: v })} placeholder="Mobile label (shorter)" />
        </div>
      </FieldGroup>
      <FieldGroup label="Behavior">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Toggle on={d.sticky} onChange={(v) => patch({ sticky: v })} label="Stick to top on scroll" />
          <Toggle on={d.blur} onChange={(v) => patch({ blur: v })} label="Background blur" />
        </div>
      </FieldGroup>
    </>
  );
}

function HomeHeroInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Headline" hint="Multi-color">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle" hint="Desktop / Tablet">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="Mobile subtitle">
        <TextArea value={d.mobileSubtitle} onChange={(v: string) => patch({ mobileSubtitle: v })} rows={2} />
      </FieldGroup>
      <FieldGroup label="Primary CTA">
        <TextInput value={d.ctaLabel} onChange={(v: string) => patch({ ctaLabel: v })} placeholder="GET THE APP" />
        <div style={{ marginTop: 8 }}>
          <TextInput value={d.ctaUrl} onChange={(v: string) => patch({ ctaUrl: v })} placeholder="https://..." />
        </div>
      </FieldGroup>
      <FieldGroup label="Hero image">
        <ImageSlot src={d.heroImage} onChange={(v) => patch({ heroImage: v })} />
      </FieldGroup>
      <FieldGroup label="Gradient & glow">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ColorRow value={d.gradientStart} onChange={(v) => patch({ gradientStart: v })} label="Start" />
          <ColorRow value={d.gradientEnd} onChange={(v) => patch({ gradientEnd: v })} label="End" />
          <ColorRow value={d.glowColor} onChange={(v) => patch({ glowColor: v })} label="Glow" />
        </div>
      </FieldGroup>
    </>
  );
}

function FeaturesInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Section title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      {d.cards.map((c: any, i: number) => (
        <FieldGroup key={i} label={`Card ${i + 1} · ${c.title}`} hint={`#${i + 1}`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <TextInput
              value={c.title}
              onChange={(v: string) => {
                const next = [...d.cards];
                next[i] = { ...c, title: v };
                patch({ cards: next });
              }}
              placeholder="Title"
            />
            <TextArea
              value={c.desc}
              onChange={(v: string) => {
                const next = [...d.cards];
                next[i] = { ...c, desc: v };
                patch({ cards: next });
              }}
              rows={2}
            />
            <ImageSlot
              src={c.image}
              onChange={(v) => {
                const next = [...d.cards];
                next[i] = { ...c, image: v };
                patch({ cards: next });
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <ColorRow
                value={c.bgStart}
                onChange={(v) => {
                  const next = [...d.cards];
                  next[i] = { ...c, bgStart: v };
                  patch({ cards: next });
                }}
                label="A"
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <ColorRow
                value={c.bgEnd}
                onChange={(v) => {
                  const next = [...d.cards];
                  next[i] = { ...c, bgEnd: v };
                  patch({ cards: next });
                }}
                label="B"
              />
            </div>
          </div>
        </FieldGroup>
      ))}
    </>
  );
}

function FeatureGridInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Title">
        <TextInput value={d.title} onChange={(v: string) => patch({ title: v })} />
      </FieldGroup>
      <FieldGroup label="Tiles" hint={`${d.tiles.length} items`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {d.tiles.map((t: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(4,186,191,.1)",
                  border: "1px solid var(--line-2)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--accent-2)",
                  flexShrink: 0,
                }}
              >
                <Icon name={t.icon} size={14} />
              </div>
              <input
                className="input small"
                value={t.label}
                onChange={(e) => {
                  const next = [...d.tiles];
                  next[i] = { ...t, label: e.target.value };
                  patch({ tiles: next });
                }}
              />
              <button
                className="btn icon ghost"
                onClick={() => {
                  const next = d.tiles.filter((_: any, ix: number) => ix !== i);
                  patch({ tiles: next });
                }}
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
            onClick={() => patch({ tiles: [...d.tiles, { icon: "sparkles", label: "New tile" }] })}
          >
            <Icon name="plus" size={12} />
            Add tile
          </button>
        </div>
      </FieldGroup>
    </>
  );
}

function PaymentInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={2} />
      </FieldGroup>
      <FieldGroup label="Card front">
        <ImageSlot src={d.cardFront} onChange={(v) => patch({ cardFront: v })} />
      </FieldGroup>
      <FieldGroup label="Card back">
        <ImageSlot src={d.cardBack} onChange={(v) => patch({ cardBack: v })} />
      </FieldGroup>
      <FieldGroup label="Behavior">
        <Toggle on={d.flipOnHover} onChange={(v) => patch({ flipOnHover: v })} label="Flip on hover" />
      </FieldGroup>
    </>
  );
}

function TransferInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="Phone mockup">
        <ImageSlot src={d.mockupImage} onChange={(v) => patch({ mockupImage: v })} />
      </FieldGroup>
    </>
  );
}

function EarnInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="APR Gauge">
        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            value={d.aprLabel}
            onChange={(v: string) => patch({ aprLabel: v })}
            placeholder="Label"
            style={{ flex: 1.5 }}
          />
          <TextInput value={d.apr} onChange={(v: string) => patch({ apr: v })} placeholder="3%" style={{ flex: 1 }} />
        </div>
      </FieldGroup>
    </>
  );
}

function CryptoInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="Mockup image">
        <ImageSlot src={d.mockupImage} onChange={(v) => patch({ mockupImage: v })} />
      </FieldGroup>
      <FieldGroup label="Tickers" hint={`${d.tickers.length} active`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {d.tickers.map((t: string, i: number) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: "rgba(4,186,191,.1)",
                border: "1px solid var(--line-2)",
                color: "var(--accent-2)",
                fontSize: 11,
                fontFamily: "Geist Mono, ui-monospace, monospace",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {t}
              <button
                className="btn icon ghost"
                style={{ width: 16, height: 16, padding: 0 }}
                onClick={() => patch({ tickers: d.tickers.filter((_: string, ix: number) => ix !== i) })}
              >
                <Icon name="x" size={9} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <input
            className="input small mono"
            placeholder="Add ticker (BTC)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.currentTarget.value || "").toUpperCase().trim();
                if (v) {
                  patch({ tickers: [...d.tickers, v] });
                  e.currentTarget.value = "";
                }
              }
            }}
          />
        </div>
      </FieldGroup>
    </>
  );
}

function LinkedAccountsInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="Center card · All Accounts" hint="LIGHT">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={d.centerCard.name}
            onChange={(v: string) => patch({ centerCard: { ...d.centerCard, name: v } })}
            placeholder="Cardholder name"
          />
          <div style={{ display: "flex", gap: 6 }}>
            <TextInput
              value={d.centerCard.status}
              onChange={(v: string) => patch({ centerCard: { ...d.centerCard, status: v } })}
              placeholder="Status"
            />
            <TextInput
              value={d.centerCard.label}
              onChange={(v: string) => patch({ centerCard: { ...d.centerCard, label: v } })}
              placeholder="Label"
            />
          </div>
          <TextInput
            value={d.centerCard.balance}
            onChange={(v: string) => patch({ centerCard: { ...d.centerCard, balance: v } })}
            placeholder="$23,569"
          />
        </div>
      </FieldGroup>
      <FieldGroup label="Crypto wallet cards" hint={`${(d.wallets || []).length} cards`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(d.wallets || []).map((w: any, i: number) => (
            <div
              key={i}
              style={{
                padding: 10,
                border: "1px solid var(--line)",
                borderRadius: 10,
                background: "rgba(4,186,191,.04)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                position: "relative",
              }}
            >
              <span
                className="mono"
                style={{
                  position: "absolute",
                  top: -8,
                  left: 8,
                  fontSize: 9,
                  color: "var(--accent-2)",
                  background: "var(--bg)",
                  padding: "0 6px",
                  letterSpacing: ".1em",
                }}
              >
                CARD {i + 1}
              </span>
              <button
                className="btn icon ghost"
                style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22 }}
                onClick={() => patch({ wallets: d.wallets.filter((_: any, ix: number) => ix !== i) })}
              >
                <Icon name="x" size={11} />
              </button>
              <TextInput
                value={w.name}
                onChange={(v: string) => {
                  const next = [...d.wallets];
                  next[i] = { ...w, name: v };
                  patch({ wallets: next });
                }}
                placeholder="Cardholder"
              />
              <div style={{ display: "flex", gap: 6 }}>
                <TextInput
                  value={w.status}
                  onChange={(v: string) => {
                    const next = [...d.wallets];
                    next[i] = { ...w, status: v };
                    patch({ wallets: next });
                  }}
                  placeholder="Status"
                />
                <TextInput
                  value={w.label}
                  onChange={(v: string) => {
                    const next = [...d.wallets];
                    next[i] = { ...w, label: v };
                    patch({ wallets: next });
                  }}
                  placeholder="CRYPTO WALLET"
                />
              </div>
              <TextInput
                value={w.balance}
                onChange={(v: string) => {
                  const next = [...d.wallets];
                  next[i] = { ...w, balance: v };
                  patch({ wallets: next });
                }}
                placeholder="$ 9,824"
              />
            </div>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Successful linked popup">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={d.popup.title}
            onChange={(v: string) => patch({ popup: { ...d.popup, title: v } })}
            placeholder="SUCCESSFUL LINKED"
          />
          <TextArea
            value={d.popup.body}
            onChange={(v: string) => patch({ popup: { ...d.popup, body: v } })}
            rows={2}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <TextInput
              value={d.popup.ctaLabel}
              onChange={(v: string) => patch({ popup: { ...d.popup, ctaLabel: v } })}
              placeholder="CHECK IT OUT"
            />
            <TextInput
              value={d.popup.ctaUrl}
              onChange={(v: string) => patch({ popup: { ...d.popup, ctaUrl: v } })}
              placeholder="https://..."
            />
          </div>
        </div>
      </FieldGroup>
    </>
  );
}

function CollaborationsInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Section title">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Partners" hint={`${d.partners.length} partners`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {d.partners.map((p: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input
                className="input small mono"
                value={p.icon}
                onChange={(e) => {
                  const next = [...d.partners];
                  next[i] = { ...p, icon: e.target.value };
                  patch({ partners: next });
                }}
                style={{ width: 50, textAlign: "center" }}
              />
              <input
                className="input small"
                value={p.name}
                onChange={(e) => {
                  const next = [...d.partners];
                  next[i] = { ...p, name: e.target.value };
                  patch({ partners: next });
                }}
                style={{ flex: 1 }}
              />
              <button className="btn icon ghost" onClick={() => patch({ partners: d.partners.filter((_: any, ix: number) => ix !== i) })}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
            onClick={() => patch({ partners: [...d.partners, { icon: "★", name: "Partner" }] })}
          >
            <Icon name="plus" size={12} />
            Add partner
          </button>
        </div>
      </FieldGroup>
    </>
  );
}

function JoinUsInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Headline">
        <TitlePartsEditor parts={d.titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="CTA">
        <TextInput value={d.ctaLabel} onChange={(v: string) => patch({ ctaLabel: v })} placeholder="GET THE APP" />
        <div style={{ marginTop: 8 }}>
          <TextInput value={d.ctaUrl} onChange={(v: string) => patch({ ctaUrl: v })} placeholder="https://..." />
        </div>
      </FieldGroup>
      <FieldGroup label="Background photos" hint={`${(d.photos || []).length} photos`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {(d.photos || []).map((src: string, i: number) => (
            <div key={i} style={{ position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: "rgba(9,14,28,.7)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button
                className="btn icon"
                style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22 }}
                onClick={() => patch({ photos: d.photos.filter((_: any, ix: number) => ix !== i) })}
              >
                <Icon name="x" size={10} />
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{
              aspectRatio: "1",
              borderStyle: "dashed",
              color: "var(--accent-2)",
              flexDirection: "column",
              fontSize: 10,
              padding: 4,
            }}
            onClick={() => patch({ photos: [...(d.photos || []), "/martha.png"] })}
          >
            <Icon name="plus" size={14} />
            Add
          </button>
        </div>
      </FieldGroup>
    </>
  );
}

function FooterInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Tagline">
        <TextInput value={d.tagline} onChange={(v: string) => patch({ tagline: v })} />
      </FieldGroup>
      <FieldGroup label="Links" hint={`${d.links.length} links`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {d.links.map((l: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input
                className="input small"
                value={l.label}
                onChange={(e) => {
                  const next = [...d.links];
                  next[i] = { ...l, label: e.target.value };
                  patch({ links: next });
                }}
                style={{ flex: 1 }}
              />
              <input
                className="input small mono"
                value={l.href}
                onChange={(e) => {
                  const next = [...d.links];
                  next[i] = { ...l, href: e.target.value };
                  patch({ links: next });
                }}
                style={{ flex: 1, fontSize: 11 }}
              />
              <button className="btn icon ghost" onClick={() => patch({ links: d.links.filter((_: any, ix: number) => ix !== i) })}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
            onClick={() => patch({ links: [...d.links, { label: "New link", href: "/" }] })}
          >
            <Icon name="plus" size={12} />
            Add link
          </button>
        </div>
      </FieldGroup>
      <FieldGroup label="App Store">
        <TextInput value={d.appStoreUrl} onChange={(v: string) => patch({ appStoreUrl: v })} />
      </FieldGroup>
      <FieldGroup label="Google Play">
        <TextInput value={d.playStoreUrl} onChange={(v: string) => patch({ playStoreUrl: v })} />
      </FieldGroup>
      <FieldGroup label="Copyright">
        <TextInput value={d.copyright} onChange={(v: string) => patch({ copyright: v })} />
      </FieldGroup>
    </>
  );
}

function BottomNavInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <FieldGroup label="Items" hint={`${d.items.length} tabs`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {d.items.map((it: any, i: number) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(4,186,191,.1)",
                border: "1px solid var(--line-2)",
                display: "grid",
                placeItems: "center",
                color: "var(--accent-2)",
                flexShrink: 0,
              }}
            >
              <Icon name={it.icon} size={14} />
            </div>
            <input
              className="input small"
              value={it.label}
              onChange={(e) => {
                const next = [...d.items];
                next[i] = { ...it, label: e.target.value };
                patch({ items: next });
              }}
              style={{ flex: 1 }}
            />
            <input
              className="input small mono"
              value={it.href}
              onChange={(e) => {
                const next = [...d.items];
                next[i] = { ...it, href: e.target.value };
                patch({ items: next });
              }}
              style={{ flex: 1, fontSize: 11 }}
            />
          </div>
        ))}
      </div>
    </FieldGroup>
  );
}

function CookieConsentInspector({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Message">
        <TextArea value={d.message} onChange={(v: string) => patch({ message: v })} rows={3} />
      </FieldGroup>
      <FieldGroup label="Buttons">
        <div style={{ display: "flex", gap: 6 }}>
          <TextInput value={d.acceptLabel} onChange={(v: string) => patch({ acceptLabel: v })} placeholder="Accept" />
          <TextInput value={d.declineLabel} onChange={(v: string) => patch({ declineLabel: v })} placeholder="Decline" />
        </div>
      </FieldGroup>
      <FieldGroup label="Learn more URL">
        <TextInput value={d.learnMoreUrl} onChange={(v: string) => patch({ learnMoreUrl: v })} />
      </FieldGroup>
    </>
  );
}

/* ---------- dispatcher ---------- */
export function SectionInspector({ section, patch }: { section: SectionMeta; patch: Patch }) {
  const d = section.data as any;
  switch (section.type) {
    case "appHeader":
      return <AppHeaderInspector d={d} patch={patch} />;
    case "homeHero":
      return <HomeHeroInspector d={d} patch={patch} />;
    case "features":
      return <FeaturesInspector d={d} patch={patch} />;
    case "featureGrid":
      return <FeatureGridInspector d={d} patch={patch} />;
    case "payment":
      return <PaymentInspector d={d} patch={patch} />;
    case "transfer":
      return <TransferInspector d={d} patch={patch} />;
    case "earn":
      return <EarnInspector d={d} patch={patch} />;
    case "crypto":
      return <CryptoInspector d={d} patch={patch} />;
    case "linkedAccounts":
      return <LinkedAccountsInspector d={d} patch={patch} />;
    case "collaborations":
      return <CollaborationsInspector d={d} patch={patch} />;
    case "joinUs":
      return <JoinUsInspector d={d} patch={patch} />;
    case "footer":
      return <FooterInspector d={d} patch={patch} />;
    case "bottomNav":
      return <BottomNavInspector d={d} patch={patch} />;
    case "cookieConsent":
      return <CookieConsentInspector d={d} patch={patch} />;
    default:
      return null;
  }
}
