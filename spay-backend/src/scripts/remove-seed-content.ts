/**
 * One-shot cleanup: deletes ONLY the posts + categories that were created by
 * the original `seed` script. Anything you created in the CMS (any slug not in
 * these lists) is left untouched.
 *
 *   npm run remove-seed-content
 */
import mongoose from 'mongoose';
import { connectDB } from '../db/connection';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { logger } from '../utils/logger';

const SEED_POST_SLUGS = [
  'why-we-built-spay',
  'stablecoins-at-checkout',
  'a-quiet-rebrand',
  'compliance-without-the-wall',
  'earning-idle-balances',
  'designing-for-trust',
  'cross-border-in-seconds',
  'what-we-dont-allow',
];

const SEED_CATEGORY_SLUGS = [
  'company',
  'crypto',
  'product',
  'design',
  'engineering',
  'compliance',
];

async function run() {
  await connectDB();

  const postRes = await Post.deleteMany({ slug: { $in: SEED_POST_SLUGS } });
  logger.info(`[remove-seed-content] deleted ${postRes.deletedCount} seeded posts`);

  // Don't delete a category that the user has since re-used: only drop it when
  // no posts reference it any more.
  let removedCats = 0;
  for (const slug of SEED_CATEGORY_SLUGS) {
    const cat = await Category.findOne({ slug });
    if (!cat) continue;
    const refCount = await Post.countDocuments({ category: cat._id });
    if (refCount > 0) {
      logger.info(`[remove-seed-content] keeping category "${slug}" — still used by ${refCount} post(s)`);
      // Also reset postCount so the UI is accurate
      await Category.findByIdAndUpdate(cat._id, { $set: { postCount: refCount } });
      continue;
    }
    await Category.findByIdAndDelete(cat._id);
    removedCats += 1;
  }
  logger.info(`[remove-seed-content] deleted ${removedCats} seeded categories`);

  logger.info('[remove-seed-content] done.');
  await mongoose.disconnect();
}

run().catch((err) => {
  logger.error('[remove-seed-content] failed', err);
  process.exit(1);
});
