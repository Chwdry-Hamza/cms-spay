import { Router } from 'express';

import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { authRequired } from '../middleware/auth.middleware';
import { listRevisions, getRevision, recordRevision } from '../services/revisions.service';
import { triggerContentRevalidate } from '../services/revalidate.service';

export const revisionRoutes = Router();
revisionRoutes.use(authRequired);

/** Fields that should be copied from a snapshot back onto the live document */
const PAGE_RESTORE_FIELDS = ['title', 'slug', 'status', 'template', 'content', 'sections', 'excerpt', 'seo', 'featuredImage'] as const;
const POST_RESTORE_FIELDS = ['title', 'slug', 'status', 'excerpt', 'content', 'cover', 'category', 'categoryName', 'tags', 'readTime', 'seo'] as const;

/** GET /api/revisions/:entityType/:entityId — newest first */
revisionRoutes.get(
  '/:entityType/:entityId',
  asyncHandler(async (req, res) => {
    const entityType = String(req.params.entityType);
    const entityId = String(req.params.entityId);
    if (entityType !== 'page' && entityType !== 'post') throw ApiError.badRequest('Invalid entityType');
    const items = await listRevisions(entityType, entityId, 100);
    // Hide the full snapshot in the list payload (keeps the response small)
    const lite = items.map((r) => ({
      _id: r._id,
      entityType: r.entityType,
      entityId: r.entityId,
      label: r.label,
      authorEmail: r.authorEmail,
      authorName: r.authorName,
      createdAt: r.createdAt,
    }));
    res.json({ items: lite, total: lite.length });
  })
);

/** GET /api/revisions/:id — full snapshot for preview/diff */
revisionRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rev = await getRevision(String(req.params.id));
    if (!rev) throw ApiError.notFound('Revision not found');
    res.json(rev);
  })
);

/** POST /api/revisions/:id/restore — applies the snapshot to the live document */
revisionRoutes.post(
  '/:id/restore',
  asyncHandler(async (req, res) => {
    const rev = await getRevision(String(req.params.id));
    if (!rev) throw ApiError.notFound('Revision not found');
    const { entityType, entityId, snapshot } = rev as any;

    const Model: any = entityType === 'page' ? Page : Post;
    const fields = entityType === 'page' ? PAGE_RESTORE_FIELDS : POST_RESTORE_FIELDS;

    const live = await Model.findById(entityId);
    if (!live) throw ApiError.notFound('Original document no longer exists');

    // Snapshot the CURRENT state so the restore itself is undoable
    const beforeRestore = live.toObject();
    recordRevision({
      entityType,
      entityId: String(live._id),
      snapshot: beforeRestore,
      label: `Restore to revision ${rev._id.toString().slice(-6)}`,
      authorEmail: req.user?.email,
    });

    for (const f of fields) {
      if (f in snapshot) (live as any)[f] = snapshot[f];
    }
    // Mixed fields need an explicit modified flag so nested values persist.
    if ('content' in snapshot) live.markModified('content');
    if ('sections' in snapshot) live.markModified('sections');
    await live.save();

    // Push the change to the live site
    if (entityType === 'page') {
      triggerContentRevalidate(['/', (live as any).slug], 'page');
    } else {
      triggerContentRevalidate(['/blog', `/blog/${(live as any).slug}`], 'post');
    }

    res.json({ ok: true, restored: live.toObject() });
  })
);
