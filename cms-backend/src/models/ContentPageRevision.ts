import { Schema, model, Types, HydratedDocument } from 'mongoose';
import type { IBlock } from './ContentPage';

/**
 * Point-in-time snapshot of a ContentPage's editable state. A new row is
 * written on every manual save / publish, plus coalesced autosaves. Lets
 * editors browse and restore prior versions from the editor's History panel
 * — the SEO equivalent of Google Docs' version history.
 *
 * Retention is capped to the last 50 per page by the service layer to keep
 * the collection size predictable; older revisions roll off oldest-first.
 */
export type ContentRevisionKind = 'autosave' | 'manualSave' | 'publish';

export interface IContentPageRevision {
  contentPageId: Types.ObjectId;
  kind: ContentRevisionKind;
  version: number;
  note: string;
  snapshot: {
    title: string;
    slug: string;
    blocks: IBlock[];
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    ogImage: string | null;
    noindex: boolean;
    effectiveDate: string | null;
    lastUpdated: string | null;
    footerLabel: string | null;
    showInFooter: boolean;
  };
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentPageRevisionDoc = HydratedDocument<IContentPageRevision>;

const SnapshotBlockSchema = new Schema(
  {
    id: String,
    type: String,
    level: Number,
    parts: Schema.Types.Mixed,
    text: String,
    ordered: Boolean,
    items: [String],
    rows: Schema.Types.Mixed,
    hasHeaderRow: Boolean,
    caption: String,
  },
  { _id: false },
);

const ContentPageRevisionSchema = new Schema<IContentPageRevision>(
  {
    contentPageId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentPage',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['autosave', 'manualSave', 'publish'],
      required: true,
    },
    version: { type: Number, required: true },
    note: { type: String, default: '' },
    snapshot: {
      title: { type: String, required: true },
      slug: { type: String, required: true },
      blocks: { type: [SnapshotBlockSchema], default: [] },
      seoTitle: { type: String, default: null },
      seoDescription: { type: String, default: null },
      seoKeywords: { type: String, default: null },
      ogImage: { type: String, default: null },
      noindex: { type: Boolean, default: false },
      effectiveDate: { type: String, default: null },
      lastUpdated: { type: String, default: null },
      footerLabel: { type: String, default: null },
      showInFooter: { type: Boolean, default: true },
    },
    authorId: { type: String, default: null },
  },
  { timestamps: true },
);

ContentPageRevisionSchema.index({ contentPageId: 1, version: -1 });
ContentPageRevisionSchema.index({ contentPageId: 1, createdAt: -1 });

export const ContentPageRevision = model<IContentPageRevision>(
  'ContentPageRevision',
  ContentPageRevisionSchema,
);
