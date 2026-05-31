import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export type JwtPayload = { sub: string; email: string; role: string };

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized('Auth token missing');

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    }
    next();
  } catch {
    next(); // ignore — public endpoint
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.spay_token) return req.cookies.spay_token as string;
  return null;
}
