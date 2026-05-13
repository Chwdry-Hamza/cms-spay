import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequest } from '../utils/errors';

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: Source = 'body'): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.errors.map((e: ZodError['errors'][number]) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(BadRequest('Invalid input.', 'VALIDATION_ERROR', details));
    }
    // Replace with the parsed (and possibly coerced) data.
    (req as Record<Source, unknown>)[source] = result.data;
    next();
  };
