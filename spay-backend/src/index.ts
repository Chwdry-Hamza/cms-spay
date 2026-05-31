import { createApp } from './app';
import { connectDB } from './db/connection';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startScheduler, stopScheduler } from './services/scheduler.service';

function bootstrap() {
  // Fire DB connection in parallel — non-blocking. Routes that need it
  // will return a clear error if it didn't connect.
  connectDB().then((m) => {
    if (m) startScheduler(); // only start polling once Mongo is reachable
  });

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`[server] Spay backend running at http://localhost:${env.PORT}`);
    logger.info(`[server] CORS allowed: ${env.CMS_ORIGIN}, ${env.WEBSITE_ORIGIN}`);
  });

  const shutdown = (signal: string) => {
    logger.warn(`[shutdown] received ${signal}, closing…`);
    stopScheduler();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error('[unhandled]', reason));
}

bootstrap();
