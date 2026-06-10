import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * Generic key/value store for site-wide settings.
 * Keys used by the app:
 *  - 'seo'        → site-wide SEO defaults
 *  - 'analytics'  → GA4, GTM, Meta Pixel ids + consent copy
 *  - 'robots'     → robots.txt contents
 *  - 'sitemap'    → indexing + excluded paths
 */
const SettingSchema = new Schema(
  {
    key:   { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type ISetting = InferSchemaType<typeof SettingSchema> & { _id: Schema.Types.ObjectId };
export const Setting = model('Setting', SettingSchema);
