'use client';

import React from 'react';
import { Monitor, RotateCw, ExternalLink, X } from 'lucide-react';
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
  onClose,
}: {
  url: string;
  sections?: Record<string, any>;
  onClose: () => void;
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [reloadKey, setReloadKey] = React.useState(0);

  // Always post the freshest sections, without re-binding listeners per keystroke.
  const sectionsRef = React.useRef(sections);
  sectionsRef.current = sections;

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

  // When the preview page mounts it announces itself; push the current draft.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object' && e.data.type === 'spay:preview-ready') {
        postSections();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postSections]);

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
        <Button variant="ghost" size="iconSm" onClick={() => setReloadKey((k) => k + 1)} aria-label="Refresh preview">
          <RotateCw />
        </Button>
        <Button variant="ghost" size="iconSm" asChild aria-label="Open in new tab">
          <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
        </Button>
        <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close preview">
          <X />
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
