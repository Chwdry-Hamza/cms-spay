import { Schema, model, Document, Types, HydratedDocument } from 'mongoose';

export interface ILayoutItem {
  instanceId: string;
  sectionKey: string;
  type: string;
  name: string;
  file: string;
  icon: string;
  visible: boolean;
  locked: boolean;
  description: string;
  data: Record<string, unknown>;
}

export interface IPage {
  workspaceId: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  isDirty: boolean;
  draftLayout: ILayoutItem[];
  publishedLayout: ILayoutItem[] | null;
  currentDraftRev: Types.ObjectId | null;
  publishedRevId: Types.ObjectId | null;
  version: number;
  lastSavedAt: Date | null;
  lastPublishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PageDoc = HydratedDocument<IPage>;

const LayoutItemSchema = new Schema<ILayoutItem>(
  {
    instanceId: { type: String, required: true },
    sectionKey: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    file: { type: String, default: '' },
    icon: { type: String, default: 'puzzle' },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
    description: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: () => ({}) },
  },
  { _id: false },
);

const PageSchema = new Schema<IPage>(
  {
    workspaceId: { type: String, required: true, default: 'default', index: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    isDirty: { type: Boolean, default: false },
    draftLayout: { type: [LayoutItemSchema], default: [] },
    publishedLayout: { type: [LayoutItemSchema], default: null },
    currentDraftRev: { type: Schema.Types.ObjectId, ref: 'PageRevision', default: null },
    publishedRevId: { type: Schema.Types.ObjectId, ref: 'PageRevision', default: null },
    version: { type: Number, default: 0 },
    lastSavedAt: { type: Date, default: null },
    lastPublishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

PageSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
PageSchema.index({ status: 1, updatedAt: -1 });

export const Page = model<IPage>('Page', PageSchema);
