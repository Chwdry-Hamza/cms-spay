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

const PageSchema = new Schema(
  {
    title:    { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status:   { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft', index: true },
    template: { type: String, default: 'Content' },

    // TipTap JSON document
    content:  { type: Schema.Types.Mixed, default: { type: 'doc', content: [] } },
    excerpt:  { type: String, default: '' },

    // Structured content overrides for code-driven pages (e.g. the homepage).
    // Free-form object keyed by section; the website merges these over its
    // built-in defaults. Only meaningful for reserved/landing pages.
    sections: { type: Schema.Types.Mixed, default: {} },

    seo:           { type: SEOSchema, default: () => ({}) },
    schema:        { type: StructuredDataSchema, default: () => ({}) },
    performance:   { type: PerformanceSchema, default: () => ({}) },
    featuredImage: { type: Schema.Types.ObjectId, ref: 'Media' },

    author:      { type: Schema.Types.ObjectId, ref: 'User' },
    authorName:  { type: String, default: '' },

    publishedAt: { type: Date, index: true },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

PageSchema.index({ title: 'text', slug: 'text', excerpt: 'text' });

export type IPage = InferSchemaType<typeof PageSchema> & { _id: Schema.Types.ObjectId };
export const Page = model('Page', PageSchema);
