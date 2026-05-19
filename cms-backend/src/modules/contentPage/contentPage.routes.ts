import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import * as ctl from './contentPage.controller';
import {
  ContentSlugParam,
  ContentSlugWithRevParam,
  CreateContentPageBody,
  SchedulePublishBody,
  UpdateContentPageBody,
} from './contentPage.schemas';

const r = Router();

r.get('/', asyncHandler(ctl.list));
r.post('/', validate(CreateContentPageBody), asyncHandler(ctl.create));
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

export default r;
