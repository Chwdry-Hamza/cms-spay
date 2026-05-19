"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import { builderApi, type BackendPage } from "@/lib/builder-api";

export function PageSeoModal({
  open,
  page,
  onClose,
  onSaved,
}: {
  open: boolean;
  page: Pick<
    BackendPage,
    "slug" | "title" | "seoTitle" | "seoDescription" | "seoKeywords" | "ogImage" | "noindex"
  > | null;
  onClose: () => void;
  onSaved: (updated: BackendPage) => void;
}) {
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [seoKeywords, setSeoKeywords] = React.useState("");
  const [ogImage, setOgImage] = React.useState("");
  const [noindex, setNoindex] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!page) return;
    setSeoTitle(page.seoTitle ?? "");
    setSeoDescription(page.seoDescription ?? "");
    setSeoKeywords(page.seoKeywords ?? "");
    setOgImage(page.ogImage ?? "");
    setNoindex(page.noindex ?? false);
    setError(null);
  }, [page, open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !page) return null;

  const nullableTrim = (v: string) => (v.trim() === "" ? null : v.trim());

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { page: updated } = await builderApi.updatePage(
        {
          seoTitle: nullableTrim(seoTitle),
          seoDescription: nullableTrim(seoDescription),
          seoKeywords: nullableTrim(seoKeywords),
          ogImage: nullableTrim(ogImage),
          noindex,
        },
        page.slug,
      );
      onSaved(updated);
      onClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to save SEO settings");
    } finally {
      setIsSaving(false);
    }
  };

  const previewTitle = seoTitle.trim() || page.title || "SPay";
  const previewDescription =
    seoDescription.trim() ||
    "Add a meta description to control this preview text.";

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
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(4,186,191,.05)",
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
            <Icon name="globe" size={15} />
          </span>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              SEO settings — Home page
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              Controls how this page appears in Google results and social
              shares (WhatsApp, Twitter, LinkedIn).
            </span>
          </div>
          <button className="btn icon ghost" onClick={onClose} title="Close (Esc)">
            <Icon name="x" size={14} />
          </button>
        </div>

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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Field label={`SEO title — ${seoTitle.length}/60`}>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`e.g. ${page.title || "SPay"} — Spend crypto like cash`}
                style={inputStyle}
              />
            </Field>
            <Field label="OG image URL">
              <input
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://… or /og-image.png (1200×630 recommended)"
                style={inputStyle}
              />
            </Field>
            <Field
              label={`Meta description — ${seoDescription.length}/160`}
              span={2}
            >
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                placeholder="One or two sentences shown under the title in Google search results."
                style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
              />
            </Field>
            <Field label="Keywords (comma-separated)" span={2}>
              <textarea
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                rows={2}
                placeholder="e.g. crypto debit card, spend crypto, USDT card, digital wallet"
                style={{ ...inputStyle, resize: "vertical", minHeight: 56 }}
              />
            </Field>
            <Field label="Search engine indexing" span={2}>
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
                  onChange={(e) => setNoindex(e.target.checked)}
                />
                <span>
                  {noindex
                    ? "Hidden from Google (noindex)"
                    : "Indexable by Google"}
                </span>
              </label>
            </Field>
          </div>

          {/* Google preview */}
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: "rgba(255,255,255,.02)",
              border: "1px dashed var(--line)",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                color: "var(--text-3)",
                letterSpacing: ".14em",
                marginBottom: 8,
              }}
            >
              GOOGLE RESULT PREVIEW
            </div>
            <div style={{ fontSize: 11, color: "#9aa0a6", marginBottom: 2 }}>
              spay.example.com
            </div>
            <div
              style={{
                fontSize: 17,
                color: "#8ab4f8",
                lineHeight: 1.3,
                marginBottom: 4,
              }}
            >
              {previewTitle}
            </div>
            <div
              style={{ fontSize: 12.5, color: "#bdc1c6", lineHeight: 1.45 }}
            >
              {previewDescription}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 18px",
            borderTop: "1px solid var(--line)",
            background: "rgba(0,0,0,.15)",
          }}
        >
          <button
            className="btn"
            onClick={onClose}
            style={{ padding: "8px 14px" }}
          >
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={isSaving}
            style={{ padding: "8px 14px", opacity: isSaving ? 0.6 : 1 }}
          >
            <Icon name="save" size={13} />
            {isSaving ? "Saving…" : "Save SEO settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <label style={{ display: "block", gridColumn: span === 2 ? "1 / -1" : undefined }}>
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--text-3)",
          letterSpacing: ".14em",
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </label>
  );
}
