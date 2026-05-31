import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

let connectPromise: Promise<typeof mongoose | null> | null = null;

/**
 * Connect to MongoDB.
 * Never rejects — on failure, logs and resolves to `null` so the server can
 * still boot (handy when the DB URI isn't set yet during local dev).
 */
export function connectDB(): Promise<typeof mongoose | null> {
  if (connectPromise) return connectPromise;

  connectPromise = mongoose
    .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8_000 })
    .then((m) => {
      logger.info(`[mongo] connected to ${redact(env.MONGODB_URI)}`);
      return m;
    })
    .catch((err: Error) => {
      logger.warn(`[mongo] connection failed: ${err.message}`);
      logger.warn('[mongo] server will start without DB. Set MONGODB_URI in .env to enable persistence.');
      connectPromise = null;
      return null;
    });

  mongoose.connection.on('disconnected', () => {
    logger.warn('[mongo] disconnected');
    connectPromise = null;
  });
  mongoose.connection.on('reconnected', () => {
    logger.info('[mongo] reconnected');
  });

  return connectPromise;
}

function redact(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}
