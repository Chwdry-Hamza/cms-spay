"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import { Card, SectionHeader } from "@/components/Card";
import { redirectsApi, type RedirectRow } from "@/lib/redirects-api";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export default function RedirectsView() {
  const [rows, setRows] = React.useState<RedirectRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RedirectRow | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const { redirects } = await redirectsApi.list();
      setRows(redirects);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (fromSlug: string) => {
    if (
      !window.confirm(
        `Remove redirect from "/${fromSlug}"? Old inbound links to this URL will start returning 404.`,
      )
    ) {
      return;
    }
    try {
      await redirectsApi.remove(fromSlug);
      await reload();
    } catch (e) {
      window.alert(`Delete failed: ${(e as Error).message}`);
    }
  };

  return (
    <div
      className="content fade-in"
      style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}
    >
      <Card padding={20}>
        <SectionHeader
          eyebrow="ADMIN"
          title="Redirects"
          right={
            <button
              className="btn primary"
              onClick={() => setIsCreateOpen(true)}
              style={{ padding: "8px 14px" }}
            >
              <Icon name="plus" size={13} />
              New redirect
            </button>
          }
        />

        <p
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            margin: "0 0 14px",
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          When a Page&apos;s slug is renamed, a 308 redirect is created
          automatically. You can also add manual redirects below — useful for
          links coming from print, email, or a legacy domain. Redirect chains
          are collapsed on write so every entry is a single hop.
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              background: "rgba(255,107,128,.08)",
              border: "1px solid rgba(255,107,128,.25)",
              color: "#ffb1bd",
              fontSize: 12.5,
            }}
          >
            Could not load redirects: {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, color: "var(--text-3)", fontSize: 13 }}>
            Loading redirects…
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: 13,
            }}
          >
            No redirects yet. Rename a Page&apos;s slug or click &ldquo;New
            redirect&rdquo; to add one.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                className="mono"
                style={{
                  textAlign: "left",
                  color: "var(--text-3)",
                  fontSize: 10,
                  letterSpacing: ".14em",
                }}
              >
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>FROM</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>TO</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>CODE</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>REASON</th>
                <th style={{ padding: "10px 6px", fontWeight: 400 }}>CREATED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.fromSlug} style={{ borderTop: "1px solid var(--line)" }}>
                  <td
                    style={{ padding: "12px 6px", fontWeight: 500 }}
                    className="mono"
                  >
                    /{r.fromSlug}
                  </td>
                  <td style={{ padding: "12px 6px" }} className="mono">
                    <span style={{ color: "var(--text-3)", marginRight: 6 }}>→</span>
                    /{r.toSlug}
                  </td>
                  <td style={{ padding: "12px 6px" }} className="mono">
                    {r.statusCode}
                  </td>
                  <td style={{ padding: "12px 6px" }}>
                    <span
                      className="chip"
                      style={{
                        padding: "3px 8px",
                        fontSize: 10.5,
                        background:
                          r.reason === "auto-slug-change"
                            ? "rgba(4,186,191,.08)"
                            : "rgba(140,140,160,.08)",
                        borderColor:
                          r.reason === "auto-slug-change"
                            ? "rgba(4,186,191,.25)"
                            : "var(--line)",
                        color:
                          r.reason === "auto-slug-change"
                            ? "var(--accent-2)"
                            : "var(--text-2)",
                      }}
                    >
                      {r.reason === "auto-slug-change" ? "Auto · slug rename" : "Manual"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 6px", color: "var(--text-3)" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 6px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button
                        className="btn icon ghost"
                        title="Edit"
                        onClick={() => setEditing(r)}
                      >
                        <Icon name="edit" size={13} />
                      </button>
                      <button
                        className="btn icon ghost"
                        title="Delete"
                        onClick={() => handleDelete(r.fromSlug)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {isCreateOpen && (
        <RedirectFormModal
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onSaved={async () => {
            setIsCreateOpen(false);
            await reload();
          }}
        />
      )}
      {editing && (
        <RedirectFormModal
          mode="edit"
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

/* ─── Form modal (create + edit share a body) ────────────────────────────── */

function RedirectFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: RedirectRow;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [fromSlug, setFromSlug] = React.useState(initial?.fromSlug ?? "");
  const [toSlug, setToSlug] = React.useState(initial?.toSlug ?? "");
  const [statusCode, setStatusCode] = React.useState<301 | 308>(
    initial?.statusCode ?? 308,
  );
  const [note, setNote] = React.useState(initial?.note ?? "");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const isEdit = mode === "edit";
  const normFrom = normalizeSlug(fromSlug);
  const normTo = normalizeSlug(toSlug);
  const fromValid = isEdit || (normFrom !== "" && SLUG_RE.test(normFrom));
  const toValid = normTo !== "" && SLUG_RE.test(normTo);
  const distinct = normFrom !== normTo;
  const canSubmit = fromValid && toValid && distinct && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    try {
      if (isEdit && initial) {
        await redirectsApi.update(initial.fromSlug, {
          toSlug: normTo,
          statusCode,
          note: note.trim() === "" ? null : note.trim(),
        });
      } else {
        await redirectsApi.create({
          fromSlug: normFrom,
          toSlug: normTo,
          statusCode,
          note: note.trim() === "" ? null : note.trim(),
        });
      }
      await onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 22,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--accent-2)",
                letterSpacing: ".16em",
                marginBottom: 4,
              }}
            >
              {isEdit ? "EDIT REDIRECT" : "NEW REDIRECT"}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              {isEdit ? `/${initial?.fromSlug}` : "Add a redirect"}
            </h2>
          </div>
          <button className="btn icon ghost" onClick={onClose} title="Close">
            <Icon name="x" size={13} />
          </button>
        </div>

        <Field label="From slug">
          <input
            value={fromSlug}
            disabled={isEdit}
            onChange={(e) => setFromSlug(e.target.value)}
            onBlur={(e) => setFromSlug(normalizeSlug(e.target.value))}
            placeholder="e.g. old-privacy"
            style={{
              ...inputStyle,
              opacity: isEdit ? 0.55 : 1,
              borderColor:
                fromSlug && !fromValid
                  ? "rgba(239, 68, 68, .55)"
                  : "var(--line)",
            }}
          />
          {!isEdit && (
            <div style={hintStyle}>
              Lowercase letters, numbers, and hyphens only. Must not match any
              live page&apos;s slug.
            </div>
          )}
        </Field>

        <Field label="To slug">
          <input
            value={toSlug}
            onChange={(e) => setToSlug(e.target.value)}
            onBlur={(e) => setToSlug(normalizeSlug(e.target.value))}
            placeholder="e.g. privacy-policy"
            style={{
              ...inputStyle,
              borderColor:
                toSlug && !toValid
                  ? "rgba(239, 68, 68, .55)"
                  : "var(--line)",
            }}
          />
          <div style={hintStyle}>
            Where visitors will land. Doesn&apos;t need to be an existing page
            yet.
          </div>
        </Field>

        <Field label="Status code">
          <div style={{ display: "flex", gap: 8 }}>
            {([308, 301] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setStatusCode(code)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background:
                    statusCode === code
                      ? "rgba(4,186,191,.10)"
                      : "rgba(255,255,255,.02)",
                  borderColor:
                    statusCode === code
                      ? "rgba(4,186,191,.55)"
                      : "var(--line)",
                  color: statusCode === code ? "var(--accent-2)" : "var(--text-2)",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <div className="mono" style={{ fontSize: 11, marginBottom: 2 }}>
                  {code}
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 400, color: "var(--text-3)" }}>
                  {code === 308 ? "Permanent (recommended)" : "Permanent (legacy)"}
                </div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Note (optional)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Why this redirect exists — visible only in the CMS."
            style={{ ...inputStyle, resize: "vertical", minHeight: 52 }}
          />
        </Field>

        {!distinct && fromSlug && toSlug && (
          <div style={errStyle}>From and To slugs must differ.</div>
        )}
        {err && <div style={errStyle}>{err}</div>}

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 4,
          }}
        >
          <button className="btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={submit}
            disabled={!canSubmit}
            style={{ padding: "8px 14px", opacity: canSubmit ? 1 : 0.5 }}
          >
            <Icon name="save" size={13} />
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create redirect"}
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
  color: "var(--text-2)",
  fontSize: 13,
  fontFamily: "inherit",
};

const hintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 10.5,
  color: "var(--text-3)",
  lineHeight: 1.4,
};

const errStyle: React.CSSProperties = {
  fontSize: 12.5,
  padding: 10,
  borderRadius: 8,
  background: "rgba(255,107,128,.08)",
  border: "1px solid rgba(255,107,128,.25)",
  color: "#ffb1bd",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
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
