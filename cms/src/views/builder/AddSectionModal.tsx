"use client";

import * as React from "react";
import Icon, { type IconName } from "@/components/Icon";
import { builderApi, type CatalogueEntry } from "@/lib/builder-api";
import type { SectionMeta } from "./sectionsData";

type CustomLayout = "text-only" | "image-left" | "image-right";

export function AddSectionModal({
  open,
  existingSections,
  onClose,
  onAdded,
}: {
  open: boolean;
  existingSections: SectionMeta[];
  onClose: () => void;
  /** Callback fired with the new section's instanceId so the host can select it. */
  onAdded: (instanceId: string) => void;
}) {
  const [tab, setTab] = React.useState<"preset" | "custom">("preset");
  const [catalogue, setCatalogue] = React.useState<CatalogueEntry[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Preset flow: stage a picked preset so the user can name it before adding.
  const [stagedPreset, setStagedPreset] = React.useState<CatalogueEntry | null>(null);
  const [presetName, setPresetName] = React.useState("");

  // Custom flow.
  const [customLayout, setCustomLayout] = React.useState<CustomLayout>("text-only");
  const [customName, setCustomName] = React.useState("");

  // Counts per sectionKey, used to show "N in layout" badges and to compute
  // default names like "Features Section 2".
  const countByKey = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const s of existingSections) m.set(s.type, (m.get(s.type) ?? 0) + 1);
    return m;
  }, [existingSections]);

  React.useEffect(() => {
    if (!open || catalogue) return;
    setLoading(true);
    setError(null);
    builderApi
      .getCatalogue()
      .then(({ sections }) => setCatalogue(sections))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, catalogue]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (stagedPreset) setStagedPreset(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, stagedPreset]);

  // Reset state when the modal is closed externally so reopening starts fresh.
  React.useEffect(() => {
    if (open) return;
    setStagedPreset(null);
    setPresetName("");
    setCustomName("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const presets = catalogue ?? [];

  const handleAddPreset = async (preset: CatalogueEntry, rawName: string) => {
    setBusyKey(preset.key);
    setError(null);
    try {
      const { instance } = await builderApi.addSection({ sectionKey: preset.key });
      const trimmed = rawName.trim();
      const nextIndex = (countByKey.get(preset.key) ?? 0) + 1;
      const fallback = nextIndex > 1 ? `${preset.name} ${nextIndex}` : preset.name;
      const patchName = trimmed || fallback;
      if (patchName !== instance.name) {
        await builderApi.patchSection(instance.instanceId, { name: patchName });
      }
      onAdded(instance.instanceId);
      onClose();
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to add section");
    } finally {
      setBusyKey(null);
    }
  };

  const handleAddCustom = async (layout: CustomLayout, rawName: string) => {
    setBusyKey("customSection");
    setError(null);
    try {
      const { instance } = await builderApi.addSection({ sectionKey: "customSection" });
      const trimmed = rawName.trim();
      const nextIndex = (countByKey.get("customSection") ?? 0) + 1;
      const patch: { data?: Record<string, unknown>; name?: string } = {
        name: trimmed || `Custom Section ${nextIndex}`,
        data: { layout },
      };
      await builderApi.patchSection(instance.instanceId, patch);
      onAdded(instance.instanceId);
      onClose();
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to add section");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(2,6,16,.7)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, rgba(13,20,38,.96), rgba(9,14,28,.96))",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow: "0 30px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(4,186,191,.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 18px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          {stagedPreset && (
            <button
              className="btn icon ghost"
              onClick={() => setStagedPreset(null)}
              title="Back"
            >
              <Icon name="arrow-left" size={14} />
            </button>
          )}
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
              display: "grid",
              placeItems: "center",
              color: "#001819",
              boxShadow: "0 0 16px -2px rgba(4,186,191,.6)",
            }}
          >
            <Icon name="plus" size={15} />
          </span>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {stagedPreset ? `Add "${stagedPreset.name}"` : "Add a section"}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              {stagedPreset
                ? "Give this instance a name. It can be reordered and edited like any other section."
                : "Pick a preset or define a custom block."}
            </span>
          </div>
          <button className="btn icon ghost" onClick={onClose} title="Close (Esc)">
            <Icon name="x" size={14} />
          </button>
        </div>

        {!stagedPreset && (
          <div style={{ padding: "12px 18px 0" }}>
            <div className="tab-strip" style={{ width: "100%" }}>
              <button
                className={tab === "preset" ? "on" : ""}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setTab("preset")}
              >
                <Icon name="layers" size={11} /> Preset
              </button>
              <button
                className={tab === "custom" ? "on" : ""}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setTab("custom")}
              >
                <Icon name="wand" size={11} /> Custom
              </button>
            </div>
          </div>
        )}

        <div
          className="nice-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "16px 18px 18px" }}
        >
          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(255,107,128,.08)",
                border: "1px solid rgba(255,107,128,.25)",
                color: "#ffb1bd",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          {stagedPreset ? (
            <PresetConfirm
              preset={stagedPreset}
              countByKey={countByKey}
              name={presetName}
              setName={setPresetName}
              busy={busyKey === stagedPreset.key}
              onAdd={() => handleAddPreset(stagedPreset, presetName)}
            />
          ) : tab === "preset" ? (
            <PresetGrid
              loading={loading}
              presets={presets}
              countByKey={countByKey}
              busyKey={busyKey}
              onPick={(preset) => {
                setStagedPreset(preset);
                setPresetName("");
              }}
            />
          ) : (
            <CustomBuilder
              existingCount={countByKey.get("customSection") ?? 0}
              layout={customLayout}
              setLayout={setCustomLayout}
              name={customName}
              setName={setCustomName}
              busy={busyKey === "customSection"}
              onAdd={() => handleAddCustom(customLayout, customName)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PresetGrid({
  loading,
  presets,
  countByKey,
  busyKey,
  onPick,
}: {
  loading: boolean;
  presets: CatalogueEntry[];
  countByKey: Map<string, number>;
  busyKey: string | null;
  onPick: (preset: CatalogueEntry) => void;
}) {
  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
        Loading catalogue…
      </div>
    );
  }
  if (presets.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
        No section presets available.
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 10,
      }}
    >
      {presets.map((p) => {
        const count = countByKey.get(p.key) ?? 0;
        const busy = busyKey === p.key;
        // Locked types (AppHeader, Footer) stay singletons — adding a 2nd
        // would conflict with the layout-level singleton subpages depend on.
        const disabled = (p.locked && count > 0) || busy;
        return (
          <button
            key={p.key}
            onClick={() => !disabled && onPick(p)}
            disabled={disabled}
            className="btn"
            style={{
              padding: 12,
              alignItems: "flex-start",
              flexDirection: "column",
              gap: 8,
              textAlign: "left",
              opacity: disabled && !busy ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              borderColor: busy ? "rgba(4,186,191,.55)" : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
                  display: "grid",
                  placeItems: "center",
                  color: "#001819",
                  flexShrink: 0,
                }}
              >
                <Icon name={p.icon as IconName} size={14} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", flex: 1 }}>
                {p.name}
              </span>
              {count > 0 && (
                <span
                  className="mono"
                  style={{
                    fontSize: 9.5,
                    color: "var(--accent-2)",
                    background: "rgba(4,186,191,.1)",
                    border: "1px solid rgba(4,186,191,.3)",
                    padding: "2px 6px",
                    borderRadius: 999,
                    letterSpacing: ".05em",
                  }}
                >
                  ×{count}
                </span>
              )}
              {p.locked && (
                <Icon name="lock" size={11} style={{ color: "var(--text-3)" }} />
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {p.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PresetConfirm({
  preset,
  countByKey,
  name,
  setName,
  busy,
  onAdd,
}: {
  preset: CatalogueEntry;
  countByKey: Map<string, number>;
  name: string;
  setName: (v: string) => void;
  busy: boolean;
  onAdd: () => void;
}) {
  const nextIndex = (countByKey.get(preset.key) ?? 0) + 1;
  const placeholder = nextIndex > 1 ? `${preset.name} ${nextIndex}` : preset.name;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "rgba(4,186,191,.04)",
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
            display: "grid",
            placeItems: "center",
            color: "#001819",
            flexShrink: 0,
          }}
        >
          <Icon name={preset.icon as IconName} size={16} />
        </span>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{preset.name}</span>
          <span style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
            {preset.description}
          </span>
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 10.5,
            color: "var(--accent-2)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Section name
        </div>
        <input
          className="input small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) onAdd();
          }}
        />
        <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>
          Internal label shown in the Sections list. Leave blank to auto-name.
        </div>
      </div>
      <button
        className="btn primary"
        style={{ justifyContent: "center", padding: "10px 14px", opacity: busy ? 0.6 : 1 }}
        onClick={onAdd}
        disabled={busy}
      >
        <Icon name="plus" size={13} />
        {busy ? "Adding…" : `Add ${preset.name}`}
      </button>
    </div>
  );
}

function CustomBuilder({
  existingCount,
  layout,
  setLayout,
  name,
  setName,
  busy,
  onAdd,
}: {
  existingCount: number;
  layout: CustomLayout;
  setLayout: (v: CustomLayout) => void;
  name: string;
  setName: (v: string) => void;
  busy: boolean;
  onAdd: () => void;
}) {
  const Tile = ({
    value,
    label,
    sketch,
  }: {
    value: CustomLayout;
    label: string;
    sketch: React.ReactNode;
  }) => {
    const on = layout === value;
    return (
      <button
        className="btn"
        onClick={() => setLayout(value)}
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 8,
          padding: "14px 10px",
          background: on ? "rgba(4,186,191,.12)" : undefined,
          borderColor: on ? "rgba(4,186,191,.55)" : undefined,
          color: on ? "var(--accent-2)" : "var(--text-2)",
        }}
      >
        {sketch}
        <span style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div
          style={{
            fontSize: 10.5,
            color: "var(--accent-2)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Section name
        </div>
        <input
          className="input small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Custom Section ${existingCount + 1}`}
          autoFocus
        />
        <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>
          Internal label shown in the Sections list. Leave blank to auto-name.
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 10.5,
            color: "var(--accent-2)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Choose a layout
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Tile
            value="text-only"
            label="Text only"
            sketch={
              <svg width="68" height="44" viewBox="0 0 68 44" fill="none">
                <rect x="10" y="8" width="48" height="3" rx="1.5" fill="currentColor" />
                <rect x="10" y="16" width="48" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="10" y="24" width="48" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="10" y="32" width="32" height="3" rx="1.5" fill="currentColor" opacity=".5" />
              </svg>
            }
          />
          <Tile
            value="image-left"
            label="Image left"
            sketch={
              <svg width="68" height="44" viewBox="0 0 68 44" fill="none">
                <rect x="6" y="6" width="26" height="32" rx="3" fill="currentColor" opacity=".4" />
                <rect x="38" y="8" width="24" height="3" rx="1.5" fill="currentColor" />
                <rect x="38" y="16" width="24" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="38" y="24" width="20" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="38" y="32" width="16" height="3" rx="1.5" fill="currentColor" opacity=".5" />
              </svg>
            }
          />
          <Tile
            value="image-right"
            label="Image right"
            sketch={
              <svg width="68" height="44" viewBox="0 0 68 44" fill="none">
                <rect x="6" y="8" width="24" height="3" rx="1.5" fill="currentColor" />
                <rect x="6" y="16" width="24" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="6" y="24" width="20" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="6" y="32" width="16" height="3" rx="1.5" fill="currentColor" opacity=".5" />
                <rect x="36" y="6" width="26" height="32" rx="3" fill="currentColor" opacity=".4" />
              </svg>
            }
          />
        </div>
      </div>
      <button
        className="btn primary"
        style={{ justifyContent: "center", padding: "10px 14px", opacity: busy ? 0.6 : 1 }}
        onClick={onAdd}
        disabled={busy}
      >
        <Icon name="plus" size={13} />
        {busy ? "Adding…" : "Add custom section"}
      </button>
    </div>
  );
}
