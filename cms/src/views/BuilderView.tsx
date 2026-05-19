"use client";
import * as React from "react";
import Icon from "@/components/Icon";
import { HistoryPanel } from "@/components/HistoryPanel";
import { type SectionMeta, type SectionType } from "./builder/sectionsData";
import { SectionInspector } from "./builder/inspectors";
import { LivePreview, type LivePreviewHandle, type Viewport } from "./builder/LivePreview";
import { AddSectionModal } from "./builder/AddSectionModal";
import { PageSeoModal } from "./builder/PageSeoModal";
import { builderApi, type BackendLayoutItem, type BackendPage } from "@/lib/builder-api";

type Layout = "mobile" | "tablet" | "desktop";

function mapBackendItem(item: BackendLayoutItem): SectionMeta {
  // Every section is now keyed by its per-instance id so multiple instances of
  // any preset can coexist on the page (the home page renders dynamically from
  // the layout — see spay-website's DynamicPage).
  return {
    id: item.instanceId,
    instanceId: item.instanceId,
    type: item.sectionKey as SectionType,
    name: item.name,
    file: item.file,
    icon: item.icon as SectionMeta["icon"],
    visible: item.visible,
    locked: item.locked,
    description: item.description,
    data: item.data ?? {},
  };
}

export default function BuilderView() {
  const [sections, setSections] = React.useState<SectionMeta[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [status, setStatus] = React.useState<"draft" | "published">("draft");
  const [isDirty, setIsDirty] = React.useState(false);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [showOutlines, setShowOutlines] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [inspectorTab, setInspectorTab] = React.useState<"content" | "style">("content");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSeoOpen, setIsSeoOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  // Page-level metadata (separate from layout state) so the SEO modal has
  // something to hydrate from without re-fetching the page.
  const [pageMeta, setPageMeta] = React.useState<Pick<
    BackendPage,
    | "slug"
    | "title"
    | "seoTitle"
    | "seoDescription"
    | "seoKeywords"
    | "ogImage"
    | "noindex"
  > | null>(null);

  // Initial load from the backend.
  React.useEffect(() => {
    let cancelled = false;
    builderApi
      .getPage()
      .then(({ page }) => {
        if (cancelled) return;
        const mapped = page.draftLayout.map(mapBackendItem);
        setSections(mapped);
        // Snapshot the loaded layout so "Discard" can revert local edits
        // without a backend round-trip when nothing has been saved yet.
        baselineSectionsRef.current = mapped.map((s) => ({ ...s, data: { ...s.data } }));
        setSelectedId(mapped[0]?.id ?? "");
        setStatus(page.status);
        setIsDirty(page.isDirty);
        setPageMeta({
          slug: page.slug,
          title: page.title,
          seoTitle: page.seoTitle ?? null,
          seoDescription: page.seoDescription ?? null,
          seoKeywords: page.seoKeywords ?? null,
          ogImage: page.ogImage ?? null,
          noindex: page.noindex ?? false,
        });
        setIsLoaded(true);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err.message);
        setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Per-section pending edits, NOT yet sent to the backend. Content patches
  // stay local until the user clicks "Save draft" — auto-saving was removed
  // so the user has explicit control over what becomes a saved draft.
  const pendingPatchesRef = React.useRef<Record<string, Record<string, unknown>>>({});
  // Tracks whether any locally-pending edits exist for the topbar's discard
  // button enable-state.
  const [hasPendingEdits, setHasPendingEdits] = React.useState(false);

  // The last-loaded server state. Used to revert local edits when the user
  // clicks "Discard" without round-tripping the backend.
  const baselineSectionsRef = React.useRef<SectionMeta[]>([]);

  const flushPatch = React.useCallback(
    async (id: string): Promise<void> => {
      const diff = pendingPatchesRef.current[id];
      if (!diff || Object.keys(diff).length === 0) return;
      const section = sectionsRef.current.find((s) => s.id === id);
      if (!section?.instanceId) return;
      delete pendingPatchesRef.current[id];
      try {
        await builderApi.patchSection(section.instanceId, { data: diff });
      } catch (err) {
        const apiErr = err as { code?: string; message?: string; details?: unknown };
        const summary = {
          section: section.type,
          instanceId: section.instanceId,
          diff,
          code: apiErr.code ?? null,
          message: apiErr.message ?? null,
          details: apiErr.details ?? null,
        };
        // eslint-disable-next-line no-console
        console.error("[builder] patch failed:\n" + JSON.stringify(summary, null, 2));
        // eslint-disable-next-line no-console
        console.error("[builder] raw error object:", err);
        // Re-stage the diff so a retry on next save still picks it up.
        pendingPatchesRef.current[id] = { ...(pendingPatchesRef.current[id] ?? {}), ...diff };
        throw err;
      }
    },
    [],
  );

  const sectionsRef = React.useRef<SectionMeta[]>([]);
  React.useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Warn before the user leaves the page if they have unsaved local edits —
  // we deliberately don't auto-save, so the only safety net is the browser
  // beforeunload prompt.
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingPatchesRef.current).length === 0) return;
      e.preventDefault();
      // Some browsers need returnValue set for the prompt to show.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

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
    // Broadcast the patch to the iframe so the live preview updates immediately.
    previewRef.current?.send({
      type: "PREVIEW_PATCH",
      payload: { id: selectedId, data: next },
    });

    // Accumulate the diff per section id — actual backend writes happen on
    // explicit "Save draft" only. No auto-flush timer.
    const id = selectedId;
    pendingPatchesRef.current[id] = { ...(pendingPatchesRef.current[id] ?? {}), ...next };
    setHasPendingEdits(true);
  };

  const toggleVisible = (id: string) => {
    const target = sections.find((s) => s.id === id);
    if (!target) return;
    const nextVisible = !target.visible;
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: nextVisible } : s)));
    previewRef.current?.send({
      type: "PREVIEW_VISIBILITY",
      payload: { id, visible: nextVisible },
    });
    setIsDirty(true);
    setStatus("draft");
    if (target.instanceId) {
      builderApi
        .patchSection(target.instanceId, { visible: nextVisible })
        .catch((err) => console.error("[builder] visibility patch failed", err));
    }
  };

  const moveSection = (fromId: string, toId: string) => {
    const fromIdx = sections.findIndex((s) => s.id === fromId);
    const toIdx = sections.findIndex((s) => s.id === toId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;

    const next = [...sections];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    setSections(next);
    setIsDirty(true);
    setStatus("draft");

    const fromInstanceId = sections[fromIdx]?.instanceId;
    const toInstanceId = sections[toIdx]?.instanceId;
    if (fromInstanceId && toInstanceId) {
      builderApi
        .reorder({ fromInstanceId, toInstanceId })
        .catch((err) => console.error("[builder] reorder failed", err));
    }
  };

  const removeSection = React.useCallback(async (id: string) => {
    const target = sectionsRef.current.find((s) => s.id === id);
    if (!target?.instanceId) return;
    if (target.locked) {
      window.alert("This section is locked and cannot be deleted.");
      return;
    }
    if (
      !window.confirm(
        `Delete the "${target.name}" section? This is part of the current draft and can be undone with "Discard" until you publish.`,
      )
    ) {
      return;
    }
    try {
      await builderApi.deleteSection(target.instanceId);
      const next = sectionsRef.current.filter((s) => s.id !== id);
      setSections(next);
      // Drop any pending edits for the removed section.
      delete pendingPatchesRef.current[id];
      setHasPendingEdits(Object.keys(pendingPatchesRef.current).length > 0);
      // If the deleted row was selected, pick a sensible neighbour.
      if (selectedId === id) {
        const fallback = next[0]?.id ?? "";
        setSelectedId(fallback);
      }
      setIsDirty(true);
      setStatus("draft");
      // Keep the iframe in sync — hide the removed section immediately and
      // refresh the customSection list (used by the iframe's renderer).
      previewRef.current?.send({
        type: "PREVIEW_VISIBILITY",
        payload: { id, visible: false },
      });
      const customInstances = next
        .filter((s) => s.type === "customSection")
        .map((s) => s.id);
      previewRef.current?.send({
        type: "PREVIEW_LAYOUT",
        payload: { customInstances },
      });
    } catch (err) {
      const apiErr = err as { code?: string; message?: string };
      // eslint-disable-next-line no-console
      console.error("[builder] delete failed", err);
      window.alert(
        apiErr.code === "SECTION_LOCKED"
          ? "This section is locked and cannot be deleted."
          : `Delete failed: ${apiErr.message ?? "unknown error"}`,
      );
    }
  }, [selectedId]);

  const handleSectionAdded = React.useCallback(
    async (sectionKey: string) => {
      try {
        const { page } = await builderApi.getPage();
        const mapped = page.draftLayout.map(mapBackendItem);
        setSections(mapped);
        // Re-baseline: the add already wrote to the server draft, so this
        // is now the new "last server state" for Discard to fall back to.
        baselineSectionsRef.current = mapped.map((s) => ({ ...s, data: { ...s.data } }));
        setStatus(page.status);
        setIsDirty(page.isDirty);
        const added = mapped.find((s) => s.id === sectionKey);
        if (added) {
          setSelectedId(added.id);
          // Push the freshly-loaded data into the iframe and scroll to it.
          previewRef.current?.send({
            type: "PREVIEW_PATCH",
            payload: { id: added.id, data: added.data },
          });
          previewRef.current?.send({
            type: "PREVIEW_VISIBILITY",
            payload: { id: added.id, visible: added.visible },
          });
          previewRef.current?.scrollToSection(added.id);
        }
      } catch (err) {
        console.error("[builder] reload after add failed", err);
      }
    },
    [],
  );

  const saveDraft = React.useCallback(async () => {
    setIsSaving(true);
    try {
      // Flush every pending field patch first, then record a save revision.
      for (const id of Object.keys(pendingPatchesRef.current)) {
        await flushPatch(id);
      }
      const res = await builderApi.save({ kind: "manualSave" });
      setIsDirty(res.isDirty);
      // Re-baseline so the next Discard reverts to what we just saved.
      baselineSectionsRef.current = sectionsRef.current.map((s) => ({
        ...s,
        data: { ...s.data },
      }));
      setHasPendingEdits(false);
    } catch (err) {
      console.error("[builder] save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [flushPatch]);

  const [isDiscarding, setIsDiscarding] = React.useState(false);
  const discardDraft = React.useCallback(async () => {
    const hasLocal = Object.keys(pendingPatchesRef.current).length > 0;
    if (
      !window.confirm(
        hasLocal
          ? "Discard unsaved changes? This will also clear any saved draft and restore the page to its last published state."
          : "Remove the current draft? The page will be restored to its last published state.",
      )
    ) {
      return;
    }
    setIsDiscarding(true);
    try {
      const { page } = await builderApi.discardDraft();
      const mapped = page.draftLayout.map(mapBackendItem);
      // Reset everything to the freshly-loaded server state.
      pendingPatchesRef.current = {};
      setHasPendingEdits(false);
      setSections(mapped);
      baselineSectionsRef.current = mapped.map((s) => ({ ...s, data: { ...s.data } }));
      setStatus(page.status);
      setIsDirty(page.isDirty);
      // Push the restored data into the iframe so the live preview matches.
      for (const s of mapped) {
        previewRef.current?.send({
          type: "PREVIEW_PATCH",
          payload: { id: s.id, data: s.data },
        });
        previewRef.current?.send({
          type: "PREVIEW_VISIBILITY",
          payload: { id: s.id, visible: s.visible },
        });
      }
      // Custom-section list may have shrunk/grown — keep iframe in sync.
      const customInstances = mapped
        .filter((s) => s.type === "customSection")
        .map((s) => s.id);
      previewRef.current?.send({
        type: "PREVIEW_LAYOUT",
        payload: { customInstances },
      });
    } catch (err) {
      console.error("[builder] discard failed", err);
    } finally {
      setIsDiscarding(false);
    }
  }, []);

  const publishPage = React.useCallback(async () => {
    setIsPublishing(true);
    try {
      // Flush pending patches first so publish includes the latest local edits.
      for (const id of Object.keys(pendingPatchesRef.current)) {
        await flushPatch(id);
      }
      const res = await builderApi.publish();
      setStatus(res.status);
      setIsDirty(res.isDirty);
      baselineSectionsRef.current = sectionsRef.current.map((s) => ({
        ...s,
        data: { ...s.data },
      }));
      setHasPendingEdits(false);
    } catch (err) {
      console.error("[builder] publish failed", err);
    } finally {
      setIsPublishing(false);
    }
  }, [flushPatch]);

  // Re-broadcast all current data when the iframe announces it's ready (e.g., after navigation/reload).
  const handleReady = React.useCallback(() => {
    // LivePreview pushes initial state itself; nothing to do here unless we want to refresh.
  }, []);

  const handleSectionClicked = React.useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const isDrawerLayout = layout !== "desktop";

  if (loadError) {
    return (
      <div style={{ padding: 40, color: "var(--text-2)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Could not load the Builder
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 12 }}>
          {loadError}
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
          Is cms-backend running at {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}?
          Did you run `npm run seed`?
        </div>
      </div>
    );
  }

  if (!isLoaded || sections.length === 0) {
    return (
      <div style={{ padding: 40, color: "var(--text-3)", fontSize: 12 }}>
        Loading builder…
      </div>
    );
  }

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
        onSaveDraft={saveDraft}
        onPublish={publishPage}
        onDiscardDraft={discardDraft}
        onOpenSeo={() => setIsSeoOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isSaving={isSaving}
        isPublishing={isPublishing}
        isDiscarding={isDiscarding}
        hasPendingEdits={hasPendingEdits}
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
          </div>

          <div className="pane-body dense nice-scroll">
            <button
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                marginBottom: 10,
                borderStyle: "dashed",
                color: "var(--accent-2)",
              }}
              onClick={() => setIsAddOpen(true)}
            >
              <Icon name="plus" size={12} />
              Add new section
            </button>

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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      className="btn icon ghost"
                      title={s.visible ? "Hide" : "Show"}
                      style={{ width: 24, height: 24, padding: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisible(s.id);
                      }}
                    >
                      <Icon name={s.visible ? "eye" : "eye-off"} size={12} />
                    </button>
                    <button
                      className="btn icon ghost"
                      title={s.locked ? "Locked sections can't be deleted" : "Delete section"}
                      style={{
                        width: 24,
                        height: 24,
                        padding: 0,
                        opacity: s.locked ? 0.3 : 1,
                        cursor: s.locked ? "not-allowed" : "pointer",
                      }}
                      disabled={s.locked}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!s.locked) removeSection(s.id);
                      }}
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

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
                <button
                  className={inspectorTab === "content" ? "on" : ""}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setInspectorTab("content")}
                >
                  <Icon name="type" size={11} /> Content
                </button>
                <button
                  className={inspectorTab === "style" ? "on" : ""}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setInspectorTab("style")}
                >
                  <Icon name="palette" size={11} /> Style
                </button>
              </div>
            </div>

            <SectionInspector section={selected} patch={patch} tab={inspectorTab} />
          </div>
        </aside>
      </div>

      <AddSectionModal
        open={isAddOpen}
        existingSections={sections}
        onClose={() => setIsAddOpen(false)}
        onAdded={handleSectionAdded}
      />

      <PageSeoModal
        open={isSeoOpen}
        page={pageMeta}
        onClose={() => setIsSeoOpen(false)}
        onSaved={(updated) => {
          setPageMeta({
            slug: updated.slug,
            title: updated.title,
            seoTitle: updated.seoTitle ?? null,
            seoDescription: updated.seoDescription ?? null,
            seoKeywords: updated.seoKeywords ?? null,
            ogImage: updated.ogImage ?? null,
            noindex: updated.noindex ?? false,
          });
        }}
      />

      <HistoryPanel
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        fetchRevisions={async () => {
          const { revisions } = await builderApi.listRevisions();
          return revisions.map((r) => ({
            id: r.id,
            kind: r.kind,
            version: r.version,
            note: r.note,
            authorId: r.authorId,
            createdAt: r.createdAt,
          }));
        }}
        onRestore={async (revisionId) => {
          // Discard any pending in-flight edits — the restore is going to
          // replace the entire draft layout anyway, and keeping a stale
          // diff staged would re-clobber the restored state on next save.
          pendingPatchesRef.current = {};
          setHasPendingEdits(false);
          const { layout } = await builderApi.restoreRevision(revisionId);
          const mapped = layout.map(mapBackendItem);
          setSections(mapped);
          baselineSectionsRef.current = mapped.map((s) => ({
            ...s,
            data: { ...s.data },
          }));
          setIsDirty(true);
          // Push the restored content into the live preview so the iframe
          // updates immediately rather than waiting for a save.
          for (const s of mapped) {
            previewRef.current?.send({
              type: "PREVIEW_PATCH",
              payload: { id: s.id, data: s.data },
            });
          }
          previewRef.current?.send({
            type: "PREVIEW_LAYOUT",
            payload: {
              layout: mapped.map((s) => ({
                instanceId: s.id,
                sectionKey: s.type,
                name: s.name,
              })),
            },
          });
        }}
      />
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
  onSaveDraft,
  onPublish,
  onDiscardDraft,
  onOpenSeo,
  onOpenHistory,
  isSaving,
  isPublishing,
  isDiscarding,
  hasPendingEdits,
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
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscardDraft: () => void;
  onOpenSeo: () => void;
  onOpenHistory: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  isDiscarding: boolean;
  hasPendingEdits: boolean;
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
          <button
            className="btn"
            style={{ padding: "7px 10px", fontSize: 12 }}
            onClick={onOpenSeo}
            title="Edit SEO metadata for the home page"
          >
            <Icon name="globe" size={12} />
            SEO
          </button>
          <button
            className="btn"
            style={{ padding: "7px 10px", fontSize: 12 }}
            onClick={onOpenHistory}
            title="View revision history"
          >
            <Icon name="history" size={12} />
            History
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {layout === "desktop" && (
        <span
          className={`status-pill ${
            status === "published" && !isDirty && !hasPendingEdits ? "published" : "draft"
          }`}
          title={
            hasPendingEdits
              ? "You have unsaved edits. Click \"Save draft\" to persist them."
              : undefined
          }
        >
          <span
            className={`dot ${
              status === "published" && !isDirty && !hasPendingEdits ? "good" : "warn"
            }`}
          />
          {hasPendingEdits
            ? "Unsaved edits"
            : status === "published" && !isDirty
            ? "Published · in sync"
            : isDirty
            ? "Draft saved"
            : "Draft"}
        </span>
      )}

      {!isCompact && (hasPendingEdits || isDirty) && (
        <button
          className="btn"
          style={{ padding: "8px 12px", opacity: isDiscarding ? 0.6 : 1 }}
          onClick={onDiscardDraft}
          disabled={isDiscarding}
          title={
            hasPendingEdits
              ? "Discard unsaved edits and remove the saved draft"
              : "Remove the saved draft and restore the last published state"
          }
        >
          <Icon name="trash" size={13} />
          {isDiscarding ? "Discarding…" : "Discard"}
        </button>
      )}

      {!isCompact && (
        <button
          className="btn"
          style={{
            padding: "8px 12px",
            opacity: isSaving ? 0.6 : 1,
            // Visually emphasize the save action when there are pending edits.
            ...(hasPendingEdits
              ? {
                  borderColor: "rgba(4,186,191,.5)",
                  boxShadow: "0 0 0 1px rgba(4,186,191,.25)",
                  color: "var(--accent-2)",
                }
              : {}),
          }}
          onClick={onSaveDraft}
          disabled={isSaving || !hasPendingEdits}
          title={
            hasPendingEdits
              ? "Persist your edits as a draft"
              : "No unsaved edits"
          }
        >
          <Icon name="save" size={13} />
          {isSaving ? "Saving…" : "Save draft"}
        </button>
      )}
      <button
        className="btn primary"
        style={{
          padding: isCompact ? "8px 12px" : "8px 14px",
          opacity: isPublishing ? 0.6 : 1,
        }}
        onClick={onPublish}
        disabled={isPublishing}
        title="Publish"
      >
        <Icon name="rocket" size={13} />
        {!isCompact && (isPublishing ? "Publishing…" : "Publish")}
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
