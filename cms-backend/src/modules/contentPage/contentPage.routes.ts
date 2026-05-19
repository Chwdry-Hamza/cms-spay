import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import * as ctl from './contentPage.controller';
import {
  ContentSlugParam,
  ContentSlugWithRevParam,
  CreateContentPageBody,
  RewriteInternalLinksBody,
  SchedulePublishBody,
  UpdateContentPageBody,
} from './contentPage.schemas';

const r = Router();

r.get('/', asyncHandler(ctl.list));
r.post('/', validate(CreateContentPageBody), asyncHandler(ctl.create));

// Bulk link rewrite — declared BEFORE `/:slug` so Express doesn't try to
// match the literal `internal-link-rewrites` as a slug param.
r.post(
  '/internal-link-rewrites',
  validate(RewriteInternalLinksBody),
  asyncHandler(ctl.rewriteInternalLinks),
);

// Tag autocomplete — same ordering requirement: declared before `/:slug`
// so Express doesn't capture `tags` as a slug param.
r.get('/tags', asyncHandler(ctl.listTags));

r.get('/:slug', validate(ContentSlugParam, 'params'), asyncHandler(ctl.get));
r.patch(
  '/:slug',
  validate(ContentSlugParam, 'params'),
  validate(UpdateContentPageBody),
  asyncHandler(ctl.update),
);
r.delete('/:slug', validate(ContentSlugParam, 'params'), asyncHandler(ctl.remove));
r.post('/:slug/publish', validate(ContentSlugParam, 'params'), asyncHandler(ctl.publish));
r.post('/:slug/discard-draft', validate(ContentSlugParam, 'params'), asyncHandler(ctl.discard));
r.post(
  '/:slug/schedule-publish',
  validate(ContentSlugParam, 'params'),
  validate(SchedulePublishBody),
  asyncHandler(ctl.schedulePublish),
);
r.post(
  '/:slug/cancel-schedule',
  validate(ContentSlugParam, 'params'),
  asyncHandler(ctl.cancelSchedule),
);

r.get(
  '/:slug/revisions',
  validate(ContentSlugParam, 'params'),
  asyncHandler(ctl.listRevisions),
);
r.post(
  '/:slug/revisions/:revId/restore',
  validate(ContentSlugWithRevParam, 'params'),
  asyncHandler(ctl.restoreRevision),
);
r.get(
  '/:slug/backlinks',
  validate(ContentSlugParam, 'params'),
  asyncHandler(ctl.listBacklinks),
);
r.get(
  '/:slug/related',
  validate(ContentSlugParam, 'params'),
  asyncHandler(ctl.listRelated),
);

export default r;
