import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { HttpError } from '../utils/errors';
import { logger } from '../config/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as Request & { requestId?: string }).requestId;

  if (err instanceof HttpError) {
    res.status(err.status).json({
      ok: false,
      error: { code: err.code, message: err.message, details: err.details },
      requestId,
    });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const details = Object.entries(err.errors).map(([path, e]) => ({
      path,
      message: e.message,
    }));
    res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details },
      requestId,
    });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({
      ok: false,
      error: { code: 'INVALID_ID', message: `Invalid ${err.path}: ${String(err.value)}` },
      requestId,
    });
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');
  res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    requestId,
  });
}
