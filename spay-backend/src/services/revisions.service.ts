import { Revision } from '../models/Revision';
import { logger } from '../utils/logger';

type EntityType = 'page' | 'post';

type RecordParams = {
  entityType: EntityType;
  entityId: string;
  /** The document state to snapshot (lean object, no Mongoose internals) */
  snapshot: Record<string, unknown>;
  /** Optional human label, e.g. "Renamed slug to /new-path" */
  label?: string;
  authorEmail?: string;
  authorName?: string;
};

/**
 * Writes a revision row. Fire-and-forget — failures are logged but don't
 * propagate to the caller (revisions are a nice-to-have, not load-bearing).
 */
export function recordRevision(params: RecordParams): void {
  Revision.create({
    entityType: params.entityType,
    entityId:   params.entityId,
    snapshot:   params.snapshot,
    label:      params.label ?? '',
    authorEmail: params.authorEmail ?? '',
    authorName:  params.authorName ?? '',
  })
    .then((r) => logger.debug(`[revision] saved ${params.entityType} ${params.entityId} (rev=${r._id})`))
    .catch((err) => logger.warn('[revision] failed to save', err));
}

/**
 * Lists revisions for an entity, newest first.
 *
 * Excludes the (potentially large) `snapshot` blob at the DB level — the
 * timeline UI only needs metadata, so projecting it out keeps the query and
 * payload small and the History drawer fast. Use getRevision() for the full
 * snapshot when restoring.
 */
export async function listRevisions(entityType: EntityType, entityId: string, limit = 50) {
  return Revision.find({ entityType, entityId })
    .select('-snapshot')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/** Loads a single revision by id. */
export async function getRevision(id: string) {
  return Revision.findById(id).lean();
}
