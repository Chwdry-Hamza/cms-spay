# Spay Backend

Express.js + MongoDB + Mongoose API serving:

- `spay-cms` (port 3001) — admin reads/writes (authenticated)
- `spay-website` (port 3000) — public read-only via `/api/public/*`

## Setup

```bash
# 1. Install
npm install

# 2. Create an admin password hash
npm run create-admin -- yourStrongPassword
#    → paste the output into .env as ADMIN_PASSWORD_HASH=...

# 3. Edit .env — at minimum set MONGODB_URI
#    Default placeholder: mongodb://localhost:27017/spay

# 4. (Optional) seed mock content
npm run seed

# 5. Run dev server
npm run dev
# → http://localhost:4000
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET    | `/health`                          | Service + DB status |
| POST   | `/api/auth/login`                  | Returns JWT + sets cookie |
| POST   | `/api/auth/logout`                 | Clears cookie |
| GET    | `/api/auth/me`                     | Current user |
| GET    | `/api/pages`                       | List (auth) |
| POST   | `/api/pages`                       | Create (auth) |
| GET    | `/api/pages/:id`                   | Read (auth) |
| PUT    | `/api/pages/:id`                   | Update (auth) |
| DELETE | `/api/pages/:id`                   | Delete (auth) |
| POST   | `/api/pages/:id/duplicate`         | Duplicate (auth) |
| (same shape for /api/posts and /api/categories) | | |
| GET    | `/api/media`                       | List (auth) |
| POST   | `/api/media/upload`                | Upload multipart `files[]` (auth) |
| PATCH  | `/api/media/:id`                   | Edit alt/name/caption (auth) |
| DELETE | `/api/media/:id`                   | Delete (auth) |
| GET    | `/api/redirects`                   | List (auth) |
| GET    | `/api/redirects/all.json`          | Public — for website middleware |
| POST   | `/api/redirects`                   | Create (auth) |
| POST   | `/api/redirects/hit`               | Increment hit counter |
| POST   | `/api/logs-404/record`             | Public — record a 404 |
| GET    | `/api/logs-404`                    | List (auth) |
| GET    | `/api/settings`                    | All settings (auth) |
| PUT    | `/api/settings/:key`               | Upsert (auth) |
| GET    | `/api/stats`                       | Dashboard numbers (auth) |
| GET    | `/api/public/pages/by-slug/:slug`  | Public — get published page |
| GET    | `/api/public/posts/by-slug/:slug`  | Public — get published post |
| GET    | `/api/public/posts`                | Public — paginate published posts |
| GET    | `/api/public/sitemap`              | Public — slugs for sitemap.xml |
| GET    | `/api/public/settings/:key`        | Public — site-wide settings |

## Auth

Single-user mode by default — the email/hash in `.env` is the only login.
On every write, the JWT is decoded into `req.user`. Bearer header OR `spay_token` cookie both work.

## On-content-change revalidation

After every successful write the backend POSTs to `WEBSITE_REVALIDATE_URL` with the paths that need cache-busting. The website's `/api/revalidate` handler should call `revalidatePath` for each.

## File storage

Local disk under `./uploads/`, served at `${PUBLIC_URL}/uploads/...`. When ready for production, replace `mediaRoutes` upload handler with an S3 / R2 client.
