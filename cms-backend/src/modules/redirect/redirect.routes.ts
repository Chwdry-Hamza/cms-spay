import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import * as ctl from './redirect.controller';
import { CreateRedirectBody, SlugParam, UpdateRedirectBody } from './redirect.schemas';

const r = Router();

r.get('/', asyncHandler(ctl.list));
r.post('/', validate(CreateRedirectBody), asyncHandler(ctl.create));
r.patch('/:slug', validate(SlugParam, 'params'), validate(UpdateRedirectBody), asyncHandler(ctl.update));
r.delete('/:slug', validate(SlugParam, 'params'), asyncHandler(ctl.remove));

export default r;
