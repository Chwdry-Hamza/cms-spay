import { Schema, model, type InferSchemaType } from 'mongoose';

const CategorySEOSchema = new Schema(
  {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const CategorySchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },          // short tagline (cards, dropdowns)
    color:       { type: String, default: '#46F1C5' },
    postCount:   { type: Number, default: 0 },

    // SEO content shown on the category landing page itself.
    // Paragraphs split by blank lines. Kept as plain text for simplicity;
    // upgrade to TipTap JSON later if rich formatting is needed.
    content:     { type: String, default: '' },
    seo:         { type: CategorySEOSchema, default: () => ({}) },

    // 0 = inherit site default (12). Per-category override for posts-per-page.
    pageSize:    { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export type ICategory = InferSchemaType<typeof CategorySchema> & { _id: Schema.Types.ObjectId };
export const Category = model('Category', CategorySchema);
