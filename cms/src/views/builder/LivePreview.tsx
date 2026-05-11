"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import type { SectionMeta } from "./sectionsData";

export type Viewport = "desktop" | "tablet" | "mobile";

// Logical render widths — the iframe always renders at this width so the
// frontend's responsive breakpoints think they're seeing a real device.
// We then scale the rendered output to fit the available canvas.
const VIEWPORT_WIDTH: Record<Viewport, number> = {
  desktop: 1280,
  tablet: 820,
  mobile: 540,
};

// Maximum scale per viewport. Each viewport renders a different device-sized
// "screen" floating centered in the canvas. The caps keep content from being
// blown up — desktop especially benefits from a lower cap so on first load it
// fits inside the canvas instead of overflowing.
const MAX_SCALE: Record<Viewport, number> = {
  desktop: 0.5,
  tablet: 0.9,
  mobile: 0.55,
};

type IncomingMsg =
  | { type: "PREVIEW_READY" }
  | { type: "PREVIEW_HEIGHT"; payload: { height: number } }
  | { type: "PREVIEW_SECTION_CLICKED"; payload: { id: string } };

export interface LivePreviewHandle {
  send: (msg: unknown) => void;
  scrollToSection: (id: string) => void;
}

export const LivePreview = React.forwardRef<
  LivePreviewHandle,
  {
    sections: SectionMeta[];
    viewport: Viewport;
    setViewport: (v: Viewport) => void;
    selectedId: string;
    status: "draft" | "published";
    isDirty: boolean;
    onSectionClicked?: (id: string) => void;
    onReady?: () => void;
  }
>(function LivePreview(
  { sections, viewport, setViewport, selectedId, status, isDirty, onSectionClicked, onReady },
  ref
) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [stageSize, setStageSize] = React.useState({ w: 0, h: 0 });
  // True once ResizeObserver has reported the real canvas size. The iframe
  // stays invisible until then so the very first paint the user sees is at
  // the correct fitScale — no flash of wrong-scale content that only "fixes
  // itself" once you click the mobile icon.
  const [measured, setMeasured] = React.useState(false);
  // Live page height reported by the iframe via PREVIEW_HEIGHT.
  // Used so the iframe element matches the real content height — the outer
  // canvas scrolls instead of nesting two scrollbars.
  const [contentHeight, setContentHeight] = React.useState(0);

  // Measure the available canvas so we can scale the fixed-width iframe to fit.
  // We combine ResizeObserver (for ongoing resizes) with a brief rAF loop on
  // mount to catch any post-layout settling — e.g. the sidebar transitioning
  // from its default width to its actual width on first render. Without the
  // rAF settling pass, the first measurement could be a stale mid-transition
  // value and the iframe would paint at the wrong scale.
  React.useLayoutEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    let cancelled = false;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setStageSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
        setMeasured(true);
      }
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Settling pass: measure across a few animation frames to absorb any
    // initial CSS reflow before we lock in the value.
    const settle = (count: number) => {
      if (cancelled) return;
      measure();
      if (count > 0) requestAnimationFrame(() => settle(count - 1));
    };
    settle(6);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  const previewOrigin =
    process.env.NEXT_PUBLIC_PREVIEW_URL || "http://localhost:3000";
  const previewUrl = `${previewOrigin}?preview=true`;

  // Buffer messages dispatched before the iframe announces PREVIEW_READY.
  // They get drained as soon as the bridge connects.
  const queueRef = React.useRef<unknown[]>([]);
  const readyRef = React.useRef(false);

  const send = React.useCallback((msg: unknown) => {
    if (!readyRef.current) {
      queueRef.current.push(msg);
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }, []);

  const scrollToSection = React.useCallback(
    (id: string) => {
      // Two messages: select highlights it, scroll-to moves the viewport.
      send({ type: "PREVIEW_SELECT", payload: { id } });
      send({ type: "PREVIEW_SCROLL_TO", payload: { id } });
    },
    [send]
  );

  React.useImperativeHandle(ref, () => ({ send, scrollToSection }), [send, scrollToSection]);

  // Listen for messages from the iframe.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = e.data as IncomingMsg | undefined;
      if (!msg || typeof msg !== "object" || !("type" in msg)) return;
      switch (msg.type) {
        case "PREVIEW_READY": {
          readyRef.current = true;
          setReady(true);
          // Drain any messages buffered while we were waiting for the bridge.
          const win = iframeRef.current?.contentWindow;
          if (win) {
            for (const queued of queueRef.current) {
              win.postMessage(queued, "*");
            }
            queueRef.current.length = 0;
          }
          onReady?.();
          break;
        }
        case "PREVIEW_SECTION_CLICKED": {
          onSectionClicked?.(msg.payload.id);
          break;
        }
        case "PREVIEW_HEIGHT": {
          const h = (msg as { payload: { height: number } }).payload?.height;
          if (typeof h === "number" && h > 0) setContentHeight(h);
          break;
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onReady, onSectionClicked]);

  // On ready, push the entire current state.
  React.useEffect(() => {
    if (!ready) return;
    const data: Record<string, Record<string, unknown>> = {};
    const visibility: Record<string, boolean> = {};
    for (const s of sections) {
      data[s.id] = s.data as Record<string, unknown>;
      visibility[s.id] = s.visible;
    }
    send({
      type: "PREVIEW_INIT",
      payload: { sections: data, visibility, selectedId },
    });
    // We intentionally only re-init on `ready` flipping true; subsequent updates use PATCH.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Selection sync: tell the iframe to highlight & scroll to the new selected section.
  React.useEffect(() => {
    if (!ready || !selectedId) return;
    send({ type: "PREVIEW_SELECT", payload: { id: selectedId } });
    send({ type: "PREVIEW_SCROLL_TO", payload: { id: selectedId } });
  }, [ready, selectedId, send]);

  const logicalWidth = VIEWPORT_WIDTH[viewport];

  // All viewports: scale the logical-width iframe so the iframe behaves like
  // a real browser viewport at the chosen device width. Per-viewport MAX_SCALE
  // keeps tablet/mobile from blowing up to fill the entire canvas — they sit
  // centered with breathing room, like a real device on the editor surface.
  const fitScale =
    stageSize.w > 0
      ? Math.min(MAX_SCALE[viewport], stageSize.w / logicalWidth)
      : 1;

  // Iframe height in logical pixels — scaled to the visible canvas so
  // `position: fixed` overlays (AppHeader, BottomNav, CookieConsent) stay
  // sticky to the visible area, matching the live site.
  const logicalHeight =
    stageSize.h > 0 ? Math.round(stageSize.h / fitScale) : 720;

  // Visual width of the scaled iframe — drives the centered wrapper width.
  const visualWidth = Math.round(logicalWidth * fitScale);

  return (
    <div className="canvas-frame">
      <div className="canvas-chrome">
        <span className="canvas-dot" style={{ background: "#ff6b80" }} />
        <span className="canvas-dot" style={{ background: "#f5b042" }} />
        <span className="canvas-dot" style={{ background: "#2dd49a" }} />
        <div className="canvas-url">
          <Icon name="lock" size={11} style={{ color: "var(--accent-2)" }} />
          <span style={{ flex: 1 }} className="mono">
            {previewOrigin.replace(/^https?:\/\//, "")} <span style={{ opacity: 0.5 }}>?preview=true</span>
          </span>
          <span
            className={`status-pill ${status === "published" && !isDirty ? "published" : "draft"}`}
            style={{ padding: "2px 8px", fontSize: 10 }}
          >
            <span className={`dot ${status === "published" && !isDirty ? "good" : "warn"}`} />
            {status === "published" && !isDirty ? "LIVE" : "DRAFT"}
          </span>
          {ready && (
            <span
              className="chip good"
              style={{ padding: "2px 8px", fontSize: 9.5 }}
              title="postMessage bridge connected"
            >
              <span className="dot good" /> SYNC
            </span>
          )}
        </div>
        <div className="tab-strip">
          <button
            className={viewport === "desktop" ? "on" : ""}
            onClick={() => setViewport("desktop")}
            title="Desktop"
          >
            <Icon name="monitor" size={13} />
          </button>
          <button
            className={viewport === "tablet" ? "on" : ""}
            onClick={() => setViewport("tablet")}
            title="Tablet · 820"
          >
            <Icon name="tablet" size={13} />
          </button>
          <button
            className={viewport === "mobile" ? "on" : ""}
            onClick={() => setViewport("mobile")}
            title="Mobile · 390"
          >
            <Icon name="mobile" size={13} />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="canvas-scroll nice-scroll"
        style={{ position: "relative" }}
      >
        <div
          className={`canvas-stage ${viewport}`}
          style={{
            width: "100%",
            height: "100%",
            margin: 0,
            background: "#0a1322",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              position: "relative",
              width: visualWidth,
              height: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              background: "#090e1c",
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              title="Live spay-website preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => {
                setLoaded(true);
                // Iframe re-navigated — invalidate readiness until the next PREVIEW_READY.
                readyRef.current = false;
                setReady(false);
                setContentHeight(0);
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: logicalWidth,
                height: logicalHeight,
                border: 0,
                display: "block",
                background: "#090e1c",
                transform: `scale(${fitScale})`,
                transformOrigin: "top left",
                // Hide until (a) the iframe has loaded AND (b) the canvas has
                // been actually measured by ResizeObserver (not the seed). The
                // first frame the user sees is then at the correct fitScale —
                // no "wrong-then-snaps-when-you-click-mobile" flash.
                opacity: loaded && measured ? 1 : 0,
                transition: "opacity .25s ease",
              }}
            />
            {!loaded && <ConnectingOverlay url={previewUrl} />}
          </div>
        </div>
      </div>
      {stageSize.w > 0 && (
        <span
          className="mono"
          style={{
            position: "absolute",
            bottom: 8,
            right: 12,
            padding: "2px 8px",
            borderRadius: 6,
            background: "rgba(9,14,28,.7)",
            border: "1px solid var(--line)",
            color: "var(--text-3)",
            fontSize: 9.5,
            letterSpacing: ".06em",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {logicalWidth}×{Math.round(logicalHeight)} · {Math.round(fitScale * 100)}%
        </span>
      )}
    </div>
  );
});

function ConnectingOverlay({ url }: { url: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(9,14,28,.65), rgba(9,14,28,.95))",
        backdropFilter: "blur(8px)",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            margin: "0 auto 14px",
            background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
            display: "grid",
            placeItems: "center",
            color: "#001819",
            boxShadow: "0 0 30px -4px rgba(4,186,191,.6)",
            animation: "pulseGlow 1.6s ease-in-out infinite",
          }}
        >
          <Icon name="zap" size={20} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
          Connecting to live preview…
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, letterSpacing: ".05em" }}
        >
          {url}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 11,
            color: "var(--text-3)",
            maxWidth: 320,
            lineHeight: 1.55,
            margin: "14px auto 0",
          }}
        >
          Make sure the spay-website Next.js app is running. Edits will flow into the iframe via
          postMessage as soon as the bridge is up.
        </div>
      </div>
    </div>
  );
}
