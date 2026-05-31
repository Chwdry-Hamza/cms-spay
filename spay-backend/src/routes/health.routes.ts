import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'spay-backend',
    env: env.NODE_ENV,
    db: {
      state: mongoose.STATES[mongoose.connection.readyState],
      ready: mongoose.connection.readyState === 1,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
