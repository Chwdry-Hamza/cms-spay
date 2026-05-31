import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: 'Route not found' } });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: 'Validation failed', details: err.flatten() },
    });
  }

  // Mongoose duplicate key
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    return res.status(409).json({
      error: { message: 'Duplicate value', details: err.keyValue },
    });
  }

  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: { message: 'Validation failed', details: err.errors },
    });
  }

  // Our ApiError
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: { message: err.message, details: err.details } });
  }

  // Anything else
  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error('[error]', err);
  return res.status(500).json({
    error: {
      message: env.IS_PROD ? 'Internal server error' : message,
      ...(env.IS_PROD ? {} : { stack: err instanceof Error ? err.stack : undefined }),
    },
  });
}
