import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { requestId } from './middleware/requestId';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import builderRoutes from './modules/builder/builder.routes';
import contentPageRoutes from './modules/contentPage/contentPage.routes';
import previewRoutes from './modules/preview/preview.routes';
import publicPageRoutes from './modules/publicPage/publicPage.routes';
import redirectRoutes from './modules/redirect/redirect.routes';

export function createApp() {
  const app = express();
   
  // No security middleware yet (intentionally). Permissive CORS for dev.
  app.use(cors({ origin: true, credentials: true }));
  app.use(requestId);
  app.use(pinoHttp({ logger, customProps: (req) => ({ requestId: (req as { requestId?: string }).requestId }) }));
  // Bumped from 1mb to 10mb so inline base64 image uploads from the
  // inspector's ImageSlot can fit (FileReader.readAsDataURL inflates the raw
  // file size by ~33%). Pair this with the inspector's 6 MB pre-upload
  // file-size guard.
  app.use(express.json({ limit: '10mb' }));

  app.get('/healthz', (_req, res) => res.json({ ok: true, data: { status: 'up' } }));
  app.get('/readyz', (_req, res) => res.json({ ok: true, data: { status: 'ready' } }));

  app.use('/api/v1/builder', builderRoutes);
  app.use('/api/v1/content-pages', contentPageRoutes);
  app.use('/api/v1/preview', previewRoutes);
  app.use('/api/v1/public', publicPageRoutes);
  app.use('/api/v1/redirects', redirectRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
