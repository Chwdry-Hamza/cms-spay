# Handoff: Spay — SEO CMS Dashboard

## Overview
Spay is a premium futuristic SEO content management dashboard. The product helps content/SEO teams plan, write, optimize, and ship content from one workspace. This handoff covers the full admin UI: dashboard home, pages, blogs, blog editor, SEO analytics, keyword tracking, media library + upload modal, redirects, sitemap, users, and global settings.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive React prototypes (rendered with in-browser Babel) showing the intended look and behavior. They are **not production code to copy directly**.

Your task is to **recreate these designs in your target codebase's environment** using its existing patterns, component primitives, design tokens, and routing. If no environment exists yet, the recommended stack is **Vite + React + TypeScript + Tailwind CSS** (or CSS Modules) with **TanStack Router** or React Router for navigation. Charts can be rebuilt with the included custom SVG approach (lightweight, no dependency) or swapped for `recharts` / `visx` if your codebase already uses one.

## Fidelity
**High-fidelity (hifi).** Every color, type size, spacing value, radius, glow, and interaction is pinned. Recreate pixel-perfectly. Animations and hover states are intentional and should be preserved.

## Tech notes for the prototype
- **React 18.3** + JSX via Babel standalone (prototype only — replace with a build step)
- **Inline `<style>` block** in `Spay Dashboard.html` holds tokens and global rules
- Charts are **custom SVG components** in `src/charts.jsx` — copy or replace
- Icons are **inline SVG** in `src/icons.jsx` — replace with `lucide-react` (closest match) or keep as-is
- State is local React state; no backend
- Components share scope via `window.*` exports (a Babel-standalone workaround); convert to ES modules with named exports

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#060a16` | Outer page background |
| `--bg-2` | `#090e1c` | Surface base / topbar |
| `--surface` | `#0e2e2e` | Brand teal-tinted surface |
| `--surface-2` | `#0c1626` | Card inner |
| `--line` | `rgba(140, 220, 220, 0.08)` | Hairline borders |
| `--line-2` | `rgba(4, 186, 191, 0.18)` | Accent borders / chips |
| `--text` | `#e6f7f8` | Primary text |
| `--text-2` | `#98b3b6` | Secondary text |
| `--text-3` | `#5d7478` | Tertiary / labels |
| `--accent` | `#04babf` | Primary brand accent |
| `--accent-2` | `#1ad6db` | Brighter accent / hover |
| `--accent-soft` | `rgba(4, 186, 191, 0.14)` | Accent fills |
| `--good` | `#2dd49a` | Success |
| `--warn` | `#f5b042` | Warning |
| `--bad` | `#ff6b80` | Error / negative delta |

### Background gradient (body)
```css
background:
  radial-gradient(1200px 700px at 8% -10%, rgba(4, 186, 191, 0.10), transparent 60%),
  radial-gradient(900px 600px at 100% 0%, rgba(14, 46, 46, 0.55), transparent 55%),
  radial-gradient(800px 500px at 50% 110%, rgba(4, 186, 191, 0.08), transparent 60%),
  #060a16;
```

### Typography
- **Sans**: `Geist` (300, 400, 500, 600, 700) — Google Fonts
- **Mono**: `Geist Mono` (400, 500) — used for labels, table data, code, key counts
- **Serif accent**: `Instrument Serif` italic (rare flourish)
- **Sizes**: 9–11px (mono labels), 11–12.5px (body small), 13–14.5px (body), 17–20px (section titles), 24–32px (display numbers)
- **Tracking**: `-.02em` on display, `+.14–.18em` uppercase on mono labels
- **Feature settings**: `"ss01","cv11"` enabled on Geist

### Radii
- Cards: `20px` (`--radius`)
- Inputs / small surfaces: `12px` (`--radius-sm`)
- Pills / chips: `999px`
- Inner ornaments: `6–10px`

### Shadows / glow
- Card base: `0 30px 60px -30px rgba(0,0,0,.6)` + `inset 0 1px 0 rgba(255,255,255,.02)`
- Primary button: `0 8px 30px -10px rgba(4,186,191,.6), inset 0 1px 0 rgba(255,255,255,.25)`
- Glowing dot/border: `0 0 8px var(--accent)`
- Active sidebar item: `inset 0 0 0 1px rgba(4,186,191,.25), 0 0 18px -8px rgba(4,186,191,.6)`

### Glassmorphism
```css
background: linear-gradient(180deg, rgba(14, 46, 46, 0.35), rgba(9, 14, 28, 0.55));
border: 1px solid var(--line);
border-radius: 20px;
backdrop-filter: blur(18px) saturate(120%);
```
Optional `glow-border` gradient mask adds a top-left → bottom-right cyan rim.

### Spacing scale
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 px — used loosely; cards typically pad 18–22px.

### Layout
- App grid: `248px sidebar | 1fr main`
- Content max width: `1500px`, padding `24px 28px 80px`
- Sidebar collapses below 900px viewport (mobile design TBD if needed)

---

## Screens / Views

### 1. Dashboard (home)
**Purpose:** At-a-glance health for the workspace.
**Layout:**
- 4-column stat row (Organic traffic, Keywords ranking, Avg. SEO score, Indexed pages) — each is a `StatCard` with mono label, big number, delta chip, sparkline
- Two-column row: 2/3 area chart (Organic traffic) with tab group (7d/30d/90d/1y) and three sub-stats (Impressions, Avg CTR, Avg position) + 1/3 SEO score panel with `RadialScore` and 4 progress bars
- Two-column row: Keyword rankings table (1.4fr) with sparkline column + Recent blog posts list (1fr) with circular score gauges
- Three-column row: Indexing status (radial + legend), Publishing cadence heatmap, Traffic by region (world dot map + bars)

### 2. Pages
Table of 142 pages: path (mono), title, status pill, SEO score bar, 30d views (mono), updated, action icons (eye / edit / more).

### 3. Blogs
- Tab group: All / Published / Drafts / In review / Scheduled (with counts)
- Featured AI brief generator card (full-width, two-column with input + animated rings on right)
- Card grid (auto-fill, min 330px): each card has a colored gradient header, status chip, SEO score badge, category mono label, title, author/date/views row

### 4. Blog Editor
- Left: large editor card with toolbar (H1, H2, bold/italic/underline, list, quote, link, image, code, AI rewrite), title input (32px, transparent), metadata row, rich content area with inline keyword highlight + AI suggestion callout
- Right rail (sticky): SEO score radial + issue list (✓/✕ rows), Metadata form (slug, meta description with counter, primary keyword chips), Cancel/Publish buttons

### 5. SEO Analytics
- 4 stat cards (Clicks, Impressions, Avg CTR, Avg position)
- Large area chart (90 days search performance) with secondary dashed line
- Two-column: Device split (stacked bar + 3 stat tiles) + Traffic sources bar chart
- Top pages table with mono path, clicks, impressions, CTR (accent color), position, 30d sparkline

### 6. Keywords
- 4 stat cards (Tracked, Top 3 positions, Avg position, Opportunities)
- Table with: keyword, intent chip, position pill (cyan if top 3, red if >10), Δ 30d colored, volume, difficulty bar (green<40, yellow<70, red), action menu
- Header: search input, intent filter, Add keyword primary button

### 7. Media Library
- Filter tabs (All / Images / Videos / Documents / SVG), search, sort, Upload primary button
- Drop zone strip with usage indicator (4.2 / 50 GB)
- Grid (auto-fill min 180px): aspect 4:3 thumbnails with type chip overlay, name, size

### 8. Media Upload Modal
Full-viewport overlay (`rgba(3,6,14,0.65)` + `backdrop-filter: blur(8px)`) with centered glass panel:
- Header with mono eyebrow + title + close button
- Dashed teal drop zone with upload icon
- File list with progress bars (gradient teal, animated), check on done
- Footer: auto-optimize note + Cancel / Insert buttons

### 9. Redirects
- 3 stat cards (Active, Hits this month, Broken links)
- Inline add-redirect form: from / arrow / to / code select / Add button
- Table: from (mono), to (accent mono), code chip, hits (mono), last, delete

### 10. Sitemap
Two-column:
- Left: Tree view of site structure (indented mono lines, [slug] templates) with URL count chips
- Right: Status panel (1,284 URLs total, status dots for submitted/indexed/pending) + Resubmit button + Feed list (sitemap.xml, sitemap-pages.xml, sitemap-blog.xml, rss.xml)

### 11. Users
- 4 stat cards (Total seats 12/25, Active today, Pending invites, Roles)
- Table: avatar circle (initials, gradient), name + email mono, role chip, status with colored dot, last active, more menu

### 12. Settings
- General: workspace name, slug, primary domain, time zone (2x2 grid)
- Integrations: 6 connected service cards (Google Search Console, GA4, Ahrefs, Slack, Zapier, Webhooks) with status pills
- Danger zone: delete workspace card with red-tinted border

### 13. SEO Settings (`seo-settings`)
Two-column:
- Left: Default metadata form (title template, meta description, canonical domain, language), Indexing & crawlers toggles (4 options), robots.txt code preview block
- Right (sticky): SERP preview (white card mimicking Google result) + Open Graph card preview

---

## Reusable Components

| Component | Source | Notes |
|---|---|---|
| `Sidebar` | `src/shell.jsx` | Brand mark, workspace switcher, nav with counts, AI helper card, user footer |
| `TopBar` | `src/shell.jsx` | Sticky, breadcrumb (mono caps), title, subtitle, search (⌘K), bell with dot, primary CTA |
| `Card` / `StatCard` | `src/views.jsx` | Glass card; StatCard has mono label, value, delta chip, optional sparkline |
| `AreaChart` | `src/charts.jsx` | Smooth Catmull-Rom path + gradient fill + glow filter, optional dashed secondary |
| `BarChart` | `src/charts.jsx` | Vertical bars with gradient fill, optional labels |
| `RadialScore` | `src/charts.jsx` | Circular progress with rotating gradient stroke + drop-shadow glow |
| `Sparkline` | `src/charts.jsx` | Mini area chart for table rows / cards |
| `StackedBar` | `src/charts.jsx` | Horizontal segmented bar |
| `Heatmap` | `src/charts.jsx` | Github-style activity grid |
| `WorldDots` | `src/charts.jsx` | Stylized dot world map with hot regions |
| `TweaksPanel` (`useTweaks`) | `tweaks-panel.jsx` | Floating live-control panel — prototype only, drop in production |

### Status / utility classes (in HTML `<style>`)
- `.glass`, `.glow-border` — card chrome
- `.chip` (+ `.good`, `.warn`, `.bad`) — pill labels
- `.dot` (+ same modifiers) — status dots with glow
- `.btn` (+ `.primary`, `.ghost`, `.icon`) — buttons
- `.input` — form inputs with focus glow
- `.toggle` (+ `.on`) — switch
- `.mono`, `.serif` — type families
- `.fade-in`, `.shimmer`, `@keyframes spin/float/pulseGlow/drawLine` — animations

---

## Interactions & Behavior

- **Sidebar nav**: click a section → switches `route` state. Editor counts as `blogs` in sidebar highlight.
- **Top search**: `⌘K` keyboard hint shown; not wired in prototype — implement with cmdk or custom
- **New content**: primary CTA in topbar — opens new post editor (in prototype, navigates to editor with empty post)
- **Blog card click**: opens editor for that post
- **Editor**: title is editable input, content area is hardcoded preview; in production wire to `tiptap` or `lexical`. Toolbar buttons are visual-only in prototype.
- **AI suggestion callout** (in editor): Insert / Dismiss buttons
- **Media drop zone & upload button**: opens `MediaModal`. Modal has fake progress animation (250ms tick, +4% per tick).
- **Toggles**: click flips state and updates persistence (in prototype, just local state).
- **Redirects inline form**: Add button (no validation in prototype).
- **Tabs (Blogs filter, Analytics range)**: standard segmented control behavior.
- **Tweaks panel**: persistence via `__edit_mode_set_keys` postMessage — prototype-only host plumbing, **omit from production**.

### Animations
- `fadeIn` on view mount: 6px translateY → 0, opacity 0 → 1, 0.35s ease
- Card hover (blog card grid): translateY -2px, border accent
- Radial score: `transition: stroke-dashoffset 1s ease`
- Heatmap, donut, stacked bar: width transitions 0.8s ease
- AI rings (Blogs hero): `@keyframes spin` 20–40s linear infinite
- Sidebar item: 0.15s background + color transition
- Primary button hover: `filter: brightness(1.08)` + translateY(-1px)

---

## State Management
| Key | Where | Purpose |
|---|---|---|
| `route` | App | Current view (`dashboard`, `pages`, `blogs`, `editor`, `analytics`, `keywords`, `media`, `redirects`, `sitemap`, `users`, `settings`, `seo-settings`) |
| `editingPost` | App | Post being edited (or null for new) |
| `showMediaModal` | App | Modal open state |
| `tab` | DashboardView | Time range tab (7d/30d/90d/1y) |
| `filter` | BlogsView | Status tab filter |
| `title`, `score` | EditorView | Editor inputs |
| `files` | MediaModal | Upload progress simulation |
| `robots`, `og`, `schema` | SeoSettingsView | Toggle states |

In production, replace with TanStack Query + Zustand / Redux for server state + UI state. Routes should map to URLs (`/dashboard`, `/blogs/:id/edit`, etc.).

---

## Assets
- `assets/spay-logo.jpeg` — brand mark (used in sidebar at 34×34, rounded 10px, with cyan glow ring)
- All icons are inline SVG in `src/icons.jsx`. Use `lucide-react` for ~95% drop-in replacements (search, bell, plus, trend-up/down, check, x, chevron-down/right, more-horizontal, eye, edit, trash, globe, link, upload, image, filter, calendar, menu, bold, italic, underline, list, quote, code, log-out, sparkles, arrow-left/right). Custom: `dashboard`, `pages`, `blogs`, `analytics`, `keywords`, `media`, `redirects`, `sitemap`, `users`, `settings` — all are simple stroke icons; reproduce or pick lucide equivalents (`layout-dashboard`, `file-text`, `notebook-pen`, `bar-chart-3`, `search`, `image`, `arrow-right-left`, `network`, `users`, `settings`).
- Fonts: Geist + Geist Mono + Instrument Serif from Google Fonts.

---

## Files in this handoff
- `Spay Dashboard.html` — entry HTML with all CSS tokens, font imports, script wiring
- `src/icons.jsx` — icon component
- `src/charts.jsx` — chart primitives
- `src/shell.jsx` — Sidebar, TopBar, SectionHeader
- `src/views.jsx` — DashboardView + Card / StatCard
- `src/views2.jsx` — BlogsView, EditorView, AnalyticsView, KeywordsView
- `src/views3.jsx` — MediaView, MediaModal, PagesView, SeoSettingsView, RedirectsView, SitemapView, UsersView, SettingsView
- `src/app.jsx` — routing, tweaks wiring, root render
- `tweaks-panel.jsx` — prototype tweak controls (omit from production)
- `assets/spay-logo.jpeg` — logo

---

## Recommended production stack
- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — port the tokens above into `tailwind.config.ts` (theme.colors / spacing / borderRadius / fontFamily)
- **lucide-react** for icons
- **TanStack Router** or React Router v6
- **TanStack Query** for SEO/analytics API calls
- **tiptap** or **lexical** for the blog editor
- **recharts** or keep the custom SVG charts
- **cmdk** for ⌘K palette
- **Radix UI** primitives for menus, toggles, tabs, dialog (modal)

When implementing, treat each `*.jsx` view as a route component. Move shared bits (Card, StatCard, chip/dot/btn classes) into a `components/ui/` folder. Convert global `<style>` tokens into a `globals.css` + Tailwind theme. Replace `window.X` exports with proper ES module imports.
