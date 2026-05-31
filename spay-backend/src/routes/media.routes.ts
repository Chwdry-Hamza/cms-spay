import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

import { Media } from '../models/Media';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { Setting } from '../models/Setting';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export const mediaRoutes = Router();

// Multer — in-memory (we run sharp before writing to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

function detectKind(mime: string): 'image' | 'video' | 'document' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
}

function safeName(original: string): string {
  return original
    .replace(/[^a-zA-Z0-9_.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
}

mediaRoutes.use(authRequired);

/** GET /api/media — list */
mediaRoutes.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const type = String(req.query.type ?? '').trim();
    const filter: any = {};
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { alt: new RegExp(q, 'i') }];
    if (type) filter.type = { $in: type.split(',') };

    const items = await Media.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ items, total: items.length });
  })
);

/**
 * POST /api/media/upload
 * Multipart with one or many `files`. Returns the created Media docs.
 */
mediaRoutes.post(
  '/upload',
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) throw ApiError.badRequest('No files uploaded');

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const created = [];
    for (const file of files) {
      const id = crypto.randomBytes(8).toString('hex');
      const ext = (path.extname(file.originalname) || '.bin').toLowerCase();
      const base = safeName(path.basename(file.originalname, ext));
      const stored = `${base}-${id}${ext}`;
      const storedPath = path.join(UPLOAD_DIR, stored);
      const kind = detectKind(file.mimetype);

      let width: number | undefined;
      let height: number | undefined;
      let variants: Record<string, string> = {};
      let isWebP = file.mimetype === 'image/webp';

      if (kind === 'image' && file.mimetype !== 'image/gif' && file.mimetype !== 'image/svg+xml') {
        try {
          const img = sharp(file.buffer);
          const meta = await img.metadata();
          width = meta.width;
          height = meta.height;
          await fs.writeFile(storedPath, file.buffer);

          // also write a webp variant alongside
          if (!isWebP) {
            const webpName = `${base}-${id}.webp`;
            await sharp(file.buffer).webp({ quality: 82 }).toFile(path.join(UPLOAD_DIR, webpName));
            variants.webp = `${env.PUBLIC_URL}/uploads/${webpName}`;
          }
          // thumbnail
          const thumbName = `${base}-${id}-thumb.webp`;
          await sharp(file.buffer).resize(400, 400, { fit: 'cover' }).webp({ quality: 78 })
            .toFile(path.join(UPLOAD_DIR, thumbName));
          variants.thumbnail = `${env.PUBLIC_URL}/uploads/${thumbName}`;
        } catch (err) {
          logger.warn('[media] sharp failed; saving raw', err);
          await fs.writeFile(storedPath, file.buffer);
        }
      } else {
        await fs.writeFile(storedPath, file.buffer);
      }

      const doc = await Media.create({
        name:     file.originalname,
        filename: stored,
        url:      `${env.PUBLIC_URL}/uploads/${stored}`,
        type:     kind,
        mime:     file.mimetype,
        size:     file.size,
        width,
        height,
        alt:      '',
        isWebP,
        variants,
      });
      created.push(doc);
    }
    res.status(201).json({ items: created });
  })
);

/** PATCH /api/media/:id — edit alt, name */
mediaRoutes.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'alt'] as const;
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];

    const media = await Media.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!media) throw ApiError.notFound('Media not found');
    res.json(media);
  })
);

/**
 * GET /api/media/:id/usage
 *
 * Returns every page/post that references this media item — used so editors
 * can see "Used by N pages" before deleting and avoid silent broken images.
 *
 * Reference paths checked:
 *   - featuredImage (page) — ObjectId ref
 *   - coverMedia / cover (post) — ObjectId ref + legacy URL field
 */
mediaRoutes.get(
  '/:id/usage',
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id).lean();
    if (!media) throw ApiError.notFound('Media not found');

    const id = media._id;
    const url = media.url;
    type Ref = { type: 'page' | 'post'; id: string; title: string; slug: string; via: 'featured' | 'cover' };
    const refs: Ref[] = [];

    const [pages, posts] = await Promise.all([
      Page.find({}).select('title slug featuredImage').lean(),
      Post.find({}).select('title slug coverMedia cover').lean(),
    ]);

    for (const p of pages) {
      if ((p as any).featuredImage && String((p as any).featuredImage) === String(id)) {
        refs.push({ type: 'page', id: String(p._id), title: p.title, slug: p.slug, via: 'featured' });
      }
    }
    for (const p of posts) {
      const coverMatches = (p as any).coverMedia && String((p as any).coverMedia) === String(id);
      const legacyCoverMatches = typeof (p as any).cover === 'string' && (p as any).cover && (p as any).cover === url;
      if (coverMatches || legacyCoverMatches) {
        refs.push({ type: 'post', id: String(p._id), title: p.title, slug: p.slug, via: 'cover' });
      }
    }

    res.json({ total: refs.length, items: refs });
  })
);

/** DELETE /api/media/:id */
mediaRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) throw ApiError.notFound('Media not found');

    // best-effort remove files (raw + variants)
    const targets: string[] = [media.filename];
    for (const v of Object.values(media.variants ?? {})) {
      if (typeof v === 'string') {
        const name = path.basename(new URL(v).pathname);
        targets.push(name);
      }
    }
    for (const f of targets) {
      try {
        await fs.unlink(path.join(UPLOAD_DIR, f));
      } catch {
        /* ignore */
      }
    }
    res.json({ ok: true });
  })
);
