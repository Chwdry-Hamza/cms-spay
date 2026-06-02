import { Router } from 'express';
import multer from 'multer';
import type { UploadApiResponse } from 'cloudinary';

import { cloudinary } from '../config/cloudinary';
import { Media } from '../models/Media';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export const mediaRoutes = Router();

// Multer — in-memory only; the buffer is streamed straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

type Kind = 'image' | 'video' | 'document';

function detectKind(mime: string): Kind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
}

/** Cloudinary resource_type for a given media kind. */
function resourceTypeFor(kind: Kind): 'image' | 'video' | 'raw' {
  if (kind === 'image') return 'image';
  if (kind === 'video') return 'video';
  return 'raw';
}

/** Stream an in-memory file buffer to Cloudinary. */
function uploadBuffer(buffer: Buffer, kind: Kind): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'spay',
        resource_type: resourceTypeFor(kind),
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err || !result) {
          reject(err ?? new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
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
 * Multipart with one or many `files`. Each file is uploaded to Cloudinary and
 * a Media doc is created storing the secure URL + public_id. Returns the docs.
 */
mediaRoutes.post(
  '/upload',
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) throw ApiError.badRequest('No files uploaded');

    const created = [];
    for (const file of files) {
      const kind = detectKind(file.mimetype);
      const result = await uploadBuffer(file.buffer, kind);

      // For images, Cloudinary derives these on the fly from the same asset —
      // no separate files stored. f_auto/q_auto = best format + quality.
      const variants: Record<string, string> = {};
      if (kind === 'image') {
        variants.webp = cloudinary.url(result.public_id, {
          resource_type: 'image',
          secure: true,
          fetch_format: 'auto',
          quality: 'auto',
        });
        variants.thumbnail = cloudinary.url(result.public_id, {
          resource_type: 'image',
          secure: true,
          width: 400,
          height: 400,
          crop: 'fill',
          fetch_format: 'auto',
          quality: 'auto',
        });
      }

      const doc = await Media.create({
        name:     file.originalname,
        filename: result.public_id, // Cloudinary public_id — used for deletion
        url:      result.secure_url,
        type:     kind,
        mime:     file.mimetype,
        size:     result.bytes ?? file.size,
        width:    result.width,
        height:   result.height,
        alt:      '',
        isWebP:   (result.format ?? '').toLowerCase() === 'webp',
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

/** DELETE /api/media/:id — removes the doc and the Cloudinary asset. */
mediaRoutes.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) throw ApiError.notFound('Media not found');

    // Best-effort remove from Cloudinary (filename holds the public_id).
    try {
      await cloudinary.uploader.destroy(media.filename, {
        resource_type: resourceTypeFor(media.type as Kind),
      });
    } catch (err) {
      logger.warn('[media] cloudinary destroy failed', err);
    }

    res.json({ ok: true });
  })
);
