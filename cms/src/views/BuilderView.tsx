"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { INITIAL_SECTIONS, type SectionMeta } from "./builder/sectionsData";
import { SectionInspector } from "./builder/inspectors";
import { LivePreview, type LivePreviewHandle, type Viewport } from "./builder/LivePreview";

type Layout = "mobile" | "tablet" | "desktop";

export default function BuilderView() {
  const [sections, setSections] = React.useState<SectionMeta[]>(INITIAL_SECTIONS);
  const [selectedId, setSelectedId] = React.useState<string>("homeHero");
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [status, setStatus] = React.useState<"draft" | "published">("published");
  const [isDirty, setIsDirty] = React.useState(false);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [showOutlines, setShowOutlines] = React.useState(true);

  // Adaptive layout for the builder shell itself (panels become drawers on tablet/mobile).
  const [layout, setLayout] = React.useState<Layout>("desktop");
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setLayout("mobile");
      else if (w < 1280) setLayout("tablet");
      else setLayout("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Default open-state per layout: desktop = both visible (panes are part of grid),
  // tablet/mobile = both closed (drawers).
  React.useEffect(() => {
    if (layout === "desktop") {
      setLeftOpen(true);
      setRightOpen(true);
    } else {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [layout]);

  // Close drawers on Escape (tablet/mobile only).
  React.useEffect(() => {
    if (layout === "desktop") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setLeftOpen(false);
      setRightOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout]);

  // Auto-open inspector drawer when user selects a section in non-desktop modes.
  const previousSelected = React.useRef(selectedId);
  React.useEffect(() => {
    if (layout !== "desktop" && previousSelected.current !== selectedId) {
      setRightOpen(true);
    }
    previousSelected.current = selectedId;
  }, [selectedId, layout]);

  const previewRef = React.useRef<LivePreviewHandle | null>(null);

  const selected = sections.find((s) => s.id === selectedId) ?? sections[1];

  const patch = (next: Record<string, unknown>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, data: { ...s.data, ...next } } : s))
    );
    setIsDirty(true);
    setStatus("draft");
    // Broadcast the patch to the iframe so the live preview updates immediately.
    previewRef.current?.send({
      type: "PREVIEW_PATCH",
      payload: { id: selectedId, data: next },
    });
  };

  const toggleVisible = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
    const next = sections.find((s) => s.id === id);
    if (next) {
      previewRef.current?.send({
        type: "PREVIEW_VISIBILITY",
        payload: { id, visible: !next.visible },
      });
    }
    setIsDirty(true);
    setStatus("draft");
  };

  const moveSection = (fromId: string, toId: string) => {
    setSections((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === fromId);
      const toIdx = prev.findIndex((s) => s.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
    setIsDirty(true);
    setStatus("draft");
  };

  // Re-broadcast all current data when the iframe announces it's ready (e.g., after navigation/reload).
  const handleReady = React.useCallback(() => {
    // LivePreview pushes initial state itself; nothing to do here unless we want to refresh.
  }, []);

  const handleSectionClicked = React.useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const isDrawerLayout = layout !== "desktop";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <BuilderTopbar
        viewport={viewport}
        setViewport={setViewport}
        status={status}
        setStatus={setStatus}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
        showOutlines={showOutlines}
        setShowOutlines={setShowOutlines}
        layout={layout}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        toggleLeft={() => {
          setLeftOpen((v) => !v);
          if (layout === "mobile") setRightOpen(false);
        }}
        toggleRight={() => {
          setRightOpen((v) => !v);
          if (layout === "mobile") setLeftOpen(false);
        }}
      />

      <div className={`builder-shell layout-${layout}`}>
        {/* Backdrop closes any open drawer on tablet/mobile */}
        {isDrawerLayout && (leftOpen || rightOpen) && (
          <div
            className="builder-backdrop"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          />
        )}

        {/* LEFT — Section navigator */}
        <aside
          className={`builder-pane left ${isDrawerLayout ? "drawer" : ""} ${
            isDrawerLayout && leftOpen ? "open" : ""
          }`}
          aria-hidden={isDrawerLayout && !leftOpen}
        >
          <div className="pane-header">
            <Icon name="layers" size={14} style={{ color: "var(--accent-2)" }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sections</span>
            <span
              className="mono"
              style={{
                fontSize: 9,
                color: "var(--text-3)",
                background: "rgba(255,255,255,.03)",
                padding: "2px 6px",
                borderRadius: 999,
                marginLeft: 4,
              }}
            >
              {sections.length}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button className="btn icon ghost" title="Search">
                <Icon name="search" size={13} />
              </button>
              <button className="btn icon ghost" title="Add section">
                <Icon name="plus" size={13} />
              </button>
            </div>
          </div>

          <div className="pane-body dense nice-scroll">
            {sections.map((s) => {
              const active = s.id === selectedId;
              return (
                <div
                  key={s.id}
                  className={`section-row ${active ? "active" : ""} ${!s.visible ? "hidden" : ""}`}
                  style={{
                    marginBottom: 4,
                    opacity: dragId === s.id ? 0.4 : undefined,
                    ...(overId === s.id
                      ? { boxShadow: "0 -2px 0 var(--accent), inset 0 0 0 1px rgba(4,186,191,.4)" }
                      : {}),
                  }}
                  draggable={!s.locked}
                  onDragStart={() => setDragId(s.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragId && dragId !== s.id) setOverId(s.id);
                  }}
                  onDragLeave={() => setOverId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId && dragId !== s.id) moveSection(dragId, s.id);
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  onClick={() => {
                    setSelectedId(s.id);
                    // Tell the iframe to scroll to this section right now —
                    // queued automatically if the bridge isn't ready yet.
                    previewRef.current?.scrollToSection(s.id);
                  }}
                >
                  <span className="grip" title={s.locked ? "Locked" : "Drag to reorder"}>
                    {s.locked ? <Icon name="lock" size={11} /> : <Icon name="grip" size={12} />}
                  </span>
                  <span className="ix">
                    <Icon name={s.icon} size={13} />
                  </span>
                  <span className="meta">
                    <span className="name">{s.name}</span>
                    <span className="file">{s.file}</span>
                  </span>
                  <button
                    className="btn icon ghost"
                    title={s.visible ? "Hide" : "Show"}
                    style={{ width: 26, height: 26 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisible(s.id);
                    }}
                  >
                    <Icon name={s.visible ? "eye" : "eye-off"} size={12} />
                  </button>
                </div>
              );
            })}

            <button
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 12,
                borderStyle: "dashed",
                color: "var(--accent-2)",
              }}
            >
              <Icon name="plus" size={12} />
              Add new section
            </button>
          </div>
        </aside>

        {/* CENTER — Live iframe preview */}
        <main className="builder-pane center" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <LivePreview
            ref={previewRef}
            sections={sections}
            viewport={viewport}
            setViewport={setViewport}
            selectedId={selectedId}
            status={status}
            isDirty={isDirty}
            onReady={handleReady}
            onSectionClicked={handleSectionClicked}
          />
        </main>

        {/* RIGHT — Inspector */}
        <aside
          className={`builder-pane right ${isDrawerLayout ? "drawer" : ""} ${
            isDrawerLayout && rightOpen ? "open" : ""
          }`}
          aria-hidden={isDrawerLayout && !rightOpen}
        >
          <div className="pane-header">
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
                color: "#001819",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 14px -2px rgba(4,186,191,.6)",
              }}
            >
              <Icon name={selected.icon} size={13} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{selected.name}</span>
              <span className="mono" style={{ fontSize: 9.5, color: "var(--text-3)" }}>
                {selected.file}
              </span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button className="btn icon ghost" title="Duplicate">
                <Icon name="copy" size={13} />
              </button>
              <button className="btn icon ghost" title="More">
                <Icon name="more" size={13} />
              </button>
            </div>
          </div>

          <div className="pane-body nice-scroll" style={{ padding: 0 }}>
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                className="chip"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: "5px 10px",
                  background: selected.visible ? "rgba(45,212,154,.08)" : "rgba(255,107,128,.08)",
                  borderColor: selected.visible ? "rgba(45,212,154,.25)" : "rgba(255,107,128,.25)",
                  color: selected.visible ? "#93f1c4" : "#ffb1bd",
                }}
              >
                <span className={`dot ${selected.visible ? "good" : "bad"}`} />
                {selected.visible ? "VISIBLE ON LIVE" : "HIDDEN"}
              </span>
              <button
                className="btn"
                style={{ padding: "5px 10px" }}
                onClick={() => toggleVisible(selected.id)}
              >
                <Icon name={selected.visible ? "eye-off" : "eye"} size={12} />
                {selected.visible ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ padding: "10px 14px 0" }}>
              <div className="tab-strip" style={{ width: "100%" }}>
                <button className="on" style={{ flex: 1, justifyContent: "center" }}>
                  <Icon name="type" size={11} /> Content
                </button>
                <button style={{ flex: 1, justifyContent: "center" }}>
                  <Icon name="palette" size={11} /> Style
                </button>
                <button style={{ flex: 1, justifyContent: "center" }}>
                  <Icon name="globe" size={11} /> SEO
                </button>
              </div>
            </div>

            <SectionInspector section={selected} patch={patch} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function BuilderTopbar({
  viewport,
  setViewport,
  status,
  setStatus,
  isDirty,
  setIsDirty,
  showOutlines,
  setShowOutlines,
  layout,
  leftOpen,
  rightOpen,
  toggleLeft,
  toggleRight,
}: {
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  status: "draft" | "published";
  setStatus: (s: "draft" | "published") => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;
  showOutlines: boolean;
  setShowOutlines: (v: boolean) => void;
  layout: Layout;
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}) {
  const isCompact = layout !== "desktop";
  return (
    <header className="builder-topbar">
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
      {isCompact && (
        <button
          className={`btn icon ghost builder-pane-toggle ${leftOpen ? "on" : ""}`}
          title="Sections"
          onClick={toggleLeft}
          style={{
            flexShrink: 0,
            background: leftOpen ? "rgba(4,186,191,.12)" : undefined,
            color: leftOpen ? "var(--accent-2)" : undefined,
          }}
        >
          <Icon name="layers" size={15} />
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {!isCompact && (
          <button className="btn icon ghost" title="Back">
            <Icon name="arrow-left" size={14} />
          </button>
        )}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
            display: "grid",
            placeItems: "center",
            color: "#001819",
            boxShadow: "0 0 14px -2px rgba(4,186,191,.6)",
            flexShrink: 0,
          }}
        >
          <Icon name="builder" size={14} />
        </span>
        {layout !== "mobile" && (
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Home / Landing Page
              </span>
              <Icon name="chevron-down" size={11} style={{ color: "var(--text-3)" }} />
            </div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".1em" }}>
              spay.com · main · v4.12.{isDirty ? "draft" : "stable"}
            </div>
          </div>
        )}
      </div>

      {!isCompact && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 12 }}>
          <button className="btn icon ghost" title="Undo (⌘Z)">
            <Icon name="undo" size={14} />
          </button>
          <button className="btn icon ghost" title="Redo (⌘⇧Z)">
            <Icon name="redo" size={14} />
          </button>
          <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />
          <button
            className="btn"
            style={{ padding: "7px 10px", fontSize: 12 }}
            onClick={() => setShowOutlines(!showOutlines)}
          >
            <Icon name={showOutlines ? "eye" : "eye-off"} size={12} />
            Outlines
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {layout === "desktop" && (
        <span className={`status-pill ${status === "published" && !isDirty ? "published" : "draft"}`}>
          <span className={`dot ${status === "published" && !isDirty ? "good" : "warn"}`} />
          {status === "published" && !isDirty
            ? "Published · in sync"
            : isDirty
            ? "Unsaved changes"
            : "Draft"}
        </span>
      )}

      {!isCompact && (
        <>
          <button className="btn" style={{ padding: "8px 12px" }}>
            <Icon name="eye" size={13} />
            Preview
          </button>
          <button
            className="btn"
            style={{ padding: "8px 12px" }}
            onClick={() => {
              setIsDirty(false);
              setStatus("draft");
            }}
          >
            <Icon name="save" size={13} />
            Save draft
          </button>
        </>
      )}
      <button
        className="btn primary"
        style={{ padding: isCompact ? "8px 12px" : "8px 14px" }}
        onClick={() => {
          setStatus("published");
          setIsDirty(false);
        }}
        title="Publish"
      >
        <Icon name="rocket" size={13} />
        {!isCompact && "Publish"}
      </button>
      {isCompact && (
        <button
          className={`btn icon ghost builder-pane-toggle ${rightOpen ? "on" : ""}`}
          title="Inspector"
          onClick={toggleRight}
          style={{
            flexShrink: 0,
            background: rightOpen ? "rgba(4,186,191,.12)" : undefined,
            color: rightOpen ? "var(--accent-2)" : undefined,
          }}
        >
          <Icon name="palette" size={15} />
        </button>
      )}
    </header>
  );
}
