/**
 * Deletes ALL pages and ALL blog posts from MongoDB so you can start fresh.
 *
 * Leaves alone:
 *   - categories       (the colour-coded groupings)
 *   - media            (Media docs + their Cloudinary assets)
 *   - redirects        (so links keep working)
 *   - settings         (site SEO defaults, robots.txt, analytics IDs)
 *   - users / auth
 *
 * Run with:  npm run wipe
 */
import mongoose from 'mongoose';
import { connectDB } from '../db/connection';
import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { logger } from '../utils/logger';

async function main() {
  await connectDB();

  const beforePages = await Page.countDocuments();
  const beforePosts = await Post.countDocuments();

  const pageResult = await Page.deleteMany({});
  const postResult = await Post.deleteMany({});

  // Reset category post counts to 0 since every post is gone
  await Category.updateMany({}, { $set: { postCount: 0 } });

  logger.info(`[wipe] pages: deleted ${pageResult.deletedCount} (was ${beforePages})`);
  logger.info(`[wipe] posts: deleted ${postResult.deletedCount} (was ${beforePosts})`);
  logger.info(`[wipe] category post counts reset to 0`);
  logger.info('[wipe] done — pages and posts collections are empty');

  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error('[wipe] failed', err);
  process.exit(1);
});
