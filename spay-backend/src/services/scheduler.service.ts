import { Page } from '../models/Page';
import { Post } from '../models/Post';
import { logger } from '../utils/logger';
import { triggerContentRevalidate } from './revalidate.service';

const INTERVAL_MS = 60_000; // check every minute

/**
 * Polls Mongo for any documents whose status === 'scheduled' and whose
 * scheduledAt is in the past. Flips them to 'published' and revalidates.
 */
async function runOnce() {
  const now = new Date();

  // Pages
  const pages = await Page.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
  });
  for (const p of pages) {
    p.status = 'published';
    if (!p.publishedAt) p.publishedAt = now;
    await p.save();
    triggerContentRevalidate(['/', p.slug], 'page');
    logger.info(`[scheduler] published page ${p.slug} (${p._id})`);
  }

  // Posts
  const posts = await Post.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
  });
  for (const p of posts) {
    p.status = 'published';
    if (!p.publishedAt) p.publishedAt = now;
    await p.save();
    triggerContentRevalidate(['/blog', `/blog/${p.slug}`], 'post');
    logger.info(`[scheduler] published post ${p.slug} (${p._id})`);
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

/** Boot the scheduler. Safe to call once. */
export function startScheduler() {
  if (timer) return;
  // Run once at startup (catch anything that became due while the server was down)
  runOnce().catch((err) => logger.warn('[scheduler] initial run failed', err));
  timer = setInterval(() => {
    runOnce().catch((err) => logger.warn('[scheduler] tick failed', err));
  }, INTERVAL_MS);
  // Don't keep the event loop alive just for this
  timer.unref?.();
  logger.info(`[scheduler] started — checks every ${INTERVAL_MS / 1000}s for scheduled content`);
}

export function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
