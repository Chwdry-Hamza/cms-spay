import { createApp } from './app';
import { connectDb, disconnectDb } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { refreshManifest } from './modules/builder/manifest.service';
import { startScheduler, stopScheduler } from './modules/contentPage/scheduler';

async function main() {
  await connectDb();
  await refreshManifest();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`cms-backend listening on http://localhost:${env.PORT}`);
  });
  startScheduler();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    stopScheduler();
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
