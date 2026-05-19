"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import type { SectionMeta } from "./sectionsData";
import { ImagePickerModal } from "./ImagePickerModal";

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
  const [pickerOpen, setPickerOpen] = React.useState(false);

  // Show only the trailing filename for /-paths and http(s)://; show a short
  // "data:image/..." label for data URLs so the overlay doesn't render a 50KB
  // base64 string.
  const displayName = (() => {
    if (!src) return "";
    if (src.startsWith("data:")) {
      const mime = src.slice(5, src.indexOf(";")) || "image";
      return `inline · ${mime}`;
    }
    return src.split("/").pop() ?? src;
  })();

  const openPicker = () => setPickerOpen(true);

  return (
    <div>
      <div
        className="image-slot"
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        style={{ cursor: "pointer" }}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
            <div className="overlay">
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--text-2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 180,
                }}
              >
                {displayName}
              </span>
              <span className="btn icon" style={{ width: 28, height: 28 }}>
                <Icon name="edit" size={12} />
              </span>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              color: "var(--text-3)",
            }}
          >
            <Icon name="image" size={18} />
            <span style={{ fontSize: 11 }}>Pick from library or upload</span>
          </div>
        )}
      </div>
      {pickerOpen && (
        <ImagePickerModal
          currentSrc={src}
          onSelect={(url) => {
            onChange(url);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
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
          </div>
        </FieldGroup>
      ))}
    </>
  );
}

function PillsEditor({
  pills,
  onChange,
  placeholder,
}: {
  pills: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {pills.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 6 }}>
          <input
            className="input small"
            value={p}
            onChange={(e) => {
              const next = [...pills];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
          />
          <button
            className="btn icon ghost"
            onClick={() => onChange(pills.filter((_, ix) => ix !== i))}
          >
            <Icon name="x" size={12} />
          </button>
        </div>
      ))}
      <button
        className="btn"
        style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
        onClick={() => onChange([...pills, "New pill"])}
      >
        <Icon name="plus" size={12} />
        Add pill
      </button>
    </div>
  );
}

const FEATURE_GRID_TILE_DEFAULTS = {
  titleParts: [
    { text: "PAY WITH ", color: "#FFFFFF" },
    { text: "CRYPTO", color: "#46F1C5" },
    { text: " ANYWHERE\nA CARD WORKS.", color: "#FFFFFF" },
  ],
  send: {
    label: "Send",
    title: "Send money in seconds, not days.",
    body: "Move funds to friends, family, or any wallet — across the city or across the world. Every transfer settles instantly.",
    badgeText: "+ 50 USDC · 1.2s",
  },
  grow: {
    label: "Grow",
    statValue: "5.0",
    statUnit: "% APY",
    body: "Earn yield on your idle balance, paid out daily. No lockups, no minimums, withdraw anytime.",
  },
  spend: {
    label: "Spend",
    title: "Tap, swipe, or shop online — with crypto.",
    cardImage: "/spayFront.png",
  },
  split: {
    title: "Spend crypto like cash, anywhere.",
    body: "Tap your SPay card at any store or pay online — crypto converts to fiat at checkout, automatically.",
    amountText: "$37.42 each",
  },
  business: {
    title: "For businesses, get paid in crypto.",
    body: "Online checkouts, in-store payments, and crypto invoices — with same-day payouts to your wallet or bank.",
    pills: ["Online checkout", "In-store POS", "Crypto invoicing"],
  },
  protect: {
    label: "Protect",
    title: "Your funds, fully protected.",
    body: "Multi-sig cold storage on every wallet. Biometric login on every device. 24/7 anomaly detection — your crypto stays yours, always.",
    pills: ["Multi-sig vault", "Biometric login", "SOC 2 Type II"],
  },
} as const;

function FeatureGridInspector({ d, patch }: { d: any; patch: Patch }) {
  // Backfill any tile keys missing from older saved data so the inspector
  // never crashes on `d.send.label` etc. against a legacy shape.
  const send = { ...FEATURE_GRID_TILE_DEFAULTS.send, ...(d.send ?? {}) };
  const grow = { ...FEATURE_GRID_TILE_DEFAULTS.grow, ...(d.grow ?? {}) };
  const spend = { ...FEATURE_GRID_TILE_DEFAULTS.spend, ...(d.spend ?? {}) };
  const split = { ...FEATURE_GRID_TILE_DEFAULTS.split, ...(d.split ?? {}) };
  const business = {
    ...FEATURE_GRID_TILE_DEFAULTS.business,
    ...(d.business ?? {}),
    pills: d.business?.pills ?? FEATURE_GRID_TILE_DEFAULTS.business.pills,
  };
  const protect = {
    ...FEATURE_GRID_TILE_DEFAULTS.protect,
    ...(d.protect ?? {}),
    pills: d.protect?.pills ?? FEATURE_GRID_TILE_DEFAULTS.protect.pills,
  };
  const titleParts = Array.isArray(d.titleParts) && d.titleParts.length
    ? d.titleParts
    : FEATURE_GRID_TILE_DEFAULTS.titleParts;
  const eyebrow = typeof d.eyebrow === "string" ? d.eyebrow : "";

  const patchTile = (key: string, next: Record<string, unknown>) => {
    const current = { send, grow, spend, split, business, protect }[
      key as "send" | "grow" | "spend" | "split" | "business" | "protect"
    ];
    patch({ [key]: { ...current, ...next } });
  };
  return (
    <>
      <FieldGroup label="Eyebrow">
        <TextInput value={eyebrow} onChange={(v: string) => patch({ eyebrow: v })} />
      </FieldGroup>
      <FieldGroup label="Headline" hint="Multi-color">
        <TitlePartsEditor parts={titleParts} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>

      <FieldGroup label="Tile · Send" hint="Hero">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={send.label}
            onChange={(v: string) => patchTile("send", { label: v })}
            placeholder="Label"
          />
          <TextInput
            value={send.title}
            onChange={(v: string) => patchTile("send", { title: v })}
            placeholder="Title"
          />
          <TextArea
            value={send.body}
            onChange={(v: string) => patchTile("send", { body: v })}
            rows={3}
            placeholder="Body"
          />
          <TextInput
            value={send.badgeText}
            onChange={(v: string) => patchTile("send", { badgeText: v })}
            placeholder="Transfer badge"
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Tile · Grow" hint="Stat">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={grow.label}
            onChange={(v: string) => patchTile("grow", { label: v })}
            placeholder="Label"
          />
          <div style={{ display: "flex", gap: 6 }}>
            <TextInput
              value={grow.statValue}
              onChange={(v: string) => patchTile("grow", { statValue: v })}
              placeholder="5.0"
              style={{ flex: 1 }}
            />
            <TextInput
              value={grow.statUnit}
              onChange={(v: string) => patchTile("grow", { statUnit: v })}
              placeholder="% APY"
              style={{ flex: 1 }}
            />
          </div>
          <TextArea
            value={grow.body}
            onChange={(v: string) => patchTile("grow", { body: v })}
            rows={3}
            placeholder="Body"
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Tile · Spend" hint="Card">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={spend.label}
            onChange={(v: string) => patchTile("spend", { label: v })}
            placeholder="Label"
          />
          <TextInput
            value={spend.title}
            onChange={(v: string) => patchTile("spend", { title: v })}
            placeholder="Title"
          />
          <ImageSlot
            src={spend.cardImage}
            onChange={(v) => patchTile("spend", { cardImage: v })}
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Tile · Split" hint="Avatars">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={split.title}
            onChange={(v: string) => patchTile("split", { title: v })}
            placeholder="Title"
          />
          <TextArea
            value={split.body}
            onChange={(v: string) => patchTile("split", { body: v })}
            rows={3}
            placeholder="Body"
          />
          <TextInput
            value={split.amountText}
            onChange={(v: string) => patchTile("split", { amountText: v })}
            placeholder="Amount label"
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Tile · Business" hint="Pills">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={business.title}
            onChange={(v: string) => patchTile("business", { title: v })}
            placeholder="Title"
          />
          <TextArea
            value={business.body}
            onChange={(v: string) => patchTile("business", { body: v })}
            rows={3}
            placeholder="Body"
          />
          <PillsEditor
            pills={business.pills}
            onChange={(v) => patchTile("business", { pills: v })}
            placeholder="Pill text"
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Tile · Protect" hint="Pills">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput
            value={protect.label}
            onChange={(v: string) => patchTile("protect", { label: v })}
            placeholder="Label"
          />
          <TextInput
            value={protect.title}
            onChange={(v: string) => patchTile("protect", { title: v })}
            placeholder="Title"
          />
          <TextArea
            value={protect.body}
            onChange={(v: string) => patchTile("protect", { body: v })}
            rows={3}
            placeholder="Body"
          />
          <PillsEditor
            pills={protect.pills}
            onChange={(v) => patchTile("protect", { pills: v })}
            placeholder="Pill text"
          />
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
    </>
  );
}

function CurrenciesInspector({ d, patch }: { d: any; patch: Patch }) {
  const tickers: { pair: string; price: string; change: string }[] = Array.isArray(d.tickers) ? d.tickers : [];
  const patchTicker = (i: number, next: Partial<{ pair: string; price: string; change: string }>) => {
    const out = [...tickers];
    out[i] = { ...out[i], ...next };
    patch({ tickers: out });
  };
  return (
    <>
      <FieldGroup label="Tickers" hint={`${tickers.length} pairs`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tickers.map((t, i) => (
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
                PAIR {i + 1}
              </span>
              <button
                className="btn icon ghost"
                style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22 }}
                onClick={() => patch({ tickers: tickers.filter((_, ix) => ix !== i) })}
              >
                <Icon name="x" size={11} />
              </button>
              <TextInput
                value={t.pair}
                onChange={(v: string) => patchTicker(i, { pair: v })}
                placeholder="ETH/USD"
              />
              <div style={{ display: "flex", gap: 6 }}>
                <TextInput
                  value={t.price}
                  onChange={(v: string) => patchTicker(i, { price: v })}
                  placeholder="$3,452.12"
                  style={{ flex: 1 }}
                />
                <TextInput
                  value={t.change}
                  onChange={(v: string) => patchTicker(i, { change: v })}
                  placeholder="+1.4%"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}
          <button
            className="btn"
            style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
            onClick={() =>
              patch({
                tickers: [...tickers, { pair: "NEW/USD", price: "$0.00", change: "+0.0%" }],
              })
            }
          >
            <Icon name="plus" size={12} />
            Add ticker
          </button>
        </div>
      </FieldGroup>
      <FieldGroup label="Scroll speed" hint="seconds per loop">
        <input
          type="number"
          className="input small mono"
          min={5}
          max={300}
          value={d.scrollSeconds ?? 40}
          onChange={(e) => patch({ scrollSeconds: Number(e.target.value) || 40 })}
        />
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {d.partners.map((p: any, i: number) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="input small mono"
                  value={p.icon}
                  placeholder="icon"
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
              <input
                className="input small"
                value={p.subtitle ?? ""}
                placeholder="Subtitle (optional)"
                onChange={(e) => {
                  const next = [...d.partners];
                  next[i] = { ...p, subtitle: e.target.value };
                  patch({ partners: next });
                }}
                style={{ marginLeft: 56 }}
              />
            </div>
          ))}
          <button
            className="btn"
            style={{ justifyContent: "center", borderStyle: "dashed", color: "var(--accent-2)" }}
            onClick={() => patch({ partners: [...d.partners, { icon: "★", name: "Partner", subtitle: "" }] })}
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

// Icons offered in the BottomNav inspector. Each entry's `key` must also have
// a matching renderer in spay-website's BottomNav.tsx `NAV_ICONS` registry.
const NAV_ICON_OPTIONS: Array<{ key: string; iconName: any }> = [
  { key: "card", iconName: "card" },
  { key: "arrow-right", iconName: "arrow-right" },
  { key: "branch", iconName: "branch" },
  { key: "trend-up", iconName: "trend-up" },
  { key: "dashboard", iconName: "dashboard" },
  { key: "globe", iconName: "globe" },
  { key: "sparkles", iconName: "sparkles" },
  { key: "rocket", iconName: "rocket" },
  { key: "link", iconName: "link" },
  { key: "mobile", iconName: "mobile" },
  { key: "grid", iconName: "grid" },
  { key: "wand", iconName: "wand" },
];

function BottomNavInspector({ d, patch }: { d: any; patch: Patch }) {
  const items: Array<{ label: string; icon: string; href: string }> = d.items ?? [];
  const maxItems = 8;

  const updateItem = (i: number, fields: Partial<{ label: string; icon: string; href: string }>) => {
    const next = [...items];
    next[i] = { ...next[i], ...fields };
    patch({ items: next });
  };
  const removeItem = (i: number) => {
    patch({ items: items.filter((_, j) => j !== i) });
  };
  const moveItem = (i: number, dir: -1 | 1) => {
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    patch({ items: next });
  };
  const addItem = () => {
    if (items.length >= maxItems) return;
    patch({
      items: [
        ...items,
        { label: "New tab", icon: "card", href: "#" },
      ],
    });
  };

  return (
    <>
      <FieldGroup label="Logo">
        <ImageSlot src={d.logoSrc ?? ""} onChange={(v) => patch({ logoSrc: v })} />
        <div style={{ marginTop: 6 }}>
          <TextInput
            value={d.logoAlt}
            onChange={(v: string) => patch({ logoAlt: v })}
            placeholder="Alt text"
          />
        </div>
      </FieldGroup>

      <FieldGroup label="Call-to-action button">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <TextInput
            value={d.ctaLabel}
            onChange={(v: string) => patch({ ctaLabel: v })}
            placeholder="Desktop label (e.g. GET SPAY APP)"
          />
          <TextInput
            value={d.ctaMobileLabel}
            onChange={(v: string) => patch({ ctaMobileLabel: v })}
            placeholder="Mobile label (e.g. GET THE APP)"
          />
          <TextInput
            value={d.ctaUrl}
            onChange={(v: string) => patch({ ctaUrl: v })}
            placeholder="URL — https://… or /path"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="Items"
        hint={`${items.length} / ${maxItems}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.length === 0 && (
            <div
              style={{
                padding: 14,
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 11.5,
                border: "1px dashed var(--line)",
                borderRadius: 8,
              }}
            >
              No items. Click "Add item" below.
            </div>
          )}
          {items.map((it, i) => (
            <div
              key={i}
              style={{
                padding: 8,
                borderRadius: 10,
                background: "rgba(255,255,255,.02)",
                border: "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 9.5,
                    color: "var(--text-3)",
                    letterSpacing: ".14em",
                    flex: 1,
                  }}
                >
                  ITEM {i + 1}
                </span>
                <button
                  className="btn icon ghost"
                  title="Move up"
                  disabled={i === 0}
                  onClick={() => moveItem(i, -1)}
                  style={{ width: 22, height: 22, opacity: i === 0 ? 0.3 : 1 }}
                >
                  <Icon
                    name="chevron-down"
                    size={11}
                    style={{ transform: "rotate(180deg)" }}
                  />
                </button>
                <button
                  className="btn icon ghost"
                  title="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => moveItem(i, 1)}
                  style={{ width: 22, height: 22, opacity: i === items.length - 1 ? 0.3 : 1 }}
                >
                  <Icon name="chevron-down" size={11} />
                </button>
                <button
                  className="btn icon ghost"
                  title="Delete item"
                  onClick={() => removeItem(i)}
                  style={{ width: 22, height: 22 }}
                >
                  <Icon name="trash" size={11} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select
                  className="input small"
                  value={it.icon}
                  onChange={(e) => updateItem(i, { icon: e.target.value })}
                  style={{
                    width: 90,
                    flexShrink: 0,
                    fontSize: 11,
                    padding: "5px 6px",
                  }}
                  title="Icon"
                >
                  {NAV_ICON_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.key}
                    </option>
                  ))}
                  {!NAV_ICON_OPTIONS.some((o) => o.key === it.icon) && (
                    <option value={it.icon}>{it.icon} (custom)</option>
                  )}
                </select>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "rgba(4,186,191,.1)",
                    border: "1px solid var(--line-2)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--accent-2)",
                    flexShrink: 0,
                  }}
                  title="Preview"
                >
                  <Icon
                    name={
                      (NAV_ICON_OPTIONS.find((o) => o.key === it.icon)?.iconName ??
                        "card") as any
                    }
                    size={13}
                  />
                </div>
                <input
                  className="input small"
                  value={it.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  placeholder="Label"
                  style={{ flex: 1 }}
                />
              </div>

              <input
                className="input small mono"
                value={it.href}
                onChange={(e) => updateItem(i, { href: e.target.value })}
                placeholder="#section, /path, or https://…"
                style={{ fontSize: 11 }}
              />
              <div style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.4 }}>
                <span style={{ color: "var(--accent-2)" }}>#payment</span> or{" "}
                <span style={{ color: "var(--accent-2)" }}>/payment</span> → smooth-scroll to
                that section.{" "}
                <span style={{ color: "var(--accent-2)" }}>/about</span> → navigates to that
                page.
              </div>
            </div>
          ))}

          <button
            className="btn"
            onClick={addItem}
            disabled={items.length >= maxItems}
            style={{
              width: "100%",
              justifyContent: "center",
              borderStyle: "dashed",
              color: "var(--accent-2)",
              opacity: items.length >= maxItems ? 0.5 : 1,
            }}
          >
            <Icon name="plus" size={12} />
            Add item
          </button>
        </div>
      </FieldGroup>
    </>
  );
}

function CustomSectionInspector({ d, patch }: { d: any; patch: Patch }) {
  const layout: "text-only" | "image-left" | "image-right" = d.layout ?? "text-only";
  const showImage = layout !== "text-only";

  const LayoutTile = ({
    value,
    label,
    icon,
  }: {
    value: "text-only" | "image-left" | "image-right";
    label: string;
    icon: React.ReactNode;
  }) => {
    const on = layout === value;
    return (
      <button
        className="btn"
        onClick={() => patch({ layout: value })}
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 6,
          padding: "10px 6px",
          background: on ? "rgba(4,186,191,.12)" : undefined,
          borderColor: on ? "rgba(4,186,191,.55)" : undefined,
          color: on ? "var(--accent-2)" : "var(--text-2)",
        }}
      >
        {icon}
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em" }}>{label}</span>
      </button>
    );
  };

  return (
    <>
      <FieldGroup label="Layout" hint={layout.replace("-", " ")}>
        <div style={{ display: "flex", gap: 6 }}>
          <LayoutTile
            value="text-only"
            label="Text only"
            icon={
              <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
                <rect x="6" y="4" width="28" height="2" rx="1" fill="currentColor" />
                <rect x="6" y="9" width="28" height="2" rx="1" fill="currentColor" opacity=".5" />
                <rect x="6" y="14" width="20" height="2" rx="1" fill="currentColor" opacity=".5" />
              </svg>
            }
          />
          <LayoutTile
            value="image-left"
            label="Image left"
            icon={
              <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
                <rect x="2" y="3" width="16" height="16" rx="2" fill="currentColor" opacity=".4" />
                <rect x="22" y="4" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="22" y="9" width="14" height="2" rx="1" fill="currentColor" opacity=".5" />
                <rect x="22" y="14" width="10" height="2" rx="1" fill="currentColor" opacity=".5" />
              </svg>
            }
          />
          <LayoutTile
            value="image-right"
            label="Image right"
            icon={
              <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
                <rect x="4" y="4" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="4" y="9" width="14" height="2" rx="1" fill="currentColor" opacity=".5" />
                <rect x="4" y="14" width="10" height="2" rx="1" fill="currentColor" opacity=".5" />
                <rect x="22" y="3" width="16" height="16" rx="2" fill="currentColor" opacity=".4" />
              </svg>
            }
          />
        </div>
      </FieldGroup>
      <FieldGroup label="Eyebrow">
        <TextInput value={d.eyebrow} onChange={(v: string) => patch({ eyebrow: v })} placeholder="SMALL UPPERCASE LABEL" />
      </FieldGroup>
      <FieldGroup label="Headline" hint="Multi-color">
        <TitlePartsEditor parts={d.titleParts ?? []} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      <FieldGroup label="Subtitle / body">
        <TextArea value={d.subtitle} onChange={(v: string) => patch({ subtitle: v })} rows={4} />
      </FieldGroup>
      {showImage && (
        <FieldGroup label="Image" hint="JPG · PNG">
          <ImageSlot src={d.imageUrl ?? ""} onChange={(v) => patch({ imageUrl: v })} />
        </FieldGroup>
      )}
      <FieldGroup label="Call to action" hint="Both required to show">
        <TextInput value={d.ctaLabel} onChange={(v: string) => patch({ ctaLabel: v })} placeholder="Button label" />
        <div style={{ marginTop: 8 }}>
          <TextInput value={d.ctaUrl} onChange={(v: string) => patch({ ctaUrl: v })} placeholder="https://..." />
        </div>
      </FieldGroup>
    </>
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

/* ---------- Style helpers ---------- */

type Background = {
  kind?: "none" | "solid" | "gradient";
  color?: string;
  start?: string;
  end?: string;
  angle?: number;
};

type TextColorSlot = {
  key: string;
  label: string;
  fallback: string; // sample colour shown when nothing is set yet
  hint?: string;
};

/**
 * Per-section "text colour" slots. Each entry is a key under
 * data.style.text.<key>. The matching spay-website component reads the same
 * key and applies it to the right element.
 */
const TEXT_SLOTS: Record<string, TextColorSlot[]> = {
  homeHero: [
    { key: "subtitle", label: "Subtitle", fallback: "#A6AABE", hint: "Below the headline" },
    { key: "ctaText", label: "CTA text", fallback: "#0a2a23" },
    { key: "ctaBg", label: "CTA background", fallback: "#04babf" },
  ],
  features: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#A6AABE" },
    { key: "cardTitle", label: "Card title", fallback: "#ffffff" },
    { key: "cardDesc", label: "Card description", fallback: "#A6AABE" },
  ],
  featureGrid: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#A6AABE" },
    { key: "tileLabel", label: "Tile label", fallback: "#46F1C5", hint: "Send / Grow / etc." },
    { key: "tileTitle", label: "Tile title", fallback: "#FFFFFF" },
    { key: "body", label: "Tile body", fallback: "#A6AABE" },
    { key: "tileIcon", label: "Tile icon", fallback: "#46F1C5" },
    { key: "accent", label: "Accent amount", fallback: "#5BE3A1", hint: "Split tile total" },
  ],
  payment: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#A6AABE" },
    { key: "subtitle", label: "Subtitle", fallback: "#A6AABE" },
  ],
  transfer: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#A6AABE" },
    { key: "subtitle", label: "Subtitle", fallback: "#A6AABE" },
  ],
  crypto: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#A6AABE" },
    { key: "subtitle", label: "Subtitle", fallback: "#A6AABE" },
    { key: "ticker", label: "Ticker chips", fallback: "#04babf" },
  ],
  currencies: [
    { key: "pair", label: "Pair name", fallback: "#ffffff" },
    { key: "price", label: "Price", fallback: "#d4d4d8" },
    { key: "up", label: "Positive change", fallback: "#2ee8a0" },
    { key: "down", label: "Negative change", fallback: "#ef4444" },
  ],
  collaborations: [
    { key: "body", label: "Partner names", fallback: "#A6AABE" },
    { key: "accent", label: "Partner icons", fallback: "#46F1C5" },
  ],
  customSection: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#46F1C5" },
    { key: "subtitle", label: "Subtitle", fallback: "#A6AABE" },
    { key: "ctaText", label: "CTA text", fallback: "#001819" },
    { key: "ctaBg", label: "CTA background", fallback: "#46F1C5" },
  ],
  joinUs: [
    { key: "eyebrow", label: "Eyebrow", fallback: "#A6AABE" },
    { key: "subtitle", label: "Subtitle", fallback: "#A6AABE" },
    { key: "ctaText", label: "CTA text", fallback: "#0a2a23" },
    { key: "ctaBg", label: "CTA background", fallback: "#04babf" },
  ],
  footer: [
    { key: "tagline", label: "Tagline", fallback: "#ffffff" },
    { key: "link", label: "Links", fallback: "#A6AABE" },
    { key: "copyright", label: "Copyright", fallback: "#6b7280" },
  ],
  bottomNav: [
    { key: "tileLabel", label: "Nav label", fallback: "#A6AABE" },
    { key: "tileIcon", label: "Nav icon", fallback: "#04babf" },
  ],
  cookieConsent: [
    { key: "message", label: "Message text", fallback: "#A6AABE" },
    { key: "ctaText", label: "Button text", fallback: "#0a2a23" },
    { key: "ctaBg", label: "Button background", fallback: "#04babf" },
  ],
};

function TextColorRow({
  slot,
  value,
  onChange,
}: {
  slot: TextColorSlot;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}) {
  const hasValue = typeof value === "string" && value.length > 0;
  const shown = hasValue ? value! : slot.fallback;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="color"
        value={shown}
        onChange={(e) => onChange(e.target.value)}
        className="swatch"
        style={{ padding: 0, background: shown, width: 28, height: 28, flexShrink: 0 }}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>{slot.label}</span>
        {slot.hint && (
          <span style={{ fontSize: 10.5, color: "var(--text-3)" }}>{slot.hint}</span>
        )}
      </div>
      <span
        className="mono"
        style={{
          fontSize: 10,
          color: hasValue ? "var(--text-2)" : "var(--text-3)",
          fontStyle: hasValue ? "normal" : "italic",
        }}
      >
        {hasValue ? shown.toUpperCase() : "default"}
      </span>
      {hasValue && (
        <button
          className="btn icon ghost"
          title="Reset"
          style={{ width: 22, height: 22 }}
          onClick={() => onChange(undefined)}
        >
          <Icon name="x" size={11} />
        </button>
      )}
    </div>
  );
}

function TextColorsBlock({
  sectionType,
  textColors,
  patchText,
}: {
  sectionType: string;
  textColors: Record<string, string | undefined>;
  patchText: (key: string, value: string | undefined) => void;
}) {
  const slots = TEXT_SLOTS[sectionType];
  if (!slots || slots.length === 0) return null;
  return (
    <FieldGroup label="Text colors" hint="Per element">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {slots.map((slot) => (
          <TextColorRow
            key={slot.key}
            slot={slot}
            value={textColors[slot.key]}
            onChange={(v) => patchText(slot.key, v)}
          />
        ))}
      </div>
    </FieldGroup>
  );
}

/* ---------- HEADING-TAG controls (SEO) ---------- */

type HeadingTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingSlot = {
  /** Key under `data.style.headings[key]`. */
  key: string;
  /** Human label shown in the Style panel. */
  label: string;
  /** Tag the renderer falls back to when no override is set. */
  defaultTag: HeadingTag;
  /** Optional second line under the label. */
  hint?: string;
};

/**
 * Per-section heading-tag slots. Mirrors `TEXT_SLOTS` but additionally
 * includes the `title` slot for the main headline (`titleParts`). Each
 * `defaultTag` mirrors the section's current markup so existing pages render
 * identically until an editor changes a value.
 */
const HEADING_SLOTS: Record<string, HeadingSlot[]> = {
  homeHero: [
    { key: "title", label: "Headline", defaultTag: "h1" },
    { key: "subtitle", label: "Subtitle", defaultTag: "p" },
  ],
  features: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "cardTitle", label: "Card title", defaultTag: "h3", hint: "All cards" },
    { key: "cardDesc", label: "Card description", defaultTag: "p" },
  ],
  featureGrid: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "tileLabel", label: "Tile label", defaultTag: "p", hint: "Send / Grow / etc." },
    { key: "tileTitle", label: "Tile title", defaultTag: "h3", hint: "All tiles" },
    { key: "tileBody", label: "Tile body", defaultTag: "p" },
  ],
  payment: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "subtitle", label: "Subtitle", defaultTag: "p" },
  ],
  transfer: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "subtitle", label: "Subtitle", defaultTag: "p" },
  ],
  crypto: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "subtitle", label: "Subtitle", defaultTag: "p" },
  ],
  collaborations: [
    { key: "title", label: "Section title", defaultTag: "h2" },
  ],
  customSection: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "subtitle", label: "Subtitle", defaultTag: "p" },
  ],
  joinUs: [
    { key: "title", label: "Section title", defaultTag: "h2" },
    { key: "eyebrow", label: "Eyebrow", defaultTag: "p" },
    { key: "subtitle", label: "Subtitle", defaultTag: "p" },
  ],
};

const ALL_TAGS: HeadingTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

const TAG_LABEL: Record<HeadingTag, string> = {
  p: "Paragraph",
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
};

function HeadingTagRow({
  slot,
  value,
  onChange,
}: {
  slot: HeadingSlot;
  value: HeadingTag | undefined;
  onChange: (next: HeadingTag | undefined) => void;
}) {
  const hasValue = value !== undefined;
  const shown = hasValue ? value! : slot.defaultTag;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select
        value={shown}
        onChange={(e) => onChange(e.target.value as HeadingTag)}
        className="input small mono"
        aria-label={`Heading tag for ${slot.label}`}
        // `color-scheme: dark` tells the browser to render the native dropdown
        // popup with dark-mode system colors, so options aren't invisible
        // white-on-white on the dark theme. Width fits the longest label
        // ("Paragraph") + the native arrow so it doesn't get clipped.
        style={{
          width: 112,
          fontSize: 11.5,
          padding: "5px 8px",
          paddingRight: 22,
          flexShrink: 0,
          fontWeight: 600,
          colorScheme: "dark",
          color: hasValue ? "#1ad6db" : "#eaf4ff",
          background: hasValue ? "rgba(4,186,191,.14)" : "#0e1530",
          borderColor: hasValue ? "rgba(4,186,191,.55)" : "var(--line)",
        }}
      >
        {ALL_TAGS.map((tag) => (
          <option
            key={tag}
            value={tag}
            // Explicit option styling — covers browsers that ignore
            // `color-scheme` (e.g. some Windows builds).
            style={{ background: "#0e1530", color: "#eaf4ff" }}
          >
            {TAG_LABEL[tag]}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>{slot.label}</span>
        {slot.hint && (
          <span style={{ fontSize: 10.5, color: "var(--text-3)" }}>{slot.hint}</span>
        )}
      </div>
      <span
        className="mono"
        style={{
          fontSize: 10,
          color: hasValue ? "var(--text-2)" : "var(--text-3)",
          fontStyle: hasValue ? "normal" : "italic",
        }}
      >
        {hasValue ? shown.toUpperCase() : "default"}
      </span>
      {hasValue && (
        <button
          className="btn icon ghost"
          title="Reset"
          style={{ width: 22, height: 22 }}
          onClick={() => onChange(undefined)}
        >
          <Icon name="x" size={11} />
        </button>
      )}
    </div>
  );
}

function HeadingsBlock({
  sectionType,
  headings,
  patchHeading,
}: {
  sectionType: string;
  headings: Record<string, HeadingTag | undefined>;
  patchHeading: (key: string, value: HeadingTag | undefined) => void;
}) {
  const slots = HEADING_SLOTS[sectionType];
  if (!slots || slots.length === 0) return null;
  return (
    <FieldGroup label="Heading levels" hint="Per text element">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {slots.map((slot) => (
          <HeadingTagRow
            key={slot.key}
            slot={slot}
            value={headings[slot.key]}
            onChange={(v) => patchHeading(slot.key, v)}
          />
        ))}
      </div>
    </FieldGroup>
  );
}

function BackgroundEditor({
  value,
  onChange,
}: {
  value: Background | undefined;
  onChange: (next: Background | undefined) => void;
}) {
  const kind: "none" | "solid" | "gradient" = value?.kind ?? "none";
  const start = value?.start ?? "#090e1c";
  const end = value?.end ?? "#0e2e2e";
  const color = value?.color ?? "#0e2e2e";
  const angle = value?.angle ?? 135;

  // Build longhand-only style for the preview tile. Mixing `background`
  // (shorthand) with `backgroundImage` (longhand) on the same element makes
  // React warn during rerenders, so we stick to longhand for both branches.
  const previewStyle: React.CSSProperties =
    kind === "solid"
      ? { backgroundColor: color, backgroundImage: "none" }
      : kind === "gradient"
      ? {
          backgroundColor: "transparent",
          backgroundImage: `linear-gradient(${angle}deg, ${start}, ${end})`,
        }
      : {
          backgroundColor: "transparent",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 6px, rgba(255,255,255,.08) 6px 12px)",
        };

  const setKind = (next: "none" | "solid" | "gradient") => {
    if (next === "none") {
      onChange({ kind: "none" });
      return;
    }
    if (next === "solid") {
      onChange({ kind: "solid", color });
      return;
    }
    onChange({ kind: "gradient", start, end, angle });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        className="tab-strip"
        style={{ width: "100%", padding: 3, background: "rgba(9,14,28,.4)", borderRadius: 8 }}
      >
        <button
          className={kind === "none" ? "on" : ""}
          style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
          onClick={() => setKind("none")}
        >
          <Icon name="x" size={11} /> None
        </button>
        <button
          className={kind === "solid" ? "on" : ""}
          style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
          onClick={() => setKind("solid")}
        >
          <Icon name="palette" size={11} /> Solid
        </button>
        <button
          className={kind === "gradient" ? "on" : ""}
          style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
          onClick={() => setKind("gradient")}
        >
          <Icon name="sparkles" size={11} /> Gradient
        </button>
      </div>

      <div
        style={{
          height: 56,
          borderRadius: 10,
          border: "1px solid var(--line)",
          ...previewStyle,
        }}
      />

      {kind === "solid" && (
        <ColorRow value={color} onChange={(v) => onChange({ ...value, kind: "solid", color: v })} label="Color" />
      )}

      {kind === "gradient" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ColorRow
            value={start}
            onChange={(v) => onChange({ ...value, kind: "gradient", start: v, end, angle })}
            label="Start"
          />
          <ColorRow
            value={end}
            onChange={(v) => onChange({ ...value, kind: "gradient", start, end: v, angle })}
            label="End"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10.5, color: "var(--text-3)", width: 48 }} className="mono">
              ANGLE
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) =>
                onChange({ ...value, kind: "gradient", start, end, angle: Number(e.target.value) })
              }
              style={{ flex: 1 }}
            />
            <span className="mono" style={{ fontSize: 11, color: "var(--text-2)", width: 40, textAlign: "right" }}>
              {angle}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


function TitlePartsColorsOnly({
  parts,
  onChange,
}: {
  parts: { text: string; color: string }[];
  onChange: (parts: { text: string; color: string }[]) => void;
}) {
  if (!parts?.length) {
    return <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>No headline segments to color.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <span
            style={{
              flex: 1,
              fontSize: 12,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p.text.trim() || <em style={{ color: "var(--text-3)" }}>empty</em>}
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
            {p.color.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

function NoStyleHere({ label }: { label?: string }) {
  return (
    <div
      style={{
        padding: "32px 18px",
        textAlign: "center",
        color: "var(--text-3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Icon name="palette" size={22} style={{ opacity: 0.5 }} />
      <div style={{ fontSize: 13, color: "var(--text-2)" }}>
        {label ?? "No style options for this section yet."}
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".08em" }}>
        EDITS HAPPEN IN THE CONTENT TAB
      </div>
    </div>
  );
}

/* ---------- Per-section Style inspectors ---------- */

function HomeHeroStyle({ d, patch }: { d: any; patch: Patch }) {
  return (
    <FieldGroup label="Headline colors" hint="Per segment">
      <TitlePartsColorsOnly parts={d.titleParts ?? []} onChange={(v) => patch({ titleParts: v })} />
    </FieldGroup>
  );
}

function FeaturesStyle({ d, patch }: { d: any; patch: Patch }) {
  return (
    <>
      <FieldGroup label="Headline colors" hint="Per segment">
        <TitlePartsColorsOnly parts={d.titleParts ?? []} onChange={(v) => patch({ titleParts: v })} />
      </FieldGroup>
      {d.cards?.map((c: any, i: number) => (
        <FieldGroup key={i} label={`Card ${i + 1} · ${c.title}`} hint="Background gradient">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ColorRow
              value={c.bgStart}
              onChange={(v) => {
                const next = [...d.cards];
                next[i] = { ...c, bgStart: v };
                patch({ cards: next });
              }}
              label="Start"
            />
            <ColorRow
              value={c.bgEnd}
              onChange={(v) => {
                const next = [...d.cards];
                next[i] = { ...c, bgEnd: v };
                patch({ cards: next });
              }}
              label="End"
            />
          </div>
        </FieldGroup>
      ))}
    </>
  );
}

function TitlePartsOnlyStyle({ d, patch }: { d: any; patch: Patch }) {
  return (
    <FieldGroup label="Headline colors" hint="Per segment">
      <TitlePartsColorsOnly parts={d.titleParts ?? []} onChange={(v) => patch({ titleParts: v })} />
    </FieldGroup>
  );
}

/* ---------- Style dispatcher ---------- */
function SectionStyleInspector({ section, patch }: { section: SectionMeta; patch: Patch }) {
  const d = section.data as any;
  const currentStyle = (d.style ?? {}) as {
    bg?: Background;
    text?: Record<string, string | undefined>;
    headings?: Record<string, HeadingTag | undefined>;
  };
  const currentText = currentStyle.text ?? {};
  const currentHeadings = currentStyle.headings ?? {};

  const patchBg = (bg: Background | undefined) => {
    patch({ style: { ...currentStyle, bg } });
  };

  const patchText = (key: string, value: string | undefined) => {
    const nextText = { ...currentText };
    if (value === undefined) delete nextText[key];
    else nextText[key] = value;
    patch({ style: { ...currentStyle, text: nextText } });
  };

  const patchHeading = (key: string, value: HeadingTag | undefined) => {
    const nextHeadings = { ...currentHeadings };
    if (value === undefined) delete nextHeadings[key];
    else nextHeadings[key] = value;
    patch({ style: { ...currentStyle, headings: nextHeadings } });
  };

  // Section-specific colour controls (titleParts colours, card backgrounds, etc.).
  let extras: React.ReactNode = null;
  switch (section.type) {
    case "homeHero":
      extras = <HomeHeroStyle d={d} patch={patch} />;
      break;
    case "features":
      extras = <FeaturesStyle d={d} patch={patch} />;
      break;
    case "payment":
    case "transfer":
    case "crypto":
    case "joinUs":
    case "collaborations":
    case "featureGrid":
    case "customSection":
      extras = <TitlePartsOnlyStyle d={d} patch={patch} />;
      break;
    default:
      extras = null;
  }

  return (
    <>
      <FieldGroup label="Section background" hint="Wrapper">
        <BackgroundEditor value={currentStyle.bg} onChange={patchBg} />
      </FieldGroup>
      <TextColorsBlock
        sectionType={section.type}
        textColors={currentText}
        patchText={patchText}
      />
      <HeadingsBlock
        sectionType={section.type}
        headings={currentHeadings}
        patchHeading={patchHeading}
      />
      {extras}
    </>
  );
}

/* ---------- Top-level dispatcher ---------- */
export function SectionInspector({
  section,
  patch,
  tab = "content",
}: {
  section: SectionMeta;
  patch: Patch;
  tab?: "content" | "style";
}) {
  if (tab === "style") return <SectionStyleInspector section={section} patch={patch} />;

  const d = section.data as any;
  switch (section.type) {
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
    case "crypto":
      return <CryptoInspector d={d} patch={patch} />;
    case "currencies":
      return <CurrenciesInspector d={d} patch={patch} />;
    case "collaborations":
      return <CollaborationsInspector d={d} patch={patch} />;
    case "customSection":
      return <CustomSectionInspector d={d} patch={patch} />;
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
