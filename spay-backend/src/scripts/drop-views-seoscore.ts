/**
 * One-shot cleanup: removes the legacy `views` and `seoScore` fields from every
 * Page and Post document. Both fields were never populated by real code — they
 * only existed as seed-driven stubs — so dropping them is safe.
 *
 *   npm run drop-views-seoscore
 */
import mongoose from 'mongoose';
import { connectDB } from '../db/connection';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { logger } from '../utils/logger';

async function run() {
  await connectDB();
  const unset = { $unset: { views: '', seoScore: '' } };
  const [pageRes, postRes] = await Promise.all([
    Page.collection.updateMany({}, unset),
    Post.collection.updateMany({}, unset),
  ]);
  logger.info(`[drop-views-seoscore] pages updated: ${pageRes.modifiedCount}`);
  logger.info(`[drop-views-seoscore] posts updated: ${postRes.modifiedCount}`);
  logger.info('[drop-views-seoscore] done.');
  await mongoose.disconnect();
}

run().catch((err) => {
  logger.error('[drop-views-seoscore] failed', err);
  process.exit(1);
});
