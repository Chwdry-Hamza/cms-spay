'use client';

import React from 'react';
import { Monitor, RotateCw, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * In-CMS live preview of the website homepage.
 *
 * Renders the site inside an iframe at a fixed *desktop* viewport width and
 * scales it down to fit the available column (desktop only by design).
 *
 * Real-time editing: the iframe loads the site with `?preview=1`, and this
 * panel streams the current (unsaved) `sections` draft into it via
 * postMessage. The website applies it client-side, so edits show instantly —
 * no save/publish needed.
 */

// The desktop viewport we emulate. The iframe is rendered at this width and
// transform-scaled to fit, so the site renders its desktop breakpoint.
const DESKTOP_WIDTH = 1280;

export function LivePreviewPanel({
  url,
  sections,
  editable = false,
  onInlineEdit,
  onPickImage,
}: {
  url: string;
  sections?: Record<string, any>;
  /** Homepage: show the Edit/Preview toggle and accept edits from the iframe. */
  editable?: boolean;
  /** A text/link-URL edit committed in the preview: write it into `sections`. */
  onInlineEdit?: (path: string, value: string) => void;
  /** The preview asked to change an image at `path`: open the media picker. */
  onPickImage?: (path: string) => void;
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [reloadKey, setReloadKey] = React.useState(0);
  const [editing, setEditing] = React.useState(false);

  // Always post the freshest sections, without re-binding listeners per keystroke.
  const sectionsRef = React.useRef(sections);
  sectionsRef.current = sections;
  // Keep edit callbacks fresh inside the long-lived message listener.
  const editRef = React.useRef(onInlineEdit);
  editRef.current = onInlineEdit;
  const pickRef = React.useRef(onPickImage);
  pickRef.current = onPickImage;
  const editingRef = React.useRef(editing);
  editingRef.current = editing;

  const previewUrl = url + (url.includes('?') ? '&' : '?') + 'preview=1';
  const targetOrigin = React.useMemo(() => {
    try {
      return new URL(url).origin;
    } catch {
      return '*';
    }
  }, [url]);

  const postSections = React.useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'spay:preview-content', sections: sectionsRef.current ?? {} },
      targetOrigin,
    );
  }, [targetOrigin]);

  const postMode = React.useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'spay:preview-edit-mode', editing: editingRef.current },
      targetOrigin,
    );
  }, [targetOrigin]);

  // Listen for the iframe announcing readiness and for edits coming back from it.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'spay:preview-ready') {
        postSections();
        postMode();
      } else if (d.type === 'spay:preview-edit' && typeof d.path === 'string') {
        editRef.current?.(d.path, d.value);
      } else if (d.type === 'spay:preview-pick-image' && typeof d.path === 'string') {
        pickRef.current?.(d.path);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postSections, postMode]);

  // Push edit-mode changes to the iframe as the user toggles.
  React.useEffect(() => {
    postMode();
  }, [editing, postMode]);

  // Push edits to the iframe as they happen (debounced so typing stays smooth).
  React.useEffect(() => {
    const t = setTimeout(postSections, 150);
    return () => clearTimeout(t);
  }, [sections, postSections]);

  // Measure the available area so we can scale the desktop viewport to fit.
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const scale = size.w ? Math.min(1, size.w / DESKTOP_WIDTH) : 1;
  // Iframe height is the visible area divided by the scale, so after scaling it
  // exactly fills the viewport (the user scrolls within the iframe for more).
  const frameHeight = size.h ? Math.round(size.h / scale) : 800;
  // Centre the frame when the column is wider than the emulated desktop.
  const offsetLeft = scale >= 1 ? Math.max(0, (size.w - DESKTOP_WIDTH) / 2) : 0;

  return (
    <div className="rounded-spay-md border border-line bg-surface-deeper/40 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 h-11 border-b border-line bg-surface-deeper/60">
        <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-spay-sm border border-cyan-300/40 bg-cyan-300/10 text-cyan-300 text-xs font-medium [&_svg]:size-3.5">
          <Monitor /> Live
        </span>
        <span className="flex-1 min-w-0 truncate font-mono text-xs text-fg-3">{url}</span>
        {editable && (
          <Button
            variant={editing ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setEditing((v) => !v)}
            className="gap-1.5"
          >
            {editing ? <Pencil /> : <Eye />}
            {editing ? 'Editing' : 'Edit'}
          </Button>
        )}
        <Button variant="ghost" size="iconSm" onClick={() => setReloadKey((k) => k + 1)} aria-label="Refresh preview">
          <RotateCw />
        </Button>
      </div>

      {/* Scaled desktop viewport */}
      <div ref={viewportRef} className="relative h-[72vh] overflow-hidden bg-[#0b0f1a]">
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={previewUrl}
          onLoad={postSections}
          title="Live preview — desktop"
          className="absolute top-0 border-0 bg-white"
          style={{
            left: offsetLeft,
            width: DESKTOP_WIDTH,
            height: frameHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
}
