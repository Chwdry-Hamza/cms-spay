/**
 * Removes CMS pages that don't correspond to actual routes on spay-website.
 * Keeps only the four legal/info pages:
 *   /about, /card-terms, /privacy-policy, /prohibited-activities
 *
 * Run once with:  npm run cleanup
 */
import mongoose from 'mongoose';
import { connectDB } from '../db/connection';
import { Page } from '../models/Page';
import { logger } from '../utils/logger';

const KEEP_SLUGS = ['/', '/about', '/card-terms', '/privacy-policy', '/prohibited-activities'];

async function main() {
  await connectDB();

  const result = await Page.deleteMany({ slug: { $nin: KEEP_SLUGS } });
  logger.info(`[cleanup] removed ${result.deletedCount} demo pages`);

  const remaining = await Page.find({}, { slug: 1, title: 1, status: 1 }).lean();
  logger.info(`[cleanup] ${remaining.length} pages remain:`);
  for (const p of remaining) {
    logger.info(`  ${p.slug.padEnd(30)} ${p.title.padEnd(28)} [${p.status}]`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error('[cleanup] failed', err);
  process.exit(1);
});
