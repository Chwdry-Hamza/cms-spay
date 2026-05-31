# What This System Is (Plain English)

This repo is a **custom CMS (Content Management System) for the Spay.finance website**.
You built your own admin panel + backend + public website instead of using WordPress
or Webflow. It has three pieces that work together:

```
[cms]            ->  [cms-backend]   ->   [spay-website]
admin panel          API + database        the live public site
(what YOU use)       (stores everything)   (what your visitors see)
```

- **`cms/`** — the admin dashboard. Next.js app. This is the UI you log into to
  edit pages. Lives at something like `admin.spay.finance`.
- **`cms-backend/`** — an Express API + MongoDB. It stores all pages, content,
  revisions, redirects, etc. The admin panel talks to it, and so does the public
  website.
- **`spay-website/`** — the public marketing site at spay.finance. It reads
  published content from `cms-backend` and renders it for the world.

---

## The Two CMSes Inside (this is the important part)

Your system has **two completely separate CMS tools** in the same admin panel.
They look similar but they exist for different reasons. Do not get them confused.

### 1. The **Builder** — for marketing landing pages

- **Where in admin:** sidebar -> "Landing Page Builder"
- **What it edits:** the big visual pages like the homepage, /payment,
  /currencies, /crypto, etc. — the pages that need to look pixel-perfect.
- **How it works:** you drag pre-built "sections" (Hero, Features, Currencies,
  Payment, Crypto, Footer, ...) onto a page. Each section is a real React
  component that's already styled. You don't write content as a wall of text —
  you fill in fields (headline, image, button link) and the section renders.
- **Who it's for:** the marketing team. They care about layout and design.
- **Backend folder:** `cms-backend/src/modules/builder/`
- **Frontend file:** `cms/src/views/BuilderView.tsx`

### 2. **Pages (ContentPage)** — for SEO articles, blog posts, docs

- **Where in admin:** sidebar -> "Pages"
- **What it edits:** the long-form content pages — blog posts, service pages,
  location pages, docs. The kind of pages built for Google search.
- **How it works:** a block editor. You add blocks (paragraph, heading, list,
  table, note, divider) and type into them. Supports inline `**bold**` and
  `[link](/url)` markdown. Has tags, internal-link picker, backlinks ("which
  other pages link to this one?"), and related-by-tag pages.
- **Who it's for:** the SEO / content team. They care about keywords, internal
  linking, and freshness.
- **Backend folder:** `cms-backend/src/modules/contentPage/`
- **Frontend file:** `cms/src/views/ContentPageEditorView.tsx`

**Why two?** Marketing landing pages and SEO articles are different jobs. A
hand-crafted homepage shouldn't be authored in a generic block editor, and a
1,500-word service article shouldn't be authored by dragging pre-built sections.
Both stay. Don't delete one.

---

## What Features You Have

Both CMSes share these features (each built into its own module):

- **Draft / Publish split** — you edit a draft, the public site only sees the
  published version until you hit Publish.
- **Scheduled publishing** — set a future time, a cron-style scheduler
  (`scheduler.ts`) publishes it automatically.
- **Revision history** — every save creates a revision; you can restore any
  past version. ContentPage caps at 50 revisions per page.
- **Slug rename + auto-redirect** — if you change a page's URL, the system
  automatically creates a 308 redirect from the old URL so Google doesn't lose
  it. The Redirects admin page lets you manage these by hand too.
- **Preview** — see what an unpublished draft will look like before publishing.

ContentPage also has:
- **Internal link picker modal** — when writing, pick another internal page
  from a list instead of typing the URL.
- **Bulk link rewrite** — if you rename a page, the system can rewrite every
  inbound link in other pages.
- **Backlinks panel** — "which other pages link to this one?"
- **Related pages by tag** — for the public site's "see also" lists.
- **Autosave** with debounced coalescing.

Other admin sections in the sidebar:

| Sidebar item | What it does |
|---|---|
| Dashboard | Landing screen with stats |
| Landing Page Builder | The Builder (above) |
| Pages | ContentPage editor (above) |
| Sections | Library of available Builder sections |
| Media Library | Uploaded images |
| SEO Settings | Global SEO defaults |
| Redirects | Manage URL redirects (the 308s above) |
| Analytics | Site analytics |
| Users | Admin users |
| Settings | App settings |

---

## How a Visitor Request Flows

When someone visits a page on spay.finance:

1. `spay-website` (Next.js) gets the request for, say, `/payment`.
2. It calls the backend at `GET /api/v1/public/page/payment` (Builder pages) or
   `GET /api/v1/public/content-page/some-article` (SEO pages).
3. `cms-backend` returns the **published** version (never the draft) with a
   5-minute cache header.
4. If the slug doesn't exist, `spay-website` checks
   `GET /api/v1/public/redirect/:slug` — if there's a redirect row, it issues a
   308 to the new URL so old links still work.
5. The website renders the page and ships it to the visitor.

The admin panel (`cms`) talks to the same backend but uses the
`/api/v1/builder/...` and `/api/v1/content-pages/...` routes, which include
drafts, revisions, publish controls, etc.

---

## Where Things Live (cheat sheet)

```
cms-backend/src/
  app.ts                              # Express app, route wiring
  models/
    Page.ts                           # Builder pages (sections + draft/published)
    PageRevision.ts                   # Builder revision history
    ContentPage.ts                    # ContentPage articles
    ContentPageRevision.ts            # ContentPage revision history
    Redirect.ts                       # Slug -> new URL redirects
  modules/
    auth/                             # Login / sessions (new)
    builder/                          # Builder CRUD, publish, revisions, sections
    contentPage/                      # ContentPage CRUD, publish, tags, links
    publicPage/                       # Read-only API the public website uses
    redirect/                         # Redirect admin CRUD
    preview/                          # Draft preview tokens

cms/src/
  app/                                # Next.js routes (URLs of the admin)
    login/                            # Login screen (new)
  views/                              # Each admin screen
    BuilderView.tsx                   # The Builder editor
    ContentPageEditorView.tsx         # The ContentPage editor
    ContentPagesView.tsx              # ContentPage list
    SectionsView.tsx, MediaView.tsx, RedirectsView.tsx, ...
  components/
    Sidebar.tsx                       # The left nav
    LinkPickerModal.tsx               # Internal link picker (ContentPage)
    DeleteWithRedirectModal.tsx       # "Delete + leave a redirect behind"
    SlugRenameConfirmModal.tsx        # "Rename slug + auto-redirect" confirm
  lib/
    auth.ts                           # Client-side auth helpers (new)
    builder-api.ts                    # API client for the Builder
    content-pages-api.ts              # API client for ContentPage

spay-website/                         # The public site (separate Next.js app)
```

---

## TL;DR

You built a CMS so the spay.finance website doesn't need a developer for every copy
change. The admin (`cms`) is where you edit. The backend (`cms-backend`) stores
everything in MongoDB and serves the public website. The public site
(`spay-website`) reads published content and renders it. Inside the admin there
are two separate editors: **Builder** for designed landing pages, **Pages** for
SEO articles. Both have drafts, publishing, scheduling, revisions, and redirect
handling. That's the whole system.
