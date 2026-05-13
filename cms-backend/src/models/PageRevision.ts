import { Schema, model, Types, HydratedDocument } from 'mongoose';
import type { ILayoutItem } from './Page';

export type RevisionKind = 'autosave' | 'manualSave' | 'publish';

export interface IPageRevision {
  pageId: Types.ObjectId;
  kind: RevisionKind;
  version: number;
  note: string;
  snapshot: {
    title: string;
    status: 'draft' | 'published';
    layout: ILayoutItem[];
  };
  parentRevisionId: Types.ObjectId | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PageRevisionDoc = HydratedDocument<IPageRevision>;

const SnapshotLayoutItemSchema = new Schema(
  {
    instanceId: String,
    sectionKey: String,
    type: String,
    name: String,
    file: String,
    icon: String,
    visible: Boolean,
    locked: Boolean,
    description: String,
    data: Schema.Types.Mixed,
  },
  { _id: false },
);

const PageRevisionSchema = new Schema<IPageRevision>(
  {
    pageId: { type: Schema.Types.ObjectId, ref: 'Page', required: true, index: true },
    kind: { type: String, enum: ['autosave', 'manualSave', 'publish'], required: true },
    version: { type: Number, required: true },
    note: { type: String, default: '' },
    snapshot: {
      title: { type: String, required: true },
      status: { type: String, enum: ['draft', 'published'], required: true },
      layout: { type: [SnapshotLayoutItemSchema], default: [] },
    },
    parentRevisionId: { type: Schema.Types.ObjectId, ref: 'PageRevision', default: null },
    authorId: { type: String, default: null },
  },
  { timestamps: true },
);

PageRevisionSchema.index({ pageId: 1, version: -1 });
PageRevisionSchema.index({ pageId: 1, kind: 1, createdAt: -1 });

export const PageRevision = model<IPageRevision>('PageRevision', PageRevisionSchema);
