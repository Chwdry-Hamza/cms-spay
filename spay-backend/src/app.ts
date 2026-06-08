import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import { pageRoutes } from './routes/pages.routes';
import { postRoutes } from './routes/posts.routes';
import { categoryRoutes } from './routes/categories.routes';
import { mediaRoutes } from './routes/media.routes';
import { redirectRoutes } from './routes/redirects.routes';
import { log404Routes } from './routes/logs404.routes';
import { settingRoutes } from './routes/settings.routes';
import { statsRoutes } from './routes/stats.routes';
import { publicRoutes } from './routes/public.routes';
import { revisionRoutes } from './routes/revisions.routes';
import { incomingLinksRoutes } from './routes/incoming-links.routes';

export function createApp(): Express {
  const app = express();

  // ─── Security & infra ─────────────────────────────────────────
  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image hotlinking
    })
  );
  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = [env.CMS_ORIGIN, env.WEBSITE_ORIGIN];
        if (!origin || allowed.includes(origin)) return cb(null, true);
        cb(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(cookieParser());
  // strict:false so top-level JSON primitives (e.g. the `robots` setting, a
  // plain string) are accepted — strict mode only allows objects/arrays.
  app.use(express.json({ limit: '2mb', strict: false }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.IS_PROD ? 'combined' : 'dev'));

  // global rate limit (login route adds tighter limits)
  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      limit: 600,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    })
  );

  // ─── Routes ───────────────────────────────────────────────────
  app.use('/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/pages', pageRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/redirects', redirectRoutes);
  app.use('/api/logs-404', log404Routes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/revisions', revisionRoutes);
  app.use('/api/incoming-links', incomingLinksRoutes);

  // Public endpoints — for the website to query published content without auth
  app.use('/api/public', publicRoutes);

  // ─── 404 + error ──────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
