"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { Card } from "@/components/Card";
import { RadialScore } from "@/components/charts";

export default function EditorView() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTitle = params?.get("title") || "Untitled post";
  const [title, setTitle] = React.useState(initialTitle);
  const score = 78;

  const issues = [
    { t: "Add primary keyword to H1", s: "warn" },
    { t: "Meta description is 142 chars (good)", s: "good" },
    { t: "Image at line 24 missing alt text", s: "warn" },
    { t: "Word count 1,420 — strong", s: "good" },
    { t: "Internal links: 3 found, aim for 5+", s: "warn" },
    { t: "Readability: Grade 8 (good)", s: "good" },
  ];

  return (
    <div className="content fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card padding={20}>
          <div style={{ display: "flex", gap: 4, padding: 4, borderBottom: "1px solid var(--line)", marginBottom: 16, paddingBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn icon ghost"><Icon name="h1" size={14} /></button>
            <button className="btn icon ghost"><Icon name="h2" size={14} /></button>
            <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />
            <button className="btn icon ghost"><Icon name="bold" size={14} /></button>
            <button className="btn icon ghost"><Icon name="italic" size={14} /></button>
            <button className="btn icon ghost"><Icon name="underline" size={14} /></button>
            <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />
            <button className="btn icon ghost"><Icon name="list" size={14} /></button>
            <button className="btn icon ghost"><Icon name="quote" size={14} /></button>
            <button className="btn icon ghost"><Icon name="link" size={14} /></button>
            <button className="btn icon ghost"><Icon name="image" size={14} /></button>
            <button className="btn icon ghost"><Icon name="code" size={14} /></button>
            <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />
            <button className="btn ghost" style={{ fontSize: 11.5 }}>
              <Icon name="sparkles" size={12} />AI rewrite
            </button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, fontSize: 11, color: "var(--text-3)", alignItems: "center" }}>
              <span className="dot good" />Saved 2s ago
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-.02em",
              fontFamily: "inherit",
              padding: 0,
              marginBottom: 6,
            }}
          />
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 18, display: "flex", gap: 12 }}>
            <span><Icon name="users" size={11} /> Mira Chen</span>
            <span>·</span>
            <span>Last edited just now</span>
            <span>·</span>
            <span>1,420 words · 7 min read</span>
          </div>

          <div style={{ fontSize: 14.5, lineHeight: 1.75, color: "var(--text)", display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0 }}>
              The search landscape has shifted dramatically over the past eighteen months. With{" "}
              <span style={{ background: "rgba(4,186,191,.15)", padding: "1px 4px", borderRadius: 4, color: "var(--accent-2)" }}>
                generative engines
              </span>{" "}
              now mediating most informational queries, the old SEO playbook — keyword density, exact-match anchors, and thin content at scale — is finally, decisively obsolete.
            </p>
            <h3 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 600 }}>What actually moves the needle in 2026</h3>
            <p style={{ margin: 0 }}>
              Three signals dominate the modern ranking stack: <strong style={{ color: "#fff" }}>entity coverage</strong>,{" "}
              <strong style={{ color: "#fff" }}>first-party experience data</strong>, and{" "}
              <strong style={{ color: "#fff" }}>semantic freshness</strong>. We&apos;ll walk through each, with examples from publishers who 2x&apos;d organic in the last quarter.
            </p>
            <div style={{ padding: 14, borderRadius: 12, background: "rgba(4,186,191,.06)", border: "1px solid rgba(4,186,191,.2)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ padding: 6, borderRadius: 8, background: "rgba(4,186,191,.18)", display: "grid", placeItems: "center" }}>
                <Icon name="sparkles" size={14} style={{ color: "var(--accent-2)" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--accent-2)", fontWeight: 500, marginBottom: 4 }}>AI suggestion</div>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Add a comparison table contrasting 2024 vs 2026 ranking factors — competitors covering this term include 3 such tables on average.
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }}>Insert</button>
                  <button className="btn ghost" style={{ padding: "4px 10px", fontSize: 11 }}>Dismiss</button>
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: "var(--text-2)" }}>
              Entity coverage refers to the breadth of related concepts, named entities, and sub-topics your content addresses…
            </p>
            <p style={{ margin: 0, color: "var(--text-3)" }}>[ Continue typing or use ⌘J for AI continue… ]</p>
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80, alignSelf: "flex-start" }}>
        <Card padding={18}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em" }}>SEO SCORE</div>
            <span className="chip warn">Improving</span>
          </div>
          <div style={{ display: "grid", placeItems: "center", padding: "8px 0 14px" }}>
            <RadialScore value={score} size={140} stroke={11} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {issues.map((iss, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 8,
                  background: "rgba(9,14,28,.4)",
                  border: "1px solid var(--line)",
                }}
              >
                <Icon
                  name={iss.s === "good" ? "check" : "x"}
                  size={12}
                  style={{ color: iss.s === "good" ? "var(--good)" : "var(--warn)", flexShrink: 0 }}
                />
                <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>{iss.t}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={18}>
          <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 12 }}>METADATA</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-3)", display: "block", marginBottom: 4 }}>Slug</label>
              <input className="input" defaultValue="ai-reshaping-technical-seo-2026" style={{ fontSize: 12, fontFamily: "Geist Mono" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-3)", display: "block", marginBottom: 4 }}>Meta description</label>
              <textarea
                className="input"
                rows={3}
                style={{ resize: "vertical", fontSize: 12 }}
                defaultValue="A practical look at how generative engines are changing the SEO playbook — and what to do about it."
              />
              <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", textAlign: "right", marginTop: 4 }}>108 / 160</div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-3)", display: "block", marginBottom: 4 }}>Primary keyword</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="chip" style={{ borderColor: "rgba(4,186,191,.4)", color: "#fff", background: "rgba(4,186,191,.12)" }}>
                  generative SEO <Icon name="x" size={10} />
                </span>
                <span className="chip">ai search</span>
                <span className="chip">technical SEO</span>
                <span className="chip" style={{ borderStyle: "dashed", color: "var(--text-3)" }}>+ add</span>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => router.push("/blogs")}>
            Cancel
          </button>
          <button className="btn primary" style={{ flex: 1, justifyContent: "center" }}>Publish</button>
        </div>
      </div>
    </div>
  );
}
