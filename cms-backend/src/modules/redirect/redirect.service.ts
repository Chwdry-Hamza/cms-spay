import { Redirect, RedirectDoc, RedirectReason } from '../../models/Redirect';
import { ContentPage } from '../../models/ContentPage';
import { BadRequest, Conflict, NotFound } from '../../utils/errors';

const WORKSPACE = 'default';

export type RedirectInput = {
  fromSlug: string;
  toSlug: string;
  statusCode?: 301 | 308;
  note?: string | null;
  reason?: RedirectReason;
};

export async function listRedirects() {
  const rows = await Redirect.find({ workspaceId: WORKSPACE }).sort({ createdAt: -1 }).lean();
  return rows.map((r) => ({
    fromSlug: r.fromSlug,
    toSlug: r.toSlug,
    statusCode: r.statusCode,
    reason: r.reason,
    note: r.note,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function findRedirectBySlug(fromSlug: string): Promise<RedirectDoc | null> {
  return Redirect.findOne({ workspaceId: WORKSPACE, fromSlug });
}

/**
 * Create a redirect.
 *
 *  - Rejects if `fromSlug` points to an existing live ContentPage (would
 *    silently bypass that page).
 *  - Rejects on direct loops (fromSlug === toSlug — also caught by the Zod
 *    schema, kept here as a defense-in-depth check for non-HTTP callers).
 *  - Collapses redirect chains: if `toSlug` itself is the `fromSlug` of an
 *    existing redirect, we follow the chain and store the *final* target
 *    so the public lookup is a single hop. Detects loops along the way.
 */
export async function createRedirect(input: RedirectInput): Promise<RedirectDoc> {
  if (input.fromSlug === input.toSlug) {
    throw BadRequest('A slug cannot redirect to itself.', 'REDIRECT_SELF');
  }

  // Don't shadow an existing live page.
  const livePage = await ContentPage.findOne({
    workspaceId: WORKSPACE,
    slug: input.fromSlug,
  })
    .select('_id')
    .lean();
  if (livePage) {
    throw Conflict(
      `Cannot create a redirect from "${input.fromSlug}" — a live page already uses this slug.`,
      'REDIRECT_SHADOWS_PAGE',
    );
  }

  // Collapse chains: follow toSlug → ... → final.
  const finalTarget = await resolveFinalTarget(input.toSlug, input.fromSlug);

  // Upsert — if a redirect already exists for fromSlug, update its target.
  const existing = await Redirect.findOne({ workspaceId: WORKSPACE, fromSlug: input.fromSlug });
  if (existing) {
    existing.toSlug = finalTarget;
    if (input.statusCode) existing.statusCode = input.statusCode;
    if (input.note !== undefined) existing.note = input.note ?? null;
    if (input.reason) existing.reason = input.reason;
    await existing.save();
    return existing;
  }

  return Redirect.create({
    workspaceId: WORKSPACE,
    fromSlug: input.fromSlug,
    toSlug: finalTarget,
    statusCode: input.statusCode ?? 308,
    reason: input.reason ?? 'manual',
    note: input.note ?? null,
  });
}

export async function updateRedirect(
  fromSlug: string,
  patch: { toSlug?: string; statusCode?: 301 | 308; note?: string | null },
): Promise<RedirectDoc> {
  const r = await Redirect.findOne({ workspaceId: WORKSPACE, fromSlug });
  if (!r) throw NotFound(`Redirect not found: ${fromSlug}`, 'REDIRECT_NOT_FOUND');

  if (patch.toSlug !== undefined) {
    if (patch.toSlug === fromSlug) {
      throw BadRequest('A slug cannot redirect to itself.', 'REDIRECT_SELF');
    }
    r.toSlug = await resolveFinalTarget(patch.toSlug, fromSlug);
  }
  if (patch.statusCode !== undefined) r.statusCode = patch.statusCode;
  if (patch.note !== undefined) r.note = patch.note;
  await r.save();
  return r;
}

export async function deleteRedirect(fromSlug: string): Promise<void> {
  const r = await Redirect.findOne({ workspaceId: WORKSPACE, fromSlug });
  if (!r) throw NotFound(`Redirect not found: ${fromSlug}`, 'REDIRECT_NOT_FOUND');
  await r.deleteOne();
}

/**
 * Public lookup used by the spay-website fallback. Returns the eventual
 * target slug (already chain-collapsed at write-time) or `null` if no
 * redirect exists.
 */
export async function getPublicRedirect(fromSlug: string) {
  const r = await Redirect.findOne({ workspaceId: WORKSPACE, fromSlug })
    .select('fromSlug toSlug statusCode')
    .lean();
  if (!r) return null;
  return { fromSlug: r.fromSlug, toSlug: r.toSlug, statusCode: r.statusCode };
}

/**
 * Auto-create a 308 redirect when a ContentPage's slug changes. Called from
 * `updateContentPage`. Best-effort: a failure here logs and continues so the
 * actual page update isn't blocked by a redirect bookkeeping problem.
 */
export async function recordSlugChange(oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  try {
    // If a redirect FROM oldSlug already existed, this upserts it to point
    // at newSlug. Any other redirects whose `toSlug` was oldSlug should now
    // skip the hop and point at newSlug too — keep chains at length 1.
    await Redirect.findOneAndUpdate(
      { workspaceId: WORKSPACE, fromSlug: oldSlug },
      {
        $set: {
          toSlug: newSlug,
          statusCode: 308,
          reason: 'auto-slug-change' as RedirectReason,
        },
        $setOnInsert: { workspaceId: WORKSPACE, fromSlug: oldSlug, note: null },
      },
      { upsert: true, new: true },
    );

    await Redirect.updateMany(
      { workspaceId: WORKSPACE, toSlug: oldSlug },
      { $set: { toSlug: newSlug } },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[redirect] failed to record slug change', { oldSlug, newSlug, err });
  }
}

/**
 * Follow `start → … → end` through the Redirect table, returning the final
 * non-redirected slug. `originFromSlug` is the slug we are *about to* attach
 * a redirect to — if we encounter it in the chain we'd create a loop, so
 * we throw instead.
 */
async function resolveFinalTarget(start: string, originFromSlug: string): Promise<string> {
  const seen = new Set<string>([originFromSlug]);
  let cursor = start;
  // Cap depth as a defensive guard — chains are collapsed on write so >10
  // hops would indicate either bad seed data or a bug.
  for (let i = 0; i < 10; i += 1) {
    if (seen.has(cursor)) {
      throw BadRequest(
        `Redirect would create a loop ending at "${cursor}".`,
        'REDIRECT_LOOP',
      );
    }
    seen.add(cursor);
    const next = await Redirect.findOne({ workspaceId: WORKSPACE, fromSlug: cursor })
      .select('toSlug')
      .lean();
    if (!next) return cursor;
    cursor = next.toSlug;
  }
  throw BadRequest('Redirect chain is too long.', 'REDIRECT_CHAIN_TOO_LONG');
}
