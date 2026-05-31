import { Schema, model, type InferSchemaType } from 'mongoose';

const MediaSchema = new Schema(
  {
    name:     { type: String, required: true },           // user-facing filename
    filename: { type: String, required: true, unique: true }, // stored filename on disk
    url:      { type: String, required: true },           // public URL
    type:     { type: String, enum: ['image', 'video', 'document'], required: true, index: true },
    mime:     { type: String, required: true },
    size:     { type: Number, required: true },
    width:    { type: Number },
    height:   { type: Number },
    alt:      { type: String, default: '' },

    isWebP:   { type: Boolean, default: false },
    variants: { type: Schema.Types.Mixed, default: {} }, // { webp: url, thumbnail: url }
  },
  { timestamps: true }
);

MediaSchema.index({ name: 'text', alt: 'text' });

export type IMedia = InferSchemaType<typeof MediaSchema> & { _id: Schema.Types.ObjectId };
export const Media = model('Media', MediaSchema);
