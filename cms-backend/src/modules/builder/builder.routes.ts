import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import * as ctl from './builder.controller';
import {
  AddSectionBody,
  CreatePageBody,
  PatchSectionBody,
  PublishQuery,
  ReorderBody,
  SaveBody,
  SlugParam,
  SlugWithInstance,
  SlugWithRev,
  UpdatePageBody,
} from './builder.schemas';

const r = Router();

// Catalogue
r.get('/catalogue', asyncHandler(ctl.getCatalogue));
r.post('/catalogue/sync', asyncHandler(ctl.syncCatalogue));

// Pages
r.post('/pages', validate(CreatePageBody), asyncHandler(ctl.createPage));
r.get('/pages/:slug', validate(SlugParam, 'params'), asyncHandler(ctl.getPage));
r.patch(
  '/pages/:slug',
  validate(SlugParam, 'params'),
  validate(UpdatePageBody),
  asyncHandler(ctl.updatePage),
);

// Layout
r.post(
  '/pages/:slug/layout/reorder',
  validate(SlugParam, 'params'),
  validate(ReorderBody),
  asyncHandler(ctl.reorder),
);

// Sections
r.post(
  '/pages/:slug/sections',
  validate(SlugParam, 'params'),
  validate(AddSectionBody),
  asyncHandler(ctl.addSection),
);
r.delete(
  '/pages/:slug/sections/:instanceId',
  validate(SlugWithInstance, 'params'),
  asyncHandler(ctl.deleteSection),
);
r.patch(
  '/pages/:slug/sections/:instanceId',
  validate(SlugWithInstance, 'params'),
  validate(PatchSectionBody),
  asyncHandler(ctl.patchSection),
);
r.post(
  '/pages/:slug/sections/:instanceId/duplicate',
  validate(SlugWithInstance, 'params'),
  asyncHandler(ctl.duplicateSection),
);

// Save / Publish / Status
r.post(
  '/pages/:slug/save',
  validate(SlugParam, 'params'),
  validate(SaveBody),
  asyncHandler(ctl.save),
);
r.post(
  '/pages/:slug/publish',
  validate(SlugParam, 'params'),
  validate(PublishQuery, 'query'),
  asyncHandler(ctl.publish),
);
r.post(
  '/pages/:slug/revert-to-published',
  validate(SlugParam, 'params'),
  asyncHandler(ctl.revert),
);
r.post(
  '/pages/:slug/discard-draft',
  validate(SlugParam, 'params'),
  asyncHandler(ctl.discardDraft),
);
r.get('/pages/:slug/status', validate(SlugParam, 'params'), asyncHandler(ctl.status));

// Revisions
r.get('/pages/:slug/revisions', validate(SlugParam, 'params'), asyncHandler(ctl.listRevisions));
r.get(
  '/pages/:slug/revisions/:revId',
  validate(SlugWithRev, 'params'),
  asyncHandler(ctl.getRevision),
);
r.post(
  '/pages/:slug/revisions/:revId/restore',
  validate(SlugWithRev, 'params'),
  asyncHandler(ctl.restoreRevision),
);

// Preview token (stub for now — no JWT)
r.post(
  '/pages/:slug/preview-token',
  validate(SlugParam, 'params'),
  asyncHandler(ctl.previewToken),
);

export default r;
