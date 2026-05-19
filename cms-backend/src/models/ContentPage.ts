import { Schema, model, HydratedDocument } from 'mongoose';

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'note'
  | 'divider'
  | 'table';

export interface HeadingPart {
  text: string;
  color?: string;
}

export interface IBlock {
  id: string;
  type: BlockType;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  parts?: HeadingPart[];
  text?: string;
  ordered?: boolean;
  items?: string[];
  /** Table block: 2D string array. First row is rendered as <th> when
   * `hasHeaderRow` is true. Cells support the same inline markdown subset
   * as paragraphs (**bold**, [link](url)). */
  rows?: string[][];
  hasHeaderRow?: boolean;
  caption?: string;
}

export interface IContentPage {
  workspaceId: string;
  slug: string;
  title: string;
  /** Optional override used by the footer link. If null/empty, falls back to `title`. */
  footerLabel: string | null;
  /** Whether this page appears in the auto-generated footer link list. */
  showInFooter: boolean;
  status: 'draft' | 'published';
  isDirty: boolean;
  effectiveDate: string | null;
  lastUpdated: string | null;
  /** SEO `<title>`. Falls back to `title` when empty. */
  seoTitle: string | null;
  /** Meta description. Falls back to a derived snippet when empty. */
  seoDescription: string | null;
  /** Comma-separated keywords (legacy but still used by some crawlers). */
  seoKeywords: string | null;
  /** Absolute or relative URL of the Open Graph / Twitter share image. */
  ogImage: string | null;
  /** Tells crawlers not to index this page when true. */
  noindex: boolean;
  draftBlocks: IBlock[];
  publishedBlocks: IBlock[] | null;
  version: number;
  lastSavedAt: Date | null;
  lastPublishedAt: Date | null;
  /**
   * If set, a background scheduler will flip this page from draft → published
   * when the clock hits this time. Cleared back to `null` after the auto-
   * publish fires, or when the editor cancels the schedule.
   */
  scheduledPublishAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentPageDoc = HydratedDocument<IContentPage>;

const HeadingPartSchema = new Schema<HeadingPart>(
  {
    text: { type: String, required: true },
    color: { type: String },
  },
  { _id: false },
);

const BlockSchema = new Schema<IBlock>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['heading', 'paragraph', 'list', 'note', 'divider', 'table'],
    },
    level: { type: Number, enum: [1, 2, 3, 4, 5, 6] },
    parts: { type: [HeadingPartSchema], default: undefined },
    text: { type: String },
    ordered: { type: Boolean },
    items: { type: [String], default: undefined },
    // Mongoose doesn't have native String[][], so we store rows as a
    // Mixed array. Validation/shape is enforced upstream by the Zod schema.
    rows: { type: Schema.Types.Mixed, default: undefined },
    hasHeaderRow: { type: Boolean },
    caption: { type: String },
  },
  { _id: false },
);

const ContentPageSchema = new Schema<IContentPage>(
  {
    workspaceId: { type: String, required: true, default: 'default', index: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    footerLabel: { type: String, default: null },
    showInFooter: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    isDirty: { type: Boolean, default: false },
    effectiveDate: { type: String, default: null },
    lastUpdated: { type: String, default: null },
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
    seoKeywords: { type: String, default: null },
    ogImage: { type: String, default: null },
    noindex: { type: Boolean, default: false },
    draftBlocks: { type: [BlockSchema], default: [] },
    publishedBlocks: { type: [BlockSchema], default: null },
    version: { type: Number, default: 0 },
    lastSavedAt: { type: Date, default: null },
    lastPublishedAt: { type: Date, default: null },
    scheduledPublishAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ContentPageSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
// Sparse index — only pages with a pending schedule are indexed. The
// scheduler's "find due jobs" query hits this rather than scanning the full
// collection on every tick.
ContentPageSchema.index(
  { workspaceId: 1, scheduledPublishAt: 1 },
  { sparse: true },
);

export const ContentPage = model<IContentPage>('ContentPage', ContentPageSchema);
