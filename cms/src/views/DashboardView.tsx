"use client";
import * as React from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { Card, StatCard, SectionHeader } from "@/components/Card";
import { AreaChart, Sparkline } from "@/components/charts";
import { INITIAL_SECTIONS } from "./builder/sectionsData";

export default function DashboardView() {
  const traffic = [180, 220, 240, 280, 260, 300, 340, 320, 380, 410, 460, 480, 520, 540, 600, 640, 680, 720, 780, 820, 880, 920, 970, 1020];
  const conversions = [12, 14, 16, 14, 18, 22, 21, 24, 27, 30, 32, 34, 38, 42, 44, 48, 52, 55, 58, 62, 64, 68, 72, 76];
  const [range, setRange] = React.useState("30d");

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero CTA */}
      <Card glow padding={0} style={{ overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 28,
            padding: 24,
            alignItems: "center",
            position: "relative",
          }}
        >
          <div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".18em", marginBottom: 8 }}
            >
              VISUAL CMS · SPAY MAIN
            </div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-.015em", lineHeight: 1.2 }}>
              Your landing page is{" "}
              <span style={{ color: "#93f1c4" }}>live and in sync</span>
              <br />
              <span style={{ color: "var(--text-2)", fontWeight: 400, fontSize: 18 }}>
                across <span style={{ color: "var(--text)" }}>13 sections</span> and{" "}
                <span style={{ color: "var(--text)" }}>3 viewports</span>.
              </span>
            </h2>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <Link href="/builder" className="btn primary" style={{ padding: "10px 16px" }}>
                <Icon name="builder" size={14} />
                Open builder
                <span className="kbd">B</span>
              </Link>
              <Link href="/sections" className="btn" style={{ padding: "10px 16px" }}>
                <Icon name="layers" size={14} />
                Manage sections
              </Link>
              <Link href="/media" className="btn ghost">
                <Icon name="image" size={13} />
                Media library
              </Link>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              padding: 14,
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "linear-gradient(180deg, rgba(14,46,46,.4), rgba(9,14,28,.7))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className="status-pill published">
                <span className="dot good" /> Published
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                v4.12.STABLE
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginLeft: "auto" }}>
                2h ago · Elena
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <PresenceAvatar initials="EM" tone="teal" />
              <PresenceAvatar initials="JR" tone="purple" />
              <PresenceAvatar initials="AK" tone="green" />
              <span style={{ fontSize: 11.5, color: "var(--text-2)", marginLeft: 4, alignSelf: "center" }}>
                3 editors active
              </span>
            </div>
            <div style={{ height: 1, background: "var(--line)", margin: "12px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <KV label="Avg. publish time" value="1.4s" />
              <KV label="Sections in draft" value="0" tone="good" />
              <KV label="Pending review" value="2" tone="warn" />
              <KV label="Last revision" value="#412" />
            </div>
          </div>
        </div>
      </Card>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Sections live" value="13" delta="+2" spark={[8,9,9,10,10,11,11,11,12,12,12,13,13,13]} hint="of 14 detected" />
        <StatCard label="Visitors · 30d" value="284K" delta="+22.4%" spark={[140,160,170,180,190,210,220,240,260,250,265,278,284,290]} hint="vs prior period" />
        <StatCard label="CTA conversions" value="9.4%" delta="+1.8%" spark={[5.2,5.6,5.8,6.0,6.4,6.8,7.0,7.4,7.6,8.0,8.4,8.6,9.0,9.4]} hint="GET THE APP click-through" />
        <StatCard label="Avg. publish time" value="1.4s" delta="-0.6s" deltaDir="down" spark={[3.0,2.8,2.6,2.4,2.2,2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.4,1.4]} hint="from save to live" />
      </div>

      {/* Performance + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--accent-2)", letterSpacing: ".16em", marginBottom: 4 }}>
                LANDING PERFORMANCE
              </div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Visitors vs CTA conversions</div>
            </div>
            <div className="tab-strip">
              {["7d", "30d", "90d", "1y"].map((t) => (
                <button key={t} className={range === t ? "on" : ""} onClick={() => setRange(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <AreaChart data={traffic} secondary={conversions} height={220} />
          <div style={{ display: "flex", gap: 18, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            <Legend color="var(--accent)" label="Visitors" value="284,392" delta="+22.4%" />
            <Legend color="rgba(45,212,154,.8)" label="GET THE APP clicks" value="26,754" delta="+38.1%" />
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 11 }}>
              <span className="dot" /> Live · 437 viewing now
            </div>
          </div>
        </Card>

        <Card padding={0}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="history" size={14} style={{ color: "var(--accent-2)" }} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Activity</span>
            <span className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", marginLeft: "auto" }}>
              LIVE
            </span>
          </div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <ActivityRow
              icon="rocket"
              tone="good"
              title="Hero published"
              detail="Elena pushed v4.12 — added new mobile subtitle"
              time="2h"
            />
            <ActivityRow
              icon="image"
              tone="info"
              title="Asset replaced"
              detail="heroImageSpay.png updated · 1.2 MB → 642 KB"
              time="3h"
            />
            <ActivityRow
              icon="edit"
              tone="info"
              title="FeaturesSection edited"
              detail="Jordan rewrote the CRYPTO card description"
              time="5h"
            />
            <ActivityRow
              icon="branch"
              tone="warn"
              title="Branch · campaign-launch"
              detail="2 sections changed, awaiting review"
              time="9h"
            />
            <ActivityRow
              icon="users"
              tone="info"
              title="Maya joined as Editor"
              detail="Granted access to Sections + Media"
              time="1d"
            />
            <ActivityRow
              icon="globe"
              tone="good"
              title="SEO updated"
              detail="Open Graph image refreshed across all pages"
              time="2d"
            />
          </div>
        </Card>
      </div>

      {/* Section health + Media usage */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Card padding={0}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name="layers" size={14} style={{ color: "var(--accent-2)" }} />
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Section health</div>
            <span className="chip good" style={{ padding: "2px 8px", marginLeft: 4 }}>
              <span className="dot good" /> 12 / 13 healthy
            </span>
            <Link href="/builder" className="btn ghost" style={{ marginLeft: "auto", padding: "5px 8px", fontSize: 11.5 }}>
              Open builder <Icon name="arrow-right" size={11} />
            </Link>
          </div>

          <div style={{ padding: "8px 12px" }}>
            {INITIAL_SECTIONS.slice(0, 8).map((s, i) => {
              const usage = 30 + ((i * 13) % 70);
              const tone = s.id === "joinUs" ? "warn" : usage > 60 ? "good" : "info";
              return (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "30px 1fr 80px 100px 80px",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 8px",
                    borderRadius: 10,
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(4,186,191,.04)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, rgba(4,186,191,.15), rgba(4,186,191,.04))",
                      border: "1px solid var(--line-2)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--accent-2)",
                    }}
                  >
                    <Icon name={s.icon} size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                      {s.file}
                    </div>
                  </div>
                  <div>
                    <Sparkline
                      data={Array.from({ length: 12 }).map((_, j) => 50 + Math.sin((i + j) * 0.6) * 30 + j * 2)}
                      width={80}
                      height={20}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 999,
                        background: "rgba(255,255,255,.06)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${usage}%`,
                          height: "100%",
                          background:
                            tone === "warn"
                              ? "linear-gradient(90deg, #f5b042, #ffd594)"
                              : "linear-gradient(90deg, var(--accent-2), var(--accent))",
                          boxShadow: "0 0 8px rgba(4,186,191,.5)",
                        }}
                      />
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", width: 26 }}>
                      {usage}%
                    </span>
                  </div>
                  <span
                    className={`chip ${tone === "warn" ? "warn" : tone === "good" ? "good" : ""}`}
                    style={{ padding: "1px 7px", fontSize: 9.5, justifySelf: "end" }}
                  >
                    <span className={`dot ${tone === "warn" ? "warn" : "good"}`} />
                    {tone === "warn" ? "DRAFT" : "LIVE"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader
            eyebrow="MEDIA LIBRARY"
            title="Recently uploaded"
            right={
              <Link href="/media" className="btn ghost" style={{ padding: "5px 8px", fontSize: 11.5 }}>
                View all <Icon name="arrow-right" size={11} />
              </Link>
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              "heroImageSpay.png",
              "spayFront.png",
              "paymentMobile.png",
              "crypto.jpeg",
              "notifications.jpeg",
              "transactions.jpeg",
            ].map((name) => (
              <div
                key={name}
                style={{
                  aspectRatio: "1",
                  borderRadius: 10,
                  background: "#0a1322",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                }}
                title={name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/${name}`}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "4px 6px",
                    background: "linear-gradient(to top, rgba(0,0,0,.85), transparent)",
                    fontSize: 9.5,
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  className="mono"
                >
                  {name}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-2)" }}>
              <Icon name="upload" size={12} style={{ color: "var(--accent-2)" }} />
              <span>Storage used</span>
              <span style={{ marginLeft: "auto", color: "var(--text)" }}>
                <strong>2.8 GB</strong> of 10 GB
              </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.05)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: "28%", height: "100%", background: "linear-gradient(90deg, var(--accent-2), var(--accent))", boxShadow: "0 0 12px var(--accent)" }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Publish history + quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
        <Card padding={20}>
          <SectionHeader eyebrow="DRAFT / PUBLISH WORKFLOW" title="Publish history" right={<Link href="/builder" className="btn ghost" style={{ padding: "5px 10px", fontSize: 11.5 }}><Icon name="branch" size={11}/>Branches</Link>} />
          <div style={{ position: "relative", paddingLeft: 16 }}>
            <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 2, background: "linear-gradient(180deg, var(--accent), transparent)", borderRadius: 1 }} />
            {[
              { v: "v4.12", title: "Hero copy refresh", who: "Elena", when: "2h ago", tone: "published", note: "added new mobile subtitle, updated CTA gradient" },
              { v: "v4.11", title: "Card descriptions", who: "Jordan", when: "5h ago", tone: "published", note: "rewrote CRYPTO and HISTORY card body copy" },
              { v: "v4.10", title: "Crypto tickers", who: "Aisha", when: "1d ago", tone: "published", note: "added SOL, ADA, DOGE to ticker rail" },
              { v: "v4.09-rc", title: "Campaign launch", who: "Elena", when: "2d ago", tone: "scheduled", note: "scheduled for 2026-05-12 09:00 UTC" },
            ].map((r, i) => (
              <div key={i} style={{ position: "relative", paddingLeft: 18, paddingBottom: i === 3 ? 0 : 18 }}>
                <span
                  style={{
                    position: "absolute",
                    left: -3,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: r.tone === "scheduled" ? "rgba(4,186,191,.2)" : "rgba(45,212,154,.2)",
                    border: `2px solid ${r.tone === "scheduled" ? "var(--accent)" : "#2dd49a"}`,
                    boxShadow: `0 0 12px ${r.tone === "scheduled" ? "rgba(4,186,191,.6)" : "rgba(45,212,154,.5)"}`,
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".06em" }}>
                    {r.v}
                  </span>
                  <span className={`status-pill ${r.tone}`} style={{ padding: "1px 7px", fontSize: 9.5 }}>
                    <span className={`dot ${r.tone === "scheduled" ? "" : "good"}`} />
                    {r.tone === "scheduled" ? "SCHEDULED" : "PUBLISHED"}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{r.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>{r.note}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>
                  {r.who} · {r.when}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader eyebrow="SHORTCUTS" title="Quick actions" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <ShortcutTile icon="rocket" label="Deploy preview" hint="⌘ + P" />
            <ShortcutTile icon="wand" label="AI copy variants" hint="Compose" />
            <ShortcutTile icon="image" label="Upload media" />
            <ShortcutTile icon="globe" label="SEO audit" />
            <ShortcutTile icon="users" label="Invite editor" />
            <ShortcutTile icon="sitemap" label="Export sitemap" />
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />
          <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: ".15em", marginBottom: 8 }}>
            KEYBOARD MAP
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <KeyHint keys={["⌘", "B"]} label="Open builder" />
            <KeyHint keys={["⌘", "K"]} label="Quick search" />
            <KeyHint keys={["⌘", "⇧", "P"]} label="Publish current page" />
            <KeyHint keys={["⌘", "/"]} label="Toggle live preview" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function PresenceAvatar({ initials, tone }: { initials: string; tone: "teal" | "purple" | "green" }) {
  const grad =
    tone === "teal"
      ? "linear-gradient(135deg, #1ad6db, #0e2e2e)"
      : tone === "purple"
      ? "linear-gradient(135deg, #b88aff, #4c2a78)"
      : "linear-gradient(135deg, #2dd49a, #0e3a2c)";
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: grad,
        display: "grid",
        placeItems: "center",
        fontSize: 10,
        fontWeight: 600,
        color: "#001819",
        boxShadow: "0 0 0 2px var(--bg), 0 0 0 3px rgba(4,186,191,.25)",
        marginLeft: -6,
      }}
    >
      {initials}
    </div>
  );
}

function KV({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".14em" }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: tone === "good" ? "#93f1c4" : tone === "warn" ? "#ffd594" : "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Legend({ color, label, value, delta }: { color: string; label: string; value: string; delta: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}` }} />
      <div>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".14em" }}>
          {label.toUpperCase()}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
          <span style={{ fontSize: 11, color: "#93f1c4" }}>{delta}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  icon,
  tone,
  title,
  detail,
  time,
}: {
  icon: IconName;
  tone: "good" | "warn" | "info" | "bad";
  title: string;
  detail: string;
  time: string;
}) {
  const colors: Record<string, string> = {
    good: "#93f1c4",
    warn: "#ffd594",
    info: "var(--accent-2)",
    bad: "#ffb1bd",
  };
  const bgs: Record<string, string> = {
    good: "rgba(45,212,154,.1)",
    warn: "rgba(245,176,66,.1)",
    info: "rgba(4,186,191,.1)",
    bad: "rgba(255,107,128,.1)",
  };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: bgs[tone],
          color: colors[tone],
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          border: `1px solid ${bgs[tone]}`,
        }}
      >
        <Icon name={icon} size={13} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginLeft: "auto" }}>
            {time}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.45, marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}

function ShortcutTile({ icon, label, hint }: { icon: IconName; label: string; hint?: string }) {
  return (
    <button
      className="btn"
      style={{
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "12px 14px",
        textAlign: "left",
        gap: 8,
        height: 76,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "linear-gradient(135deg, rgba(4,186,191,.18), rgba(4,186,191,.04))",
          border: "1px solid var(--line-2)",
          display: "grid",
          placeItems: "center",
          color: "var(--accent-2)",
        }}
      >
        <Icon name={icon} size={13} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
      {hint && (
        <span className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".08em" }}>
          {hint}
        </span>
      )}
    </button>
  );
}

function KeyHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
      <span style={{ color: "var(--text-2)" }}>{label}</span>
      <span style={{ display: "flex", gap: 4 }}>
        {keys.map((k, i) => (
          <span key={i} className="kbd">
            {k}
          </span>
        ))}
      </span>
    </div>
  );
}
