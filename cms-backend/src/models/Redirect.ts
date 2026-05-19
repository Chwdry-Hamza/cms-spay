import { Schema, model, HydratedDocument } from 'mongoose';

/**
 * URL redirect record. The public site falls back to this table when a slug
 * 404s — if a Redirect row matches `fromSlug`, the request is 308'd to the
 * `toSlug` so the old URL keeps its SEO juice.
 *
 * `reason: 'auto-slug-change'` rows are created automatically whenever an
 * editor renames a ContentPage's slug; `reason: 'manual'` rows are added by
 * admins via the Redirects UI (e.g. for inbound links from print or a legacy
 * domain).
 */
export type RedirectReason = 'auto-slug-change' | 'manual';

export interface IRedirect {
  workspaceId: string;
  fromSlug: string;
  toSlug: string;
  statusCode: 301 | 308;
  reason: RedirectReason;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RedirectDoc = HydratedDocument<IRedirect>;

const RedirectSchema = new Schema<IRedirect>(
  {
    workspaceId: { type: String, required: true, default: 'default', index: true },
    fromSlug: { type: String, required: true },
    toSlug: { type: String, required: true },
    statusCode: { type: Number, enum: [301, 308], default: 308 },
    reason: { type: String, enum: ['auto-slug-change', 'manual'], default: 'manual' },
    note: { type: String, default: null },
  },
  { timestamps: true },
);

// Unique per workspace — every fromSlug can have at most one active target.
RedirectSchema.index({ workspaceId: 1, fromSlug: 1 }, { unique: true });

export const Redirect = model<IRedirect>('Redirect', RedirectSchema);
