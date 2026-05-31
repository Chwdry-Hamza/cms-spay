import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { validate } from '../middleware/validate.middleware';
import { authRequired, type JwtPayload } from '../middleware/auth.middleware';
import { User } from '../models/User';

export const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many login attempts. Try again in a minute.' } },
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1).max(200),
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Compares against env ADMIN_EMAIL/ADMIN_PASSWORD_HASH OR a User document in DB.
 */
authRoutes.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    // 1. Try DB user first
    const dbUser = await User.findOne({ email }).select('+passwordHash');

    let userId: string;
    let userName = '';
    let role = 'owner';
    let passwordHash: string;

    if (dbUser) {
      userId = String(dbUser._id);
      userName = dbUser.name ?? '';
      role = dbUser.role ?? 'owner';
      passwordHash = dbUser.passwordHash;
    } else if (email === env.ADMIN_EMAIL.toLowerCase()) {
      // 2. Fallback to env single-user
      userId = 'env-admin';
      userName = 'Admin';
      passwordHash = env.ADMIN_PASSWORD_HASH;
    } else {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');

    const payload: JwtPayload = { sub: userId, email, role };
    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    if (dbUser) {
      dbUser.lastLoginAt = new Date();
      await dbUser.save();
    }

    // Set httpOnly cookie + return token for SPA Bearer use
    res.cookie('spay_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { id: userId, email, name: userName, role },
      token,
    });
  })
);

authRoutes.post('/logout', (_req, res) => {
  res.clearCookie('spay_token');
  res.json({ ok: true });
});

authRoutes.get(
  '/me',
  authRequired,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);
