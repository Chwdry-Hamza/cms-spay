import { Schema, model, type InferSchemaType } from 'mongoose';

const SEOSchema = new Schema(
  {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    canonical:   { type: String, default: '' },
    noindex:     { type: Boolean, default: false },
    nofollow:    { type: Boolean, default: false },
    og: {
      title:       { type: String, default: '' },
      description: { type: String, default: '' },
      image:       { type: String, default: '' },
    },
    twitter: {
      card:        { type: String, default: 'summary_large_image' },
      title:       { type: String, default: '' },
      description: { type: String, default: '' },
      image:       { type: String, default: '' },
    },
  },
  { _id: false }
);

const StructuredDataSchema = new Schema(
  {
    type:    { type: String, enum: ['none', 'article', 'faq', 'service', 'custom'], default: 'none' },
    faq:     { type: [{ _id: false, q: String, a: String }], default: [] },
    service: {
      name:        { type: String, default: '' },
      description: { type: String, default: '' },
      serviceType: { type: String, default: '' },
      areaServed:  { type: String, default: '' },
      priceRange:  { type: String, default: '' },
    },
    customJsonLd: { type: String, default: '' },
  },
  { _id: false }
);

const PerformanceSchema = new Schema(
  {
    skipAnalytics:     { type: Boolean, default: false },
    disableCache:      { type: Boolean, default: false },
    lazyLoadImages:    { type: Boolean, default: true },
  },
  { _id: false }
);

// Per-post raw HTML/JS injected into the public post. See codeInjectionSchema
// in schemas/common.schema.ts for the rationale (admin-authored, unsanitized).
const CodeInjectionSchema = new Schema(
  {
    header: { type: String, default: '' },
    body:   { type: String, default: '' },
    footer: { type: String, default: '' },
  },
  { _id: false }
);

const PostSchema = new Schema(
  {
    title:   { type: String, required: true, trim: true },
    slug:    { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, default: '' },
    status:  { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft', index: true },

    content: { type: Schema.Types.Mixed, default: { type: 'doc', content: [] } },

    cover:   { type: String, default: '' },
    coverMedia: { type: Schema.Types.ObjectId, ref: 'Media' },
    readTime: { type: Number, default: 0 },

    category:     { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    categoryName: { type: String, default: '' },
    tags:         { type: [String], default: [], index: true },

    seo:         { type: SEOSchema, default: () => ({}) },
    schema:      { type: StructuredDataSchema, default: () => ({}) },
    performance: { type: PerformanceSchema, default: () => ({}) },
    codeInjection: { type: CodeInjectionSchema, default: () => ({}) },

    author:     { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: '' },

    publishedAt: { type: Date, index: true },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

PostSchema.index({ title: 'text', slug: 'text', excerpt: 'text', tags: 'text' });

export type IPost = InferSchemaType<typeof PostSchema> & { _id: Schema.Types.ObjectId };
export const Post = model('Post', PostSchema);
