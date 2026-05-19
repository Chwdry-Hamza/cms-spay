"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";
import { HistoryPanel } from "@/components/HistoryPanel";
import {
  LinkPickerModal,
  buildLinkMarkdown,
} from "@/components/LinkPickerModal";
import { SlugRenameConfirmModal } from "@/components/SlugRenameConfirmModal";
import {
  contentPagesApi,
  newBlockId,
  type ContentBlock,
  type ContentPage,
  type ContentPageBacklink,
  type HeadingLevel,
  type TagUsage,
} from "@/lib/content-pages-api";
import { TagChipInput } from "@/components/TagChipInput";

/**
 * Replace the current selection in a textarea with the given markdown
 * string. Returns the next textarea value plus the cursor position the
 * caller should restore after React re-renders. If the textarea isn't
 * mounted yet, falls back to appending the markdown at the end.
 */
function insertAtSelection(
  textarea: HTMLTextAreaElement | null,
  currentValue: string,
  insertion: string,
): { nextValue: string; cursor: number } {
  const start = textarea?.selectionStart ?? currentValue.length;
  const end = textarea?.selectionEnd ?? currentValue.length;
  const nextValue =
    currentValue.slice(0, start) + insertion + currentValue.slice(end);
  return { nextValue, cursor: start + insertion.length };
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * The public site host content pages are actually served from
 * (e.g. spay-website on http://localhost:3000). Used by the canvas preview
 * to resolve `/slug` internal links to their true public URL — without
 * this, the browser would interpret them relative to the CMS host
 * (localhost:3001), so editors hovering a link would see the wrong URL
 * and right-click "Open in new tab" would 404.
 */
const PUBLIC_SITE_BASE =
  process.env.NEXT_PUBLIC_PREVIEW_URL || "http://localhost:3000";

/**
 * Format a scheduled-publish ISO timestamp for the topbar badge. Drops the
 * year when the schedule is in the same calendar year as today (most
 * common case) so the chip stays compact.
 */
function formatScheduledLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Convert a Date to the value format the native `<input type="datetime-local">`
 * expects: `YYYY-MM-DDTHH:mm` in the user's local timezone (no offset, no
 * seconds). The browser does no normalization so we have to be exact.
 */
function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * Heading text inputs are sized to look like the rendered output. Lets the
 * editor see at a glance how a heading will appear on the published page.
 */
const HEADING_INPUT_FONT_SIZE: Record<HeadingLevel, number> = {
  1: 26,
  2: 22,
  3: 18,
  4: 16,
  5: 14,
  6: 13,
};

const BLOCK_TYPES: Array<{ type: ContentBlock["type"]; label: string; icon: IconName }> = [
  { type: "heading", label: "Heading", icon: "h1" },
  { type: "paragraph", label: "Paragraph", icon: "type" },
  { type: "list", label: "List", icon: "list" },
  { type: "table", label: "Table", icon: "grid" },
  { type: "note", label: "Note", icon: "info" },
  { type: "divider", label: "Divider", icon: "grip" },
];

/**
 * Best-effort conversion between block types. Text content is preserved as
 * much as possible:
 *   - headings/paragraphs/notes → single plain string (loses colors / parts)
 *   - lists → joined with newlines for text targets, kept as items for list
 *   - tables → cells flattened
 *   - dividers → no content
 *
 * Anywhere the new type would otherwise be empty we fall back to placeholder
 * text so the block stays editable instead of disappearing.
 */
function convertBlock(
  block: ContentBlock,
  newType: ContentBlock["type"],
  options?: { level?: HeadingLevel; ordered?: boolean },
): ContentBlock {
  const id = block.id;

  const extracted: string = (() => {
    switch (block.type) {
      case "heading":
        return block.parts.map((p) => p.text).join("");
      case "paragraph":
      case "note":
        return block.text;
      case "list":
        return block.items.join("\n");
      case "table":
        return block.rows
          .flat()
          .map((c) => c.trim())
          .filter(Boolean)
          .join("\n");
      case "divider":
        return "";
    }
  })();

  switch (newType) {
    case "heading":
      return {
        id,
        type: "heading",
        level: options?.level ?? 2,
        parts: [{ text: extracted.trim() || "New heading", color: "#ffffff" }],
      };
    case "paragraph":
      return { id, type: "paragraph", text: extracted };
    case "note":
      return { id, type: "note", text: extracted };
    case "list": {
      const items = extracted
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return {
        id,
        type: "list",
        ordered: options?.ordered ?? (block.type === "list" ? block.ordered : false),
        items: items.length > 0 ? items : [""],
      };
    }
    case "table":
      // Default 2-column starter, but if we came from a list we put each
      // item in its own row so no content is lost.
      if (block.type === "list" && block.items.length > 0) {
        return {
          id,
          type: "table",
          hasHeaderRow: true,
          rows: [["Column 1", "Column 2"], ...block.items.map((it) => [it, ""])],
        };
      }
      return {
        id,
        type: "table",
        hasHeaderRow: true,
        rows: [
          ["Column 1", "Column 2"],
          [extracted, ""],
        ],
      };
    case "divider":
      return { id, type: "divider" };
  }
}

function emptyBlock(type: ContentBlock["type"]): ContentBlock {
  const id = newBlockId();
  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, parts: [{ text: "New heading", color: "#ffffff" }] };
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "list":
      return { id, type: "list", ordered: false, items: [""] };
    case "note":
      return { id, type: "note", text: "" };
    case "divider":
      return { id, type: "divider" };
    case "table":
      // 2×2 starter grid with a header row turned on by default — most
      // tables in long-form content have one.
      return {
        id,
        type: "table",
        hasHeaderRow: true,
        rows: [
          ["Column 1", "Column 2"],
          ["", ""],
        ],
      };
  }
}

export default function ContentPageEditorView({ slug }: { slug: string }) {
  const router = useRouter();
  const [page, setPage] = React.useState<ContentPage | null>(null);
  const [blocks, setBlocks] = React.useState<ContentBlock[]>([]);
  const [title, setTitle] = React.useState("");
  const [slugInput, setSlugInput] = React.useState("");
  const [footerLabel, setFooterLabel] = React.useState<string>("");
  const [showInFooter, setShowInFooter] = React.useState(true);
  const [effectiveDate, setEffectiveDate] = React.useState<string>("");
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [seoTitle, setSeoTitle] = React.useState<string>("");
  const [seoDescription, setSeoDescription] = React.useState<string>("");
  const [seoKeywords, setSeoKeywords] = React.useState<string>("");
  const [ogImage, setOgImage] = React.useState<string>("");
  const [noindex, setNoindex] = React.useState<boolean>(false);
  const [tags, setTags] = React.useState<string[]>([]);
  // Workspace-wide tag suggestions used for autocomplete inside the
  // TagChipInput. Loaded once on mount and refreshed after each save so
  // a freshly-typed tag becomes available across other pages without a
  // full reload.
  const [tagSuggestions, setTagSuggestions] = React.useState<TagUsage[]>([]);
  const [isDirty, setIsDirty] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isDiscarding, setIsDiscarding] = React.useState(false);
  const [isScheduling, setIsScheduling] = React.useState(false);
  const [isCancelingSchedule, setIsCancelingSchedule] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleAtLocal, setScheduleAtLocal] = React.useState("");
  const [rightTab, setRightTab] = React.useState<
    "block" | "insert" | "page" | "seo"
  >("insert");
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [backlinks, setBacklinks] = React.useState<ContentPageBacklink[] | null>(
    null,
  );
  const [backlinksLoading, setBacklinksLoading] = React.useState(false);
  const [backlinksError, setBacklinksError] = React.useState<string | null>(null);
  // When the editor renames a slug that other pages link to, we capture
  // the rename here and surface the SlugRenameConfirmModal. The actual
  // save/publish only runs after the editor picks one of the three modal
  // outcomes (rewrite / redirect-only / cancel).
  const [pendingSlugRename, setPendingSlugRename] = React.useState<{
    fromSlug: string;
    toSlug: string;
    kind: "save" | "publish";
  } | null>(null);

  /**
   * (Re)load the "Pages linking here" panel. Fired on slug change and
   * after any operation that could affect the link graph (save, publish,
   * restore, rewrite). Cheap enough to re-run eagerly because the
   * endpoint is a single indexed Mongo query.
   */
  const loadBacklinks = React.useCallback(async () => {
    setBacklinksLoading(true);
    setBacklinksError(null);
    try {
      const { backlinks: rows } = await contentPagesApi.listBacklinks(slug);
      setBacklinks(rows);
    } catch (e) {
      setBacklinks(null);
      setBacklinksError((e as Error).message);
    } finally {
      setBacklinksLoading(false);
    }
  }, [slug]);

  const selectBlock = React.useCallback((id: string) => {
    setSelectedBlockId(id);
    setRightTab("block");
  }, []);

  // Snapshot fetchers passed to <HistoryPanel>. Memoized so the panel's
  // effect doesn't re-fetch on every editor render. Tolerant of either
  // shape the backend may emit while migrating: `id` (current, normalized)
  // or `_id` (legacy raw Mongoose). Rows without any usable id are
  // dropped so the Restore button can't fire with a missing/undefined id.
  const fetchHistory = React.useCallback(async () => {
    const { revisions } = await contentPagesApi.listRevisions(slug);
    const REV_ID = /^[a-f0-9]{24}$/;
    return revisions
      .map((r) => {
        const rawId =
          r.id ?? (r as unknown as { _id?: unknown })._id ?? null;
        const id =
          typeof rawId === "string"
            ? rawId
            : rawId != null
            ? String(rawId)
            : "";
        return {
          id,
          kind: r.kind,
          version: r.version,
          note: r.note,
          authorId: r.authorId,
          createdAt: r.createdAt,
        };
      })
      .filter((r) => REV_ID.test(r.id));
  }, [slug]);

  const handleRestoreHistory = React.useCallback(
    async (revisionId: string) => {
      // Guard against any path that somehow reaches us with a missing/
      // malformed id — otherwise it ends up in the URL as the literal
      // string "undefined" and the backend returns a confusing
      // "Revision id 'undefined' is not a valid format" error.
      if (!revisionId || !/^[a-f0-9]{24}$/.test(revisionId)) {
        throw new Error(
          "This revision is missing a valid id. Close the history panel and reopen it to refresh the list.",
        );
      }
      const { page: restored } = await contentPagesApi.restoreRevision(
        slug,
        revisionId,
      );
      hydrate(restored);
      syncRoute(restored.slug);
    },
    // `hydrate` and `syncRoute` are stable in this component lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug],
  );

  const hydrate = React.useCallback((p: ContentPage) => {
    setPage(p);
    setBlocks(p.draftBlocks.map((b) => ({ ...b })));
    setSelectedBlockId(null);
    setTitle(p.title);
    setSlugInput(p.slug);
    setFooterLabel(p.footerLabel ?? "");
    setShowInFooter(p.showInFooter);
    setEffectiveDate(p.effectiveDate ?? "");
    setLastUpdated(p.lastUpdated ?? "");
    setSeoTitle(p.seoTitle ?? "");
    setSeoDescription(p.seoDescription ?? "");
    setSeoKeywords(p.seoKeywords ?? "");
    setOgImage(p.ogImage ?? "");
    setNoindex(p.noindex ?? false);
    setTags(p.tags ?? []);
    setIsDirty(p.isDirty);
  }, []);

  // Workspace tag suggestions for the chip-input autocomplete. Refreshed
  // after each save so newly-coined tags propagate across the editor
  // without a hard page reload.
  const loadTagSuggestions = React.useCallback(async () => {
    try {
      const { tags: rows } = await contentPagesApi.listTags();
      setTagSuggestions(rows);
    } catch {
      // Non-fatal — autocomplete just shows fewer suggestions.
      setTagSuggestions([]);
    }
  }, []);

  React.useEffect(() => {
    loadTagSuggestions();
  }, [loadTagSuggestions]);

  React.useEffect(() => {
    let cancelled = false;
    contentPagesApi
      .get(slug)
      .then(({ page: p }) => {
        if (cancelled) return;
        hydrate(p);
        setIsLoaded(true);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setLoadError(e.message);
        setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, hydrate]);

  // Backlinks ("Pages linking here") are loaded alongside the page itself
  // so the Page tab is immediately useful when opened. Refetched on slug
  // change too, because a slug rename can shift this page's incoming
  // links (other pages got rewritten or now point at a redirect).
  React.useEffect(() => {
    loadBacklinks();
  }, [loadBacklinks]);

  // Warn before navigating away with unsaved changes.
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const mutate = (next: ContentBlock[]) => {
    setBlocks(next);
    setIsDirty(true);
  };

  const updateBlock = (id: string, patch: Partial<ContentBlock>) => {
    mutate(
      blocks.map((b) =>
        b.id === id ? ({ ...b, ...patch } as ContentBlock) : b,
      ),
    );
  };

  /**
   * Wholesale block replacement — used by the per-block "Convert to…"
   * popover so the new block's discriminant fields (e.g. `parts`, `items`,
   * `rows`) cleanly replace the old ones instead of being shallow-merged.
   */
  const replaceBlock = (id: string, next: ContentBlock) => {
    mutate(blocks.map((b) => (b.id === id ? next : b)));
  };

  const appendAndScroll = (block: ContentBlock) => {
    mutate([...blocks, block]);
    setSelectedBlockId(block.id);
    setRightTab("block");
    requestAnimationFrame(() => {
      document.getElementById(`block-${block.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const appendHeading = (level: HeadingLevel) =>
    appendAndScroll({
      id: newBlockId(),
      type: "heading",
      level,
      parts: [{ text: "New heading", color: "#ffffff" }],
    });

  const appendList = (ordered: boolean) =>
    appendAndScroll({ id: newBlockId(), type: "list", ordered, items: [""] });

  const appendByType = (type: ContentBlock["type"]) =>
    appendAndScroll(emptyBlock(type));

  const removeBlock = (id: string) => {
    mutate(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    mutate(next);
  };

  const nullableTrim = (v: string) => (v.trim() === "" ? null : v.trim());

  /**
   * Returns the slug to send in the update body — only when the editor has
   * typed something different from the current page slug AND the new value
   * is a valid slug format. Returns `undefined` to skip the field otherwise,
   * which keeps an in-progress invalid edit from blocking saves.
   */
  const slugChangedAndValid = (): string | undefined => {
    const next = slugInput.trim().toLowerCase();
    if (!next || next === page?.slug) return undefined;
    if (!SLUG_PATTERN.test(next)) return undefined;
    return next;
  };

  const slugIsInvalid = (() => {
    const v = slugInput.trim();
    return v !== "" && !SLUG_PATTERN.test(v);
  })();

  /**
   * After save/publish, the API may have returned a renamed page. Update
   * the URL in the browser without a full reload so further edits target
   * the new slug.
   */
  const syncRoute = (newSlug: string) => {
    if (newSlug && newSlug !== slug) {
      router.replace(`/content-pages/${encodeURIComponent(newSlug)}`);
    }
  };

  /**
   * The shared update payload for save / publish. Extracted so the
   * rename-confirm flow can re-issue the same update without
   * stringifying the body in two places.
   */
  const buildUpdateBody = (nextSlug: string | undefined) => ({
    ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
    title: title.trim() || page?.title,
    footerLabel: nullableTrim(footerLabel),
    showInFooter,
    effectiveDate: nullableTrim(effectiveDate),
    lastUpdated: nullableTrim(lastUpdated),
    seoTitle: nullableTrim(seoTitle),
    seoDescription: nullableTrim(seoDescription),
    seoKeywords: nullableTrim(seoKeywords),
    ogImage: nullableTrim(ogImage),
    noindex,
    tags,
    blocks,
  });

  /**
   * Run the actual save against the API, optionally bulk-rewriting
   * backlinks if the editor just confirmed a slug rename. Surfaces all
   * failures to the user but always clears the busy flag.
   */
  const commitSave = async (rewriteBacklinks: boolean) => {
    setIsSaving(true);
    try {
      const nextSlug = slugChangedAndValid();
      const fromSlug = page?.slug;
      const { page: p } = await contentPagesApi.update(
        slug,
        buildUpdateBody(nextSlug),
      );
      hydrate(p);
      syncRoute(p.slug);
      if (
        rewriteBacklinks &&
        fromSlug &&
        nextSlug &&
        fromSlug !== nextSlug
      ) {
        await contentPagesApi.rewriteInternalLinks(fromSlug, nextSlug);
      }
      // Backlink graph likely changed (slug renamed and/or rewrites
      // applied), so refresh the panel.
      await loadBacklinks();
      // Tag set may have grown — refresh the autocomplete pool so newly
      // coined tags are available immediately in the next edit session.
      await loadTagSuggestions();
    } catch (e) {
      window.alert(`Save failed: ${(e as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const commitPublish = async (rewriteBacklinks: boolean) => {
    setIsPublishing(true);
    try {
      const nextSlug = slugChangedAndValid();
      const fromSlug = page?.slug;
      // Save first so publish uses the latest content.
      const { page: saved } = await contentPagesApi.update(
        slug,
        buildUpdateBody(nextSlug),
      );
      hydrate(saved);
      if (
        rewriteBacklinks &&
        fromSlug &&
        nextSlug &&
        fromSlug !== nextSlug
      ) {
        await contentPagesApi.rewriteInternalLinks(fromSlug, nextSlug);
      }
      // Publish endpoint takes the (possibly renamed) saved.slug.
      const { page: published } = await contentPagesApi.publish(saved.slug);
      hydrate(published);
      syncRoute(published.slug);
      await loadBacklinks();
    } catch (e) {
      window.alert(`Publish failed: ${(e as Error).message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Save-button entry point. Intercepts a slug rename that would orphan
   * existing backlinks — in that case the SlugRenameConfirmModal opens
   * and the actual save runs only after the editor picks an option.
   */
  const save = async () => {
    const nextSlug = slugChangedAndValid();
    if (
      nextSlug &&
      page?.slug &&
      backlinks &&
      backlinks.length > 0
    ) {
      setPendingSlugRename({
        fromSlug: page.slug,
        toSlug: nextSlug,
        kind: "save",
      });
      return;
    }
    await commitSave(false);
  };

  const publish = async () => {
    const nextSlug = slugChangedAndValid();
    if (
      nextSlug &&
      page?.slug &&
      backlinks &&
      backlinks.length > 0
    ) {
      setPendingSlugRename({
        fromSlug: page.slug,
        toSlug: nextSlug,
        kind: "publish",
      });
      return;
    }
    await commitPublish(false);
  };

  /** Modal confirmation handler — runs the save/publish the editor just
   *  approved, with the chosen rewrite flag. */
  const handleSlugRenameConfirm = async (rewriteBacklinks: boolean) => {
    if (!pendingSlugRename) return;
    const kind = pendingSlugRename.kind;
    setPendingSlugRename(null);
    if (kind === "publish") {
      await commitPublish(rewriteBacklinks);
    } else {
      await commitSave(rewriteBacklinks);
    }
  };

  const discard = async () => {
    if (
      !window.confirm(
        "Discard the current draft? The page will be restored to its last published state.",
      )
    ) {
      return;
    }
    setIsDiscarding(true);
    try {
      const { page: p } = await contentPagesApi.discardDraft(slug);
      hydrate(p);
    } catch (e) {
      window.alert(`Discard failed: ${(e as Error).message}`);
    } finally {
      setIsDiscarding(false);
    }
  };

  /**
   * The native `<input type="datetime-local">` returns a string formatted in
   * the *user's local* timezone with no offset (e.g. "2026-05-01T00:00"). We
   * parse it back through Date in the same timezone, then ship the resulting
   * absolute moment to the backend as ISO-UTC.
   */
  const schedule = async () => {
    if (!scheduleAtLocal) return;
    const parsed = new Date(scheduleAtLocal);
    if (Number.isNaN(parsed.getTime())) {
      window.alert("Pick a valid date and time.");
      return;
    }
    if (parsed.getTime() - Date.now() < 60_000) {
      window.alert("Pick a time at least one minute in the future.");
      return;
    }
    setIsScheduling(true);
    try {
      // Save in-flight edits first so the scheduled publish sees them.
      const nextSlug = slugChangedAndValid();
      const { page: saved } = await contentPagesApi.update(slug, {
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
        title: title.trim() || page?.title,
        footerLabel: nullableTrim(footerLabel),
        showInFooter,
        effectiveDate: nullableTrim(effectiveDate),
        lastUpdated: nullableTrim(lastUpdated),
        seoTitle: nullableTrim(seoTitle),
        seoDescription: nullableTrim(seoDescription),
        seoKeywords: nullableTrim(seoKeywords),
        ogImage: nullableTrim(ogImage),
        noindex,
        blocks,
      });
      hydrate(saved);
      syncRoute(saved.slug);
      const { page: scheduled } = await contentPagesApi.schedulePublish(
        saved.slug,
        parsed.toISOString(),
      );
      hydrate(scheduled);
      setScheduleOpen(false);
    } catch (e) {
      window.alert(`Could not schedule: ${(e as Error).message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  const cancelSchedule = async () => {
    if (!window.confirm("Cancel the scheduled publish? The page will stay as a draft.")) {
      return;
    }
    setIsCancelingSchedule(true);
    try {
      const { page: p } = await contentPagesApi.cancelSchedule(slug);
      hydrate(p);
    } catch (e) {
      window.alert(`Could not cancel: ${(e as Error).message}`);
    } finally {
      setIsCancelingSchedule(false);
    }
  };

  if (loadError) {
    return (
      <div style={{ padding: 40, color: "var(--text-2)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Could not load page
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{loadError}</div>
        <Link
          href="/content-pages"
          style={{
            display: "inline-block",
            marginTop: 16,
            color: "var(--accent-2)",
            fontSize: 13,
          }}
        >
          ← Back to pages
        </Link>
      </div>
    );
  }

  if (!isLoaded || !page) {
    return (
      <div style={{ padding: 40, color: "var(--text-3)", fontSize: 12 }}>
        Loading editor…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          borderBottom: "1px solid var(--line)",
          background: "rgba(9,14,28,.6)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link href="/content-pages" className="btn icon ghost" title="Back to pages">
          <Icon name="arrow-left" size={14} />
        </Link>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{page.title}</div>
          <div
            className="mono"
            style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".1em" }}
          >
            /{page.slug} · v{page.version}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <span
          className={`status-pill ${
            page.scheduledPublishAt
              ? "draft"
              : page.status === "published" && !isDirty
              ? "published"
              : "draft"
          }`}
          title={
            page.scheduledPublishAt
              ? `Will auto-publish at ${new Date(
                  page.scheduledPublishAt,
                ).toLocaleString()}`
              : undefined
          }
        >
          <span
            className={`dot ${
              page.scheduledPublishAt
                ? "warn"
                : page.status === "published" && !isDirty
                ? "good"
                : "warn"
            }`}
          />
          {page.scheduledPublishAt
            ? `Scheduled · ${formatScheduledLabel(page.scheduledPublishAt)}`
            : isDirty
            ? "Unsaved changes"
            : page.status === "published"
            ? "Published"
            : "Draft"}
        </span>

        <button
          className="btn"
          onClick={() => setHistoryOpen(true)}
          style={{ padding: "8px 12px" }}
          title="View revision history"
        >
          <Icon name="history" size={13} />
          History
        </button>

        <a
          href={`${
            process.env.NEXT_PUBLIC_PREVIEW_URL || "http://localhost:3000"
          }/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ padding: "8px 12px" }}
          title="Open public page"
        >
          <Icon name="globe" size={13} />
          Preview
        </a>

        {page.publishedBlocks && (
          <button
            className="btn"
            onClick={discard}
            disabled={isDiscarding}
            style={{ padding: "8px 12px", opacity: isDiscarding ? 0.6 : 1 }}
          >
            <Icon name="trash" size={13} />
            {isDiscarding ? "Discarding…" : "Discard"}
          </button>
        )}

        <button
          className="btn"
          onClick={save}
          disabled={isSaving || !isDirty}
          style={{
            padding: "8px 12px",
            opacity: !isDirty ? 0.5 : 1,
            ...(isDirty
              ? {
                  borderColor: "rgba(4,186,191,.5)",
                  color: "var(--accent-2)",
                }
              : {}),
          }}
        >
          <Icon name="save" size={13} />
          {isSaving ? "Saving…" : "Save draft"}
        </button>

        {page.scheduledPublishAt ? (
          <button
            className="btn"
            onClick={cancelSchedule}
            disabled={isCancelingSchedule}
            title="Cancel the scheduled publish"
            style={{
              padding: "8px 14px",
              borderColor: "rgba(255,180,80,.45)",
              color: "#ffd8a0",
              opacity: isCancelingSchedule ? 0.6 : 1,
            }}
          >
            <Icon name="x" size={13} />
            {isCancelingSchedule ? "Cancelling…" : "Cancel schedule"}
          </button>
        ) : (
          <div style={{ display: "flex", position: "relative" }}>
            <button
              className="btn primary"
              onClick={publish}
              disabled={isPublishing}
              style={{
                padding: "8px 14px",
                opacity: isPublishing ? 0.6 : 1,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: "1px solid rgba(0,0,0,.2)",
              }}
            >
              <Icon name="rocket" size={13} />
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
            <button
              className="btn primary"
              onClick={() => {
                if (!scheduleOpen) {
                  // Default to 1 hour from now, rounded to the next 5-min mark.
                  const d = new Date(Date.now() + 60 * 60 * 1000);
                  d.setSeconds(0, 0);
                  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
                  setScheduleAtLocal(toDatetimeLocalValue(d));
                }
                setScheduleOpen((o) => !o);
              }}
              disabled={isPublishing}
              title="Schedule publish for later"
              aria-label="Schedule publish for later"
              style={{
                padding: "8px 8px",
                opacity: isPublishing ? 0.6 : 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: "none",
              }}
            >
              <Icon
                name="chevron-down"
                size={13}
                style={{
                  transform: scheduleOpen ? "rotate(180deg)" : "none",
                  transition: "transform .12s",
                }}
              />
            </button>
            {scheduleOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="glass"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 300,
                  padding: 14,
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  zIndex: 50,
                  boxShadow: "0 18px 60px -10px rgba(0,0,0,.6)",
                }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--accent-2)",
                    letterSpacing: ".16em",
                  }}
                >
                  SCHEDULE PUBLISH
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11.5,
                    color: "var(--text-3)",
                    lineHeight: 1.5,
                  }}
                >
                  Page stays as a draft until this moment, then auto-publishes.
                  Times are in your local timezone.
                </p>
                <input
                  type="datetime-local"
                  value={scheduleAtLocal}
                  onChange={(e) => setScheduleAtLocal(e.target.value)}
                  min={toDatetimeLocalValue(new Date(Date.now() + 60_000))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "#0e1530",
                    border: "1px solid var(--line)",
                    color: "#eaf4ff",
                    fontSize: 13,
                    fontFamily: "inherit",
                    colorScheme: "dark",
                  }}
                />
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    className="btn"
                    onClick={() => setScheduleOpen(false)}
                    disabled={isScheduling}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn primary"
                    onClick={schedule}
                    disabled={isScheduling || !scheduleAtLocal}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      opacity: isScheduling || !scheduleAtLocal ? 0.6 : 1,
                    }}
                  >
                    <Icon name="rocket" size={12} />
                    {isScheduling ? "Scheduling…" : "Schedule"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          padding: "24px 24px 80px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ─── LEFT: canvas-style preview of the page ────────────────── */}
        <div style={{ minWidth: 0 }}>
          <div
            onClick={() => setSelectedBlockId(null)}
            style={{
              background: "#0a1322",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "32px clamp(20px, 4vw, 56px) 80px",
              minHeight: "calc(100vh - 160px)",
              position: "relative",
            }}
          >
            {/* Page header on canvas — mirrors how the public page looks. */}
            <div
              style={{
                marginBottom: 24,
                paddingBottom: 18,
                borderBottom: "1px solid #1a2438",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--text-3)",
                  letterSpacing: ".18em",
                  marginBottom: 6,
                }}
              >
                /{page.slug}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#eaf4ff",
                  fontFamily: "var(--font-space-grotesk), inherit",
                  lineHeight: 1.2,
                }}
              >
                {title || page.title}
              </div>
              {(effectiveDate || lastUpdated) && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 18,
                    fontSize: 11.5,
                    color: "var(--text-3)",
                  }}
                >
                  {effectiveDate && <span>Effective: {effectiveDate}</span>}
                  {lastUpdated && <span>Updated: {lastUpdated}</span>}
                </div>
              )}
            </div>

            {blocks.length === 0 ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setRightTab("insert");
                }}
                style={{
                  padding: 48,
                  textAlign: "center",
                  color: "var(--text-3)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: "1px dashed var(--line)",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 10 }}>✎</div>
                This page is empty. Pick a block from the&nbsp;
                <strong style={{ color: "var(--accent-2)" }}>Insert</strong>
                &nbsp;panel on the right to start writing.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {blocks.map((b, idx) => (
                  <CanvasBlock
                    key={b.id}
                    block={b}
                    index={idx}
                    total={blocks.length}
                    selected={selectedBlockId === b.id}
                    onSelect={() => selectBlock(b.id)}
                    onMove={(dir) => moveBlock(idx, dir)}
                    onRemove={() => removeBlock(b.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Builder-style inspector pane ─────────────────── */}
        <aside
          className="builder-pane right"
          style={{
            position: "sticky",
            top: 72,
            alignSelf: "start",
            maxHeight: "calc(100vh - 88px)",
            borderRadius: 14,
            borderLeft: "1px solid var(--line)",
            overflow: "hidden",
          }}
        >
          {(() => {
            const selectedBlock =
              selectedBlockId != null
                ? blocks.find((b) => b.id === selectedBlockId) ?? null
                : null;
            const selectedMeta = selectedBlock
              ? BLOCK_TYPES.find((t) => t.type === selectedBlock.type)!
              : null;

            return (
              <>
                {/* Pane header — mirrors the Landing Page Builder right pane.
                    Shows the selected block's identity when one is selected,
                    otherwise falls back to the page identity. */}
                <div className="pane-header">
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg, var(--accent-2), var(--accent))",
                      color: "#001819",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 0 14px -2px rgba(4,186,191,.6)",
                    }}
                  >
                    <Icon
                      name={selectedMeta ? selectedMeta.icon : "pages"}
                      size={13}
                    />
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {selectedBlock ? selectedMeta!.label : "Page editor"}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 9.5,
                        color: "var(--text-3)",
                        letterSpacing: ".06em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedBlock
                        ? `Selected block · /${page.slug}`
                        : `/${page.slug}`}
                    </span>
                  </div>
                  {selectedBlock && (
                    <button
                      className="btn icon ghost"
                      title="Clear selection"
                      onClick={() => setSelectedBlockId(null)}
                      style={{ marginLeft: "auto" }}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  )}
                </div>

                {/* Tab strip — Block / Insert / Page / SEO. */}
                <div style={{ padding: "10px 14px 0" }}>
                  <div className="tab-strip" style={{ width: "100%" }}>
                    <button
                      className={rightTab === "block" ? "on" : ""}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setRightTab("block")}
                      title={
                        selectedBlock
                          ? "Edit the selected block"
                          : "Click a block on the canvas first"
                      }
                    >
                      <Icon name="type" size={11} /> Block
                    </button>
                    <button
                      className={rightTab === "insert" ? "on" : ""}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setRightTab("insert")}
                    >
                      <Icon name="plus" size={11} /> Insert
                    </button>
                    <button
                      className={rightTab === "page" ? "on" : ""}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setRightTab("page")}
                    >
                      <Icon name="settings" size={11} /> Page
                    </button>
                    <button
                      className={rightTab === "seo" ? "on" : ""}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => setRightTab("seo")}
                    >
                      <Icon name="globe" size={11} /> SEO
                    </button>
                  </div>
                </div>

          <div
            className="pane-body nice-scroll"
            style={{ padding: 0, overflowX: "hidden" }}
          >
            {rightTab === "block" && (
              selectedBlock ? (
                <BlockInspector
                  block={selectedBlock}
                  currentPageSlug={page.slug}
                  onChange={(patch) =>
                    updateBlock(selectedBlock.id, patch)
                  }
                  onReplace={(next) => replaceBlock(selectedBlock.id, next)}
                />
              ) : (
                <div className="field-group">
                  <div className="field-label">
                    <span>NO BLOCK SELECTED</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-3)",
                      lineHeight: 1.55,
                    }}
                  >
                    Click any block on the canvas to edit its content,
                    convert it to another type, or move and delete it. Use
                    the&nbsp;
                    <button
                      onClick={() => setRightTab("insert")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--accent-2)",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      Insert
                    </button>
                    &nbsp;tab to add new blocks.
                  </div>
                </div>
              )
            )}

            {rightTab === "insert" && (
              <>
                <div className="field-group">
                  <div className="field-label">
                    <span>HEADING</span>
                    <span className="hint">H1 – H6</span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 1fr)",
                      gap: 4,
                    }}
                  >
                    {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((lv) => (
                      <button
                        key={lv}
                        className="btn"
                        onClick={() => appendHeading(lv)}
                        title={`Insert H${lv}`}
                        style={{
                          padding: "8px 0",
                          fontSize: 11.5,
                          fontWeight: 600,
                          justifyContent: "center",
                        }}
                      >
                        H{lv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label">
                    <span>LIST</span>
                    <span className="hint">Pick bullets or numbers</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <button
                      className="btn"
                      onClick={() => appendList(false)}
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Icon name="list" size={13} />
                      Bullet
                    </button>
                    <button
                      className="btn"
                      onClick={() => appendList(true)}
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        justifyContent: "flex-start",
                      }}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          width: 13,
                          textAlign: "center",
                        }}
                      >
                        1.
                      </span>
                      Numbered
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label">
                    <span>BLOCKS</span>
                    <span className="hint">Insert &amp; format</span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                    }}
                  >
                    <button
                      className="btn"
                      onClick={() => appendByType("paragraph")}
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Icon name="type" size={13} />
                      Paragraph
                    </button>
                    <button
                      className="btn"
                      onClick={() => appendByType("table")}
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Icon name="grid" size={13} />
                      Table
                    </button>
                    <button
                      className="btn"
                      onClick={() => appendByType("note")}
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Icon name="info" size={13} />
                      Note
                    </button>
                    <button
                      className="btn"
                      onClick={() => appendByType("divider")}
                      style={{
                        padding: "8px 10px",
                        fontSize: 12,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Icon name="grip" size={13} />
                      Divider
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label">
                    <span>INLINE FORMATTING</span>
                    <span className="hint">Inside any text block</span>
                  </div>
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: "rgba(4,186,191,.05)",
                      border: "1px solid rgba(4,186,191,.18)",
                      fontSize: 11,
                      color: "var(--text-2)",
                      lineHeight: 1.55,
                    }}
                  >
                    <code style={inlineCodeStyle}>**bold**</code> · &nbsp;
                    <code style={inlineCodeStyle}>[label](url)</code> for
                    internal (<code style={inlineCodeStyle}>/about</code>) or
                    external links.
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label">
                    <span>EDIT EXISTING</span>
                    <span className="hint">Click a block on the canvas</span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-3)",
                      lineHeight: 1.55,
                    }}
                  >
                    Click any block in the canvas to select it — the&nbsp;
                    <span
                      className="mono"
                      style={{ color: "var(--text-2)" }}
                    >
                      BLOCK
                    </span>
                    &nbsp;tab on the right will switch to its inspector, where
                    you can edit its content, convert types, or change the
                    heading level. Your text is always preserved.
                  </div>
                </div>
              </>
            )}

            {rightTab === "page" && (
              <>
                <div className="field-group">
                  <div className="field-label">
                    <span>TITLE</span>
                  </div>
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Page title"
                    style={inputStyle}
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>URL SLUG</span>
                    <span className="hint">Renames create a 308 redirect</span>
                  </div>
                  <input
                    value={slugInput}
                    onChange={(e) => {
                      setSlugInput(e.target.value);
                      setIsDirty(true);
                    }}
                    onBlur={(e) => {
                      setSlugInput(e.target.value.trim().toLowerCase());
                    }}
                    placeholder="e.g. privacy-policy"
                    style={{
                      ...inputStyle,
                      borderColor: slugIsInvalid
                        ? "rgba(239, 68, 68, .55)"
                        : (inputStyle.border as string | undefined) ?? "var(--line)",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10.5,
                      color: slugIsInvalid
                        ? "rgb(252, 165, 165)"
                        : slugInput.trim() &&
                          slugInput.trim().toLowerCase() !== page.slug
                        ? "var(--accent-2)"
                        : "var(--text-3)",
                      lineHeight: 1.4,
                    }}
                  >
                    {slugIsInvalid ? (
                      <>Lowercase letters, numbers, and hyphens only.</>
                    ) : slugInput.trim() &&
                      slugInput.trim().toLowerCase() !== page.slug ? (
                      <>
                        Renaming <strong>/{page.slug}</strong> →{" "}
                        <strong>/{slugInput.trim().toLowerCase()}</strong>.
                      </>
                    ) : (
                      <>Lowercase letters, numbers, and hyphens only.</>
                    )}
                  </div>
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>TAGS</span>
                    <span className="hint">
                      Press Enter or , to add
                    </span>
                  </div>
                  <TagChipInput
                    value={tags}
                    onChange={(next) => {
                      setTags(next);
                      setIsDirty(true);
                    }}
                    suggestions={tagSuggestions}
                    placeholder="finance, compliance, …"
                  />
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10.5,
                      color: "var(--text-3)",
                      lineHeight: 1.45,
                    }}
                  >
                    Used to surface this page in the link picker&apos;s
                    &ldquo;Related pages&rdquo; suggestions on other pages
                    that share at least one tag. Lowercase + trim is
                    applied on save.
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label">
                    <span>PAGES LINKING HERE</span>
                    <span className="hint">
                      {backlinksLoading
                        ? "Loading…"
                        : backlinks
                        ? `${backlinks.length} page${
                            backlinks.length === 1 ? "" : "s"
                          }`
                        : ""}
                    </span>
                  </div>
                  {backlinksError ? (
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background: "rgba(255,107,128,.08)",
                        border: "1px solid rgba(255,107,128,.25)",
                        color: "#ffb1bd",
                        fontSize: 11.5,
                      }}
                    >
                      Could not load backlinks: {backlinksError}
                    </div>
                  ) : backlinks === null ? (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-3)",
                        lineHeight: 1.5,
                      }}
                    >
                      Loading…
                    </div>
                  ) : backlinks.length === 0 ? (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-3)",
                        lineHeight: 1.5,
                      }}
                    >
                      No other pages link to <strong>/{page.slug}</strong> yet.
                      When they do, renaming or deleting this page will prompt
                      you to keep those links working.
                    </div>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {backlinks.map((b) => (
                        <li key={b.slug}>
                          <Link
                            href={`/content-pages/${encodeURIComponent(b.slug)}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1px solid var(--line)",
                              background: "rgba(255,255,255,.02)",
                              textDecoration: "none",
                              color: "inherit",
                              transition: "background .12s, border-color .12s",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 500,
                                  color: "var(--text-1)",
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {b.title}
                              </span>
                              <span
                                className={`chip ${
                                  b.status === "published" ? "good" : "warn"
                                }`}
                                style={{
                                  padding: "1px 6px",
                                  fontSize: 9,
                                  letterSpacing: ".06em",
                                }}
                              >
                                {b.status === "published" ? "PUB" : "DRAFT"}
                              </span>
                            </div>
                            <span
                              className="mono"
                              style={{
                                fontSize: 10,
                                color: "var(--text-3)",
                                letterSpacing: ".06em",
                              }}
                            >
                              /{b.slug} · {b.links.length} link
                              {b.links.length === 1 ? "" : "s"}
                              {b.links.length > 0 && b.links[0].anchor
                                ? ` · "${b.links[0].anchor}${
                                    b.links.length > 1 ? "…" : ""
                                  }"`
                                : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>FOOTER</span>
                    <span className="hint">Optional</span>
                  </div>
                  <input
                    value={footerLabel}
                    onChange={(e) => {
                      setFooterLabel(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder={`Defaults to "${title || page.title}"`}
                    style={inputStyle}
                  />
                  <label
                    style={{
                      marginTop: 8,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 11px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid var(--line)",
                      fontSize: 13,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showInFooter}
                      onChange={(e) => {
                        setShowInFooter(e.target.checked);
                        setIsDirty(true);
                      }}
                    />
                    <span>
                      {showInFooter
                        ? "Visible in site footer"
                        : "Hidden from footer"}
                    </span>
                  </label>
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>DATES</span>
                    <span className="hint">Optional display strings</span>
                  </div>
                  <input
                    value={effectiveDate}
                    onChange={(e) => {
                      setEffectiveDate(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Effective date (e.g. May 15, 2026)"
                    style={inputStyle}
                  />
                  <input
                    value={lastUpdated}
                    onChange={(e) => {
                      setLastUpdated(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Last updated (e.g. May 15, 2026)"
                    style={{ ...inputStyle, marginTop: 6 }}
                  />
                </div>
              </>
            )}

            {rightTab === "seo" && (
              <>
                <div className="field-group">
                  <div className="field-label">
                    <span>SEO TITLE</span>
                    <span className="hint">{seoTitle.length}/60</span>
                  </div>
                  <input
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder={`e.g. ${title || page.title} · SPay`}
                    style={inputStyle}
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>META DESCRIPTION</span>
                    <span className="hint">{seoDescription.length}/160</span>
                  </div>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      setIsDirty(true);
                    }}
                    rows={3}
                    placeholder="One or two sentences shown under the title in Google search results."
                    style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>OG IMAGE</span>
                    <span className="hint">1200×630 recommended</span>
                  </div>
                  <input
                    value={ogImage}
                    onChange={(e) => {
                      setOgImage(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="https://… or /og-image.png"
                    style={inputStyle}
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>KEYWORDS</span>
                    <span className="hint">Comma-separated</span>
                  </div>
                  <textarea
                    value={seoKeywords}
                    onChange={(e) => {
                      setSeoKeywords(e.target.value);
                      setIsDirty(true);
                    }}
                    rows={2}
                    placeholder="e.g. privacy policy, spay, digital wallet"
                    style={{ ...inputStyle, resize: "vertical", minHeight: 52 }}
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>INDEXING</span>
                  </div>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 11px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid var(--line)",
                      fontSize: 13,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={noindex}
                      onChange={(e) => {
                        setNoindex(e.target.checked);
                        setIsDirty(true);
                      }}
                    />
                    <span>
                      {noindex
                        ? "Hidden from Google (noindex)"
                        : "Indexable by Google"}
                    </span>
                  </label>
                </div>
                <div className="field-group">
                  <div className="field-label">
                    <span>GOOGLE PREVIEW</span>
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: "rgba(255,255,255,.02)",
                      border: "1px dashed var(--line)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9aa0a6",
                        marginBottom: 2,
                      }}
                    >
                      spay.example.com › {page.slug}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: "#8ab4f8",
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {seoTitle.trim() || `${title || page.title} · SPay`}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#bdc1c6",
                        lineHeight: 1.45,
                      }}
                    >
                      {seoDescription.trim() ||
                        "Add a meta description above to control this preview text."}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
              </>
            );
          })()}
        </aside>
      </main>

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        fetchRevisions={fetchHistory}
        onRestore={handleRestoreHistory}
      />

      <SlugRenameConfirmModal
        open={pendingSlugRename !== null}
        fromSlug={pendingSlugRename?.fromSlug ?? ""}
        toSlug={pendingSlugRename?.toSlug ?? ""}
        backlinks={backlinks ?? []}
        intent={pendingSlugRename?.kind ?? "save"}
        busy={isSaving || isPublishing}
        onCancel={() => setPendingSlugRename(null)}
        onConfirm={handleSlugRenameConfirm}
      />
    </div>
  );
}

const inlineCodeStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  fontSize: 10.5,
  padding: "1px 5px",
  borderRadius: 4,
  background: "rgba(4,186,191,.10)",
  color: "var(--accent-2)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 11px",
  borderRadius: 8,
  background: "rgba(255,255,255,.03)",
  border: "1px solid var(--line)",
  color: "var(--text-1)",
  fontSize: 13,
  fontFamily: "inherit",
};

/**
 * Tiny inline markdown renderer mirroring the public site: `**bold**` and
 * `[label](url)`. Used only for the canvas preview, which renders blocks
 * read-only so the editor sees them in their final shape.
 */
function renderInline(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  // Match groups:
  //   1 — full `[label](url){:newtab}` (marker optional)
  //   2 — label
  //   3 — url
  //   4 — `{:newtab}` literal when the editor opted into new-tab open
  //   5 — full `**bold**`
  //   6 — bold inner text
  //   7 — newline
  const TOKEN =
    /(\[([^\]]+)\]\(([^)]+)\)(\{:newtab\})?)|(\*\*([^*]+)\*\*)|(\n)/g;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(text))) {
    if (m.index > i) out.push(text.slice(i, m.index));
    if (m[1]) {
      // Click is no-op in the canvas — we're previewing, not navigating.
      // We still mark new-tab links with a tiny visual cue so editors can
      // tell at a glance which links will open externally.
      const newTab = Boolean(m[4]);
      // Internal `/slug` links resolve against the *public site* (spay-website,
      // e.g. localhost:3000), not the CMS host the editor runs on
      // (localhost:3001). Without this prefix, hovering an internal link
      // shows the wrong URL in the browser status bar and right-click
      // "Open in new tab" goes to a CMS 404 instead of the live page.
      const isInternal = m[3].startsWith("/");
      const resolvedHref = isInternal
        ? `${PUBLIC_SITE_BASE}${m[3]}`
        : m[3];
      out.push(
        <a
          key={`a${key++}`}
          href={resolvedHref}
          onClick={(e) => e.preventDefault()}
          title={
            newTab
              ? `${resolvedHref} (opens in a new tab)`
              : resolvedHref
          }
          style={{ color: "#46F1C5" }}
        >
          {m[2]}
          {newTab ? (
            <sup
              style={{
                fontSize: ".7em",
                marginLeft: 2,
                opacity: 0.7,
              }}
            >
              ↗
            </sup>
          ) : null}
        </a>,
      );
    } else if (m[5]) {
      out.push(
        <strong key={`b${key++}`} style={{ color: "#fff", fontWeight: 600 }}>
          {m[6]}
        </strong>,
      );
    } else if (m[7]) {
      out.push(<br key={`br${key++}`} />);
    }
    i = m.index + m[0].length;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

/**
 * Read-only preview of a block, matching the public site's typography so the
 * canvas shows the editor what the published page will look like. All editing
 * happens in the right-pane inspector when this block is selected.
 */
function BlockPreview({ block }: { block: ContentBlock }) {
  const HEADING_STYLES: Record<HeadingLevel, React.CSSProperties> = {
    1: { fontSize: 36, fontWeight: 700, lineHeight: 1.15, margin: "10px 0 14px", fontFamily: "var(--font-space-grotesk), inherit" },
    2: { fontSize: 26, fontWeight: 700, lineHeight: 1.2, margin: "24px 0 10px", fontFamily: "var(--font-space-grotesk), inherit" },
    3: { fontSize: 20, fontWeight: 600, lineHeight: 1.25, margin: "20px 0 8px" },
    4: { fontSize: 17, fontWeight: 600, lineHeight: 1.3, margin: "16px 0 6px" },
    5: { fontSize: 15, fontWeight: 600, lineHeight: 1.35, margin: "14px 0 4px" },
    6: { fontSize: 13, fontWeight: 600, lineHeight: 1.4, margin: "12px 0 3px", textTransform: "uppercase", letterSpacing: ".08em" },
  };

  switch (block.type) {
    case "heading": {
      const Tag = (`h${block.level}` as unknown) as keyof React.JSX.IntrinsicElements;
      return (
        <Tag style={HEADING_STYLES[block.level]}>
          {block.parts.map((p, i) => (
            <span key={i} style={{ color: p.color ?? "#ffffff" }}>
              {p.text || (
                <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>
                  Heading text
                </span>
              )}
            </span>
          ))}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p style={{ margin: "8px 0", color: "#A6AABE", fontSize: 15, lineHeight: 1.65 }}>
          {block.text ? (
            renderInline(block.text)
          ) : (
            <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>
              Empty paragraph — click to edit.
            </span>
          )}
        </p>
      );
    case "list": {
      const items = block.items.length > 0 ? block.items : [""];
      const itemStyle: React.CSSProperties = {
        color: "#A6AABE",
        fontSize: 15,
        lineHeight: 1.65,
        marginBottom: 6,
      };
      return block.ordered ? (
        <ol style={{ paddingLeft: 24, margin: "8px 0", color: "#A6AABE" }}>
          {items.map((it, i) => (
            <li key={i} style={itemStyle}>
              {it ? (
                renderInline(it)
              ) : (
                <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>
                  Item {i + 1}
                </span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <ul style={{ paddingLeft: 24, margin: "8px 0", listStyle: "disc", color: "#A6AABE" }}>
          {items.map((it, i) => (
            <li key={i} style={itemStyle}>
              {it ? (
                renderInline(it)
              ) : (
                <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>
                  Bullet item
                </span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    case "note":
      return (
        <p
          style={{
            margin: "10px 0",
            color: "#46F1C5",
            fontSize: 13.5,
            fontStyle: "italic",
            lineHeight: 1.6,
            padding: "10px 14px",
            background: "rgba(70,241,197,.05)",
            borderLeft: "3px solid #46F1C5",
            borderRadius: 4,
          }}
        >
          {block.text ? (
            renderInline(block.text)
          ) : (
            <span style={{ opacity: 0.6 }}>
              Empty note — click to edit.
            </span>
          )}
        </p>
      );
    case "divider":
      return (
        <hr
          style={{
            margin: "24px 0",
            border: "none",
            borderTop: "1px solid #1a2438",
          }}
        />
      );
    case "table": {
      const rows = block.rows;
      if (rows.length === 0)
        return (
          <div
            style={{
              padding: 12,
              color: "var(--text-3)",
              fontStyle: "italic",
              fontSize: 13,
            }}
          >
            Empty table — click to edit.
          </div>
        );
      const headerRow = block.hasHeaderRow ? rows[0] : null;
      const bodyRows = block.hasHeaderRow ? rows.slice(1) : rows;
      return (
        <div
          style={{
            margin: "12px 0",
            border: "1px solid #1a2438",
            borderRadius: 10,
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13.5,
            }}
          >
            {headerRow && (
              <thead>
                <tr>
                  {headerRow.map((cell, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: "#fff",
                        background: "rgba(70,241,197,.06)",
                        borderBottom: "1px solid #1a2438",
                      }}
                    >
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, r) => (
                <tr
                  key={r}
                  style={{
                    borderTop:
                      r === 0 && !headerRow ? "none" : "1px solid #1a2438",
                  }}
                >
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      style={{
                        padding: "10px 14px",
                        color: "#A6AABE",
                        verticalAlign: "top",
                      }}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

/**
 * Clickable canvas wrapper around a `BlockPreview`. Mirrors the landing-page
 * builder's section-click pattern: hover shows a dashed accent outline, the
 * selected block gets a solid outline plus a floating toolbar (type chip,
 * move, delete). All actual editing lives in the right-pane `BlockInspector`.
 */
function CanvasBlock({
  block,
  index,
  total,
  selected,
  onSelect,
  onMove,
  onRemove,
}: {
  block: ContentBlock;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const meta = BLOCK_TYPES.find((t) => t.type === block.type)!;
  const [hovered, setHovered] = React.useState(false);

  const typeSuffix =
    block.type === "heading"
      ? `·H${block.level}`
      : block.type === "list"
      ? block.ordered
        ? "·1."
        : "·•"
      : "";

  return (
    <div
      id={`block-${block.id}`}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "6px 10px",
        margin: "0 -10px",
        borderRadius: 8,
        cursor: "pointer",
        outline: selected
          ? "2px solid var(--accent)"
          : hovered
          ? "2px dashed rgba(4,186,191,.4)"
          : "2px solid transparent",
        outlineOffset: -2,
        background: selected ? "rgba(4,186,191,.04)" : "transparent",
        transition: "outline-color .12s, background .12s",
      }}
    >
      {/* Floating toolbar — only visible when this block is selected. */}
      {selected && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: -14,
            left: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 6px",
            borderRadius: 7,
            background: "var(--accent)",
            color: "#001819",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            boxShadow: "0 6px 18px -4px rgba(4,186,191,.55)",
            zIndex: 5,
            fontFamily: "Geist Mono, ui-monospace, monospace",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              paddingRight: 6,
              borderRight: "1px solid rgba(0,0,0,.18)",
            }}
          >
            <Icon name={meta.icon} size={10} />
            {meta.label}
            {typeSuffix}
          </span>
          <button
            title="Move up"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            style={toolbarBtnStyle(index === 0)}
          >
            <Icon
              name="chevron-down"
              size={10}
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
          <button
            title="Move down"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            style={toolbarBtnStyle(index === total - 1)}
          >
            <Icon name="chevron-down" size={10} />
          </button>
          <button
            title="Delete block"
            onClick={onRemove}
            style={toolbarBtnStyle(false)}
          >
            <Icon name="trash" size={10} />
          </button>
        </div>
      )}

      <BlockPreview block={block} />
    </div>
  );
}

const toolbarBtnStyle = (disabled: boolean): React.CSSProperties => ({
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: 20,
  borderRadius: 5,
  cursor: disabled ? "not-allowed" : "pointer",
  color: "#001819",
  opacity: disabled ? 0.35 : 1,
});

/**
 * Right-pane editor for the currently selected block. Hosts the type chip
 * with the Convert popover at the top, then dispatches to the existing
 * per-type editor components (heading parts, list items, table cells, etc.).
 */
function BlockInspector({
  block,
  currentPageSlug,
  onChange,
  onReplace,
}: {
  block: ContentBlock;
  /** Threaded down to the inner editors so their LinkPickerModal can
   *  ask the backend for related pages by tag overlap. */
  currentPageSlug: string;
  onChange: (patch: Partial<ContentBlock>) => void;
  onReplace: (next: ContentBlock) => void;
}) {
  const meta = BLOCK_TYPES.find((t) => t.type === block.type)!;
  const [convertOpen, setConvertOpen] = React.useState(false);

  const convertTo = (
    type: ContentBlock["type"],
    options?: { level?: HeadingLevel; ordered?: boolean },
  ) => {
    onReplace(convertBlock(block, type, options));
    setConvertOpen(false);
  };

  const typeSuffix =
    block.type === "heading"
      ? ` · H${block.level}`
      : block.type === "list"
      ? block.ordered
        ? " · NUMBERED"
        : " · BULLET"
      : "";

  return (
    <>
      <div className="field-group">
        <div className="field-label">
          <span>TYPE</span>
          <span className="hint">Click to convert</span>
        </div>
        <button
          onClick={() => setConvertOpen((o) => !o)}
          title="Convert this block to another type"
          aria-expanded={convertOpen}
          style={{
            all: "unset",
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "6px 10px 6px 6px",
            borderRadius: 8,
            cursor: "pointer",
            border: "1px solid",
            background: convertOpen
              ? "rgba(4,186,191,.10)"
              : "rgba(255,255,255,.02)",
            borderColor: convertOpen
              ? "rgba(4,186,191,.45)"
              : "var(--line)",
            transition: "background .12s, border-color .12s",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "rgba(4,186,191,.12)",
              color: "var(--accent-2)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon name={meta.icon} size={12} />
          </span>
          <span
            className="mono"
            style={{
              flex: 1,
              fontSize: 11,
              color: "var(--text-1)",
              letterSpacing: ".14em",
            }}
          >
            {meta.label.toUpperCase()}
            {typeSuffix}
          </span>
          <Icon
            name="chevron-down"
            size={11}
            style={{
              color: "var(--text-3)",
              transform: convertOpen ? "rotate(180deg)" : "none",
              transition: "transform .12s",
              flexShrink: 0,
            }}
          />
        </button>
        {convertOpen && (
          <div
            style={{
              marginTop: 10,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "rgba(4,186,191,.04)",
              border: "1px solid rgba(4,186,191,.25)",
              borderRadius: 10,
            }}
          >
            <ConvertOptions
              currentType={block.type}
              onPick={convertTo}
            />
          </div>
        )}
      </div>

      <div className="field-group">
        <div className="field-label">
          <span>CONTENT</span>
          {(block.type === "paragraph" ||
            block.type === "note" ||
            block.type === "list" ||
            block.type === "table") && (
            <span className="hint">**bold** · [label](url)</span>
          )}
        </div>
        {block.type === "heading" && (
          <HeadingEditor block={block} onChange={onChange} />
        )}
        {block.type === "paragraph" && (
          <TextEditor
            value={block.text}
            onChange={(text) => onChange({ text } as Partial<ContentBlock>)}
            placeholder="Type, or use **bold** and [link](url) for inline formatting."
            rows={4}
            tone="body"
            currentPageSlug={currentPageSlug}
          />
        )}
        {block.type === "list" && (
          <ListEditor
            block={block}
            onChange={onChange}
            currentPageSlug={currentPageSlug}
          />
        )}
        {block.type === "note" && (
          <TextEditor
            value={block.text}
            onChange={(text) => onChange({ text } as Partial<ContentBlock>)}
            placeholder="Short note — rendered in the accent color on the public page."
            rows={3}
            tone="note"
            currentPageSlug={currentPageSlug}
          />
        )}
        {block.type === "divider" && (
          <div
            style={{
              padding: "10px 12px",
              fontSize: 12,
              color: "var(--text-3)",
              lineHeight: 1.55,
              border: "1px dashed var(--line)",
              borderRadius: 8,
            }}
          >
            Dividers have no content of their own — they render as a thin
            horizontal rule on the public page. Use the&nbsp;
            <strong style={{ color: "var(--text-2)" }}>TYPE</strong>
            &nbsp;chip above to convert this block back into text or a list.
          </div>
        )}
        {block.type === "table" && (
          <TableEditor block={block} onChange={onChange} />
        )}
      </div>
    </>
  );
}

/**
 * Small dropdown that appears under a block's type chip. Lets editors
 * convert the existing block to any other supported type without losing
 * its text content — heading levels and bullet/numbered are first-class
 * choices instead of requiring a follow-up tweak.
 */
function ConvertOptions({
  currentType,
  onPick,
}: {
  currentType: ContentBlock["type"];
  onPick: (
    type: ContentBlock["type"],
    options?: { level?: HeadingLevel; ordered?: boolean },
  ) => void;
}) {
  return (
    <>
      <ConvertGroup label="Heading">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
          {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((lv) => (
            <button
              key={lv}
              onClick={() => onPick("heading", { level: lv })}
              className="btn"
              style={{
                padding: "5px 0",
                fontSize: 11,
                fontWeight: 600,
                justifyContent: "center",
              }}
            >
              H{lv}
            </button>
          ))}
        </div>
      </ConvertGroup>
      <ConvertGroup label="Text">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <ConvertButton
            active={currentType === "paragraph"}
            onClick={() => onPick("paragraph")}
            icon="type"
            label="Paragraph"
          />
          <ConvertButton
            active={currentType === "note"}
            onClick={() => onPick("note")}
            icon="info"
            label="Note"
          />
        </div>
      </ConvertGroup>
      <ConvertGroup label="List">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <ConvertButton
            onClick={() => onPick("list", { ordered: false })}
            icon="list"
            label="Bullet"
          />
          <ConvertButton
            onClick={() => onPick("list", { ordered: true })}
            icon="list"
            label="Numbered"
            mono="1."
          />
        </div>
      </ConvertGroup>
      <ConvertGroup label="Other">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <ConvertButton
            active={currentType === "table"}
            onClick={() => onPick("table")}
            icon="grid"
            label="Table"
          />
          <ConvertButton
            active={currentType === "divider"}
            onClick={() => onPick("divider")}
            icon="grip"
            label="Divider"
          />
        </div>
      </ConvertGroup>
    </>
  );
}

function ConvertGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 9,
          color: "var(--text-3)",
          letterSpacing: ".14em",
          marginBottom: 5,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function ConvertButton({
  active,
  onClick,
  icon,
  label,
  mono,
}: {
  active?: boolean;
  onClick: () => void;
  icon: IconName;
  label: string;
  mono?: string;
}) {
  return (
    <button
      className="btn"
      onClick={onClick}
      title={active ? "Already this type" : `Convert to ${label}`}
      style={{
        padding: "6px 10px",
        fontSize: 11.5,
        justifyContent: "flex-start",
        background: active ? "rgba(4,186,191,.10)" : undefined,
        borderColor: active ? "rgba(4,186,191,.35)" : undefined,
        color: active ? "var(--accent-2)" : undefined,
      }}
    >
      {mono ? (
        <span
          className="mono"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            width: 13,
            textAlign: "center",
          }}
        >
          {mono}
        </span>
      ) : (
        <Icon name={icon} size={11} />
      )}
      {label}
    </button>
  );
}

function HeadingEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "heading" }>;
  onChange: (patch: Partial<ContentBlock>) => void;
}) {
  // No more inline H1–H6 row — the block's type chip ("HEADING · H2 ▾")
  // opens a Convert popover that handles level changes plus type switching.
  // Inputs are sized to match the rendered heading so the editor sees the
  // visual weight directly.
  const inputFontSize = HEADING_INPUT_FONT_SIZE[block.level];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {block.parts.map((part, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <input
            value={part.text}
            onChange={(e) => {
              const parts = [...block.parts];
              parts[i] = { ...parts[i], text: e.target.value };
              onChange({ parts } as Partial<ContentBlock>);
            }}
            placeholder="Heading text"
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 6,
              background: "transparent",
              border: "1px solid transparent",
              color: part.color ?? "#ffffff",
              fontSize: inputFontSize,
              fontWeight: 700,
              letterSpacing: "-.01em",
              lineHeight: 1.25,
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color .12s, background .12s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(4,186,191,.35)";
              e.currentTarget.style.background = "rgba(4,186,191,.04)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "transparent";
            }}
          />
          {/* Round color swatch — looks like a dot rather than a form field. */}
          <label
            title="Segment color"
            style={{
              position: "relative",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: part.color ?? "#ffffff",
              border: "2px solid rgba(255,255,255,.08)",
              boxShadow: "0 0 0 1px var(--line)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <input
              type="color"
              value={part.color ?? "#ffffff"}
              onChange={(e) => {
                const parts = [...block.parts];
                parts[i] = { ...parts[i], color: e.target.value };
                onChange({ parts } as Partial<ContentBlock>);
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                border: "none",
                padding: 0,
                background: "transparent",
              }}
            />
          </label>
          {block.parts.length > 1 && (
            <button
              className="btn icon ghost"
              onClick={() => {
                const parts = block.parts.filter((_, j) => j !== i);
                onChange({ parts } as Partial<ContentBlock>);
              }}
              title="Remove segment"
              style={{ width: 22, height: 22, flexShrink: 0 }}
            >
              <Icon name="x" size={10} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() =>
          onChange({
            parts: [...block.parts, { text: "", color: "#46F1C5" }],
          } as Partial<ContentBlock>)
        }
        style={{
          alignSelf: "flex-start",
          marginTop: 6,
          padding: "3px 8px",
          fontSize: 10.5,
          color: "var(--text-3)",
          background: "transparent",
          border: "1px dashed var(--line)",
          borderRadius: 6,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "inherit",
        }}
      >
        <Icon name="plus" size={10} />
        Color segment
      </button>
    </div>
  );
}

function ListEditor({
  block,
  onChange,
  currentPageSlug,
}: {
  block: Extract<ContentBlock, { type: "list" }>;
  onChange: (patch: Partial<ContentBlock>) => void;
  /** Forwarded to LinkPickerModal for related-pages suggestions. */
  currentPageSlug?: string;
}) {
  // Ordered/unordered toggle lives in the Convert popover — the type chip
  // reads "LIST · BULLET" or "LIST · NUMBERED" so the current mode is
  // obvious without dedicating a checkbox row inside the block.

  // Per-item refs so we can read the active item's selection range when its
  // Link button is pressed and restore the cursor after insertion.
  const itemRefs = React.useRef<Array<HTMLTextAreaElement | null>>([]);
  itemRefs.current.length = block.items.length;

  // Single shared modal — only one item can have its picker open at a time.
  const [pickerIndex, setPickerIndex] = React.useState<number | null>(null);
  const [pickerInitial, setPickerInitial] = React.useState({
    text: "",
    url: "",
    newTab: false,
  });

  const openPicker = (i: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const t = itemRefs.current[i];
    const value = block.items[i] ?? "";
    const start = t?.selectionStart ?? value.length;
    const end = t?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    setPickerInitial({ text: selected, url: "", newTab: false });
    setPickerIndex(i);
  };

  const handleInsert = (text: string, url: string, newTab: boolean) => {
    if (pickerIndex == null) return;
    const i = pickerIndex;
    const value = block.items[i] ?? "";
    const md = buildLinkMarkdown(text, url, newTab);
    const { nextValue, cursor } = insertAtSelection(
      itemRefs.current[i],
      value,
      md,
    );
    const items = [...block.items];
    items[i] = nextValue;
    onChange({ items } as Partial<ContentBlock>);
    setPickerIndex(null);
    requestAnimationFrame(() => {
      const t = itemRefs.current[i];
      if (!t) return;
      t.focus();
      t.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {block.items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "4px 0",
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: block.ordered ? 13 : 18,
              color: "var(--accent-2)",
              width: 22,
              textAlign: "right",
              paddingTop: block.ordered ? 6 : 0,
              lineHeight: 1.4,
              flexShrink: 0,
              fontWeight: block.ordered ? 600 : 400,
            }}
          >
            {block.ordered ? `${i + 1}.` : "•"}
          </span>
          <textarea
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            value={item}
            onChange={(e) => {
              const items = [...block.items];
              items[i] = e.target.value;
              onChange({ items } as Partial<ContentBlock>);
            }}
            rows={1}
            placeholder="List item — type, or use **bold** and [link](url) inline."
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 6,
              background: "transparent",
              border: "1px solid transparent",
              color: "var(--text-1)",
              fontSize: 14,
              lineHeight: 1.55,
              fontFamily: "inherit",
              resize: "vertical",
              minHeight: 32,
              outline: "none",
              transition: "border-color .12s, background .12s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(4,186,191,.35)";
              e.currentTarget.style.background = "rgba(4,186,191,.04)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "transparent";
            }}
          />
          <button
            className="btn icon ghost"
            onMouseDown={openPicker(i)}
            title="Insert link into this item"
            style={{ width: 22, height: 22, marginTop: 6, flexShrink: 0 }}
          >
            <Icon name="globe" size={10} />
          </button>
          {block.items.length > 1 && (
            <button
              className="btn icon ghost"
              onClick={() => {
                const items = block.items.filter((_, j) => j !== i);
                onChange({ items } as Partial<ContentBlock>);
              }}
              title="Remove item"
              style={{ width: 22, height: 22, marginTop: 6, flexShrink: 0 }}
            >
              <Icon name="x" size={10} />
            </button>
          )}
        </div>
      ))}
      <LinkPickerModal
        open={pickerIndex !== null}
        initialText={pickerInitial.text}
        initialUrl={pickerInitial.url}
        initialNewTab={pickerInitial.newTab}
        currentPageSlug={currentPageSlug}
        onClose={() => setPickerIndex(null)}
        onInsert={handleInsert}
      />
      <button
        onClick={() =>
          onChange({ items: [...block.items, ""] } as Partial<ContentBlock>)
        }
        style={{
          alignSelf: "flex-start",
          marginTop: 4,
          marginLeft: 32,
          padding: "3px 8px",
          fontSize: 10.5,
          color: "var(--text-3)",
          background: "transparent",
          border: "1px dashed var(--line)",
          borderRadius: 6,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "inherit",
        }}
      >
        <Icon name="plus" size={10} />
        Item
      </button>
    </div>
  );
}

function TableEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  onChange: (patch: Partial<ContentBlock>) => void;
}) {
  const rows = block.rows;
  const rowCount = rows.length;
  const colCount = Math.max(1, ...rows.map((r) => r.length));

  const updateCell = (r: number, c: number, value: string) => {
    const next = rows.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
    );
    onChange({ rows: next } as Partial<ContentBlock>);
  };

  const addRow = () => {
    onChange({
      rows: [...rows, Array.from({ length: colCount }, () => "")],
    } as Partial<ContentBlock>);
  };

  const removeRow = (r: number) => {
    if (rowCount <= 1) return;
    onChange({ rows: rows.filter((_, i) => i !== r) } as Partial<ContentBlock>);
  };

  const addColumn = () => {
    if (colCount >= 8) return;
    onChange({
      rows: rows.map((row) => [...row, ""]),
    } as Partial<ContentBlock>);
  };

  const removeColumn = (c: number) => {
    if (colCount <= 1) return;
    onChange({
      rows: rows.map((row) => row.filter((_, i) => i !== c)),
    } as Partial<ContentBlock>);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={block.hasHeaderRow}
            onChange={(e) =>
              onChange({ hasHeaderRow: e.target.checked } as Partial<ContentBlock>)
            }
          />
          <span>First row is a header</span>
        </label>
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".14em" }}
        >
          {rowCount} × {colCount}
        </span>
      </div>

      {/* Scroll wrapper so wide tables don't blow out the editor card. */}
      <div
        style={{
          overflowX: "auto",
          border: "1px solid var(--line)",
          borderRadius: 8,
          background: "rgba(255,255,255,.02)",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: colCount * 140,
            fontSize: 12.5,
          }}
        >
          {/* Column-remove buttons sit in their own header strip so they
              hover above the actual data without crowding cell content. */}
          <thead>
            <tr style={{ background: "rgba(4,186,191,.04)" }}>
              {Array.from({ length: colCount }).map((_, c) => (
                <th
                  key={c}
                  style={{
                    padding: 4,
                    borderBottom: "1px solid var(--line)",
                    borderRight:
                      c < colCount - 1 ? "1px solid var(--line)" : "none",
                    fontWeight: 400,
                  }}
                >
                  <button
                    className="btn icon ghost"
                    title={`Remove column ${c + 1}`}
                    onClick={() => removeColumn(c)}
                    disabled={colCount <= 1}
                    style={{
                      width: 22,
                      height: 22,
                      margin: "0 auto",
                      opacity: colCount <= 1 ? 0.3 : 1,
                    }}
                  >
                    <Icon name="x" size={11} />
                  </button>
                </th>
              ))}
              <th style={{ width: 28, borderBottom: "1px solid var(--line)" }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {Array.from({ length: colCount }).map((_, c) => (
                  <td
                    key={c}
                    style={{
                      padding: 0,
                      borderTop: "1px solid var(--line)",
                      borderRight:
                        c < colCount - 1 ? "1px solid var(--line)" : "none",
                      background:
                        block.hasHeaderRow && r === 0
                          ? "rgba(4,186,191,.05)"
                          : "transparent",
                      verticalAlign: "top",
                    }}
                  >
                    <textarea
                      value={row[c] ?? ""}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      rows={1}
                      placeholder={
                        block.hasHeaderRow && r === 0 ? "Header" : "Cell"
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "none",
                        background: "transparent",
                        color: "var(--text-1)",
                        fontSize: 12.5,
                        fontFamily: "inherit",
                        resize: "vertical",
                        minHeight: 32,
                        outline: "none",
                        fontWeight:
                          block.hasHeaderRow && r === 0 ? 600 : 400,
                      }}
                    />
                  </td>
                ))}
                <td
                  style={{
                    width: 28,
                    borderTop: "1px solid var(--line)",
                    textAlign: "center",
                  }}
                >
                  <button
                    className="btn icon ghost"
                    title={`Remove row ${r + 1}`}
                    onClick={() => removeRow(r)}
                    disabled={rowCount <= 1}
                    style={{
                      width: 22,
                      height: 22,
                      opacity: rowCount <= 1 ? 0.3 : 1,
                    }}
                  >
                    <Icon name="x" size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button
          className="btn"
          style={{ padding: "6px 10px", fontSize: 11.5 }}
          onClick={addRow}
        >
          <Icon name="plus" size={11} />
          Add row
        </button>
        <button
          className="btn"
          style={{ padding: "6px 10px", fontSize: 11.5 }}
          onClick={addColumn}
          disabled={colCount >= 8}
        >
          <Icon name="plus" size={11} />
          Add column
        </button>
        <div style={{ flex: 1 }} />
        <span
          className="mono"
          style={{
            fontSize: 9.5,
            color: "var(--text-3)",
            letterSpacing: ".12em",
            alignSelf: "center",
          }}
        >
          MAX 8 COLUMNS · CELLS SUPPORT **BOLD** AND [LINK](URL)
        </span>
      </div>
    </div>
  );
}

function TextEditor({
  value,
  onChange,
  placeholder,
  rows,
  tone = "body",
  currentPageSlug,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  rows?: number;
  tone?: "body" | "note";
  /** Forwarded to LinkPickerModal for related-pages suggestions. */
  currentPageSlug?: string;
}) {
  const noteAccent = "#46F1C5";
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerInitial, setPickerInitial] = React.useState({
    text: "",
    url: "",
    newTab: false,
  });

  // Capture the current selection BEFORE focus moves to the Link button.
  // `onMouseDown` fires before blur, so reading selectionStart/End here
  // gives us the editor's actual selection. preventDefault keeps focus on
  // the textarea so re-focusing after the modal closes is seamless.
  const openPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    const t = textareaRef.current;
    const start = t?.selectionStart ?? value.length;
    const end = t?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    setPickerInitial({ text: selected, url: "", newTab: false });
    setPickerOpen(true);
  };

  const handleInsert = (text: string, url: string, newTab: boolean) => {
    const md = buildLinkMarkdown(text, url, newTab);
    const { nextValue, cursor } = insertAtSelection(
      textareaRef.current,
      value,
      md,
    );
    onChange(nextValue);
    setPickerOpen(false);
    requestAnimationFrame(() => {
      const t = textareaRef.current;
      if (!t) return;
      t.focus();
      t.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows ?? 3}
        style={{
          width: "100%",
          padding: tone === "note" ? "10px 12px" : "8px 10px",
          borderRadius: 6,
          background:
            tone === "note" ? "rgba(70,241,197,.05)" : "transparent",
          border:
            tone === "note"
              ? "1px solid rgba(70,241,197,.22)"
              : "1px solid transparent",
          borderLeft:
            tone === "note"
              ? `3px solid ${noteAccent}`
              : "1px solid transparent",
          color: tone === "note" ? noteAccent : "var(--text-1)",
          fontSize: tone === "note" ? 13 : 15,
          fontStyle: tone === "note" ? "italic" : "normal",
          lineHeight: 1.6,
          fontFamily: "inherit",
          resize: "vertical",
          minHeight: tone === "note" ? 44 : 56,
          outline: "none",
          transition: "border-color .12s, background .12s",
        }}
        onFocus={(e) => {
          if (tone === "body") {
            e.currentTarget.style.borderColor = "rgba(4,186,191,.35)";
            e.currentTarget.style.background = "rgba(4,186,191,.04)";
          } else {
            e.currentTarget.style.borderColor = "rgba(70,241,197,.45)";
            e.currentTarget.style.background = "rgba(70,241,197,.08)";
          }
        }}
        onBlur={(e) => {
          if (tone === "body") {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.background = "transparent";
          } else {
            e.currentTarget.style.borderColor = "rgba(70,241,197,.22)";
            e.currentTarget.style.background = "rgba(70,241,197,.05)";
          }
          // Keep the left accent bar visible at all times for the note tone.
          if (tone === "note") {
            e.currentTarget.style.borderLeft = `3px solid ${noteAccent}`;
          }
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onMouseDown={openPicker}
          title="Insert internal or external link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 9px",
            background: "transparent",
            border: "1px solid var(--line)",
            borderRadius: 6,
            color: "var(--text-3)",
            fontSize: 10.5,
            letterSpacing: ".06em",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "color .12s, border-color .12s, background .12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent-2)";
            e.currentTarget.style.borderColor = "rgba(4,186,191,.45)";
            e.currentTarget.style.background = "rgba(4,186,191,.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-3)";
            e.currentTarget.style.borderColor = "var(--line)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Icon name="globe" size={10} />
          Link
        </button>
      </div>
      <LinkPickerModal
        open={pickerOpen}
        initialText={pickerInitial.text}
        initialUrl={pickerInitial.url}
        initialNewTab={pickerInitial.newTab}
        currentPageSlug={currentPageSlug}
        onClose={() => setPickerOpen(false)}
        onInsert={handleInsert}
      />
    </div>
  );
}

