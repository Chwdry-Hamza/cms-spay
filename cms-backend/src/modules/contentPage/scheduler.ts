import { logger } from '../../config/logger';
import { listDueScheduledPages, publishContentPage } from './contentPage.service';

/**
 * Polls every TICK_MS for ContentPages whose `scheduledPublishAt` is in the
 * past and publishes them. A `setInterval` is intentional — this CMS runs
 * as a single process so a distributed scheduler (BullMQ / Redis) is
 * overkill. If we ever go multi-process, swap this for a worker with a lock.
 *
 * The tick is best-effort:
 *   - We grab a small batch (default 25) so a startup backlog drains over
 *     several ticks instead of one fat publish wave.
 *   - Per-page failures are logged and don't abort the tick — the row keeps
 *     its `scheduledPublishAt` and we'll retry next tick.
 *   - Overlapping ticks are guarded by `running` so a slow batch doesn't
 *     trample a fresh one.
 */
const TICK_MS = 60_000;

let running = false;
let timer: NodeJS.Timeout | null = null;

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const due = await listDueScheduledPages();
    if (due.length === 0) return;
    logger.info({ count: due.length }, '[scheduler] publishing due pages');
    for (const page of due) {
      try {
        await publishContentPage(page.slug);
        logger.info({ slug: page.slug }, '[scheduler] auto-published');
      } catch (err) {
        // Don't clear the schedule on failure — next tick will retry. A
        // truly bad row will keep erroring; we surface that in the log.
        logger.error({ slug: page.slug, err }, '[scheduler] publish failed');
      }
    }
  } catch (err) {
    logger.error({ err }, '[scheduler] tick failed');
  } finally {
    running = false;
  }
}

export function startScheduler(): void {
  if (timer) return;
  // Fire once on startup so a backlog from while the server was down
  // catches up immediately instead of waiting one full tick.
  void tick();
  timer = setInterval(() => {
    void tick();
  }, TICK_MS);
  // `unref` so the scheduler timer doesn't keep the event loop alive on
  // graceful shutdown.
  timer.unref();
  logger.info({ tickMs: TICK_MS }, '[scheduler] started');
}

export function stopScheduler(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
