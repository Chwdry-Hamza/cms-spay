/**
 * One-off migration: rewrite the old `@leo.finance` domain to `@spay.finance`
 * in existing database records that code edits can't reach.
 *
 *   - User.email      (the admin login address)
 *   - Post.authorName (shown as the byline on the public blog)
 *
 * Idempotent — re-running after the swap is a no-op.
 *
 *   npm run rename-domain
 */
import { connectDB } from '../db/connection';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const OLD = '@leo.finance';
const NEW = '@spay.finance';

async function run() {
  await connectDB();
  logger.info('[rename-domain] starting…');

  // Log what will change first, for an auditable record.
  const userEmails = await User.find(
    { email: { $regex: '@leo\\.finance$', $options: 'i' } },
    { email: 1 },
  ).lean();
  const postAuthors = await Post.find(
    { authorName: { $regex: '@leo\\.finance', $options: 'i' } },
    { slug: 1, authorName: 1 },
  ).lean();
  for (const u of userEmails) logger.info(`[rename-domain] user ${u.email} -> ${u.email.replace(OLD, NEW)}`);
  for (const p of postAuthors) logger.info(`[rename-domain] post "${p.slug}" author ${p.authorName} -> ${(p.authorName ?? '').replace(OLD, NEW)}`);

  // Targeted field updates via aggregation pipeline — no full-document
  // re-validation, so unrelated schema defaults are left untouched.
  const userRes = await User.updateMany(
    { email: { $regex: '@leo\\.finance$', $options: 'i' } },
    [{ $set: { email: { $replaceAll: { input: '$email', find: OLD, replacement: NEW } } } }],
  );
  const postRes = await Post.updateMany(
    { authorName: { $regex: '@leo\\.finance', $options: 'i' } },
    [{ $set: { authorName: { $replaceAll: { input: '$authorName', find: OLD, replacement: NEW } } } }],
  );

  logger.info(
    `[rename-domain] done — ${userRes.modifiedCount} user(s), ${postRes.modifiedCount} post(s) updated.`,
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  logger.error('[rename-domain] failed', err);
  process.exit(1);
});
