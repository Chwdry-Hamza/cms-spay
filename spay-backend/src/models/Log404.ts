import { Schema, model, type InferSchemaType } from 'mongoose';

const Log404Schema = new Schema(
  {
    url:       { type: String, required: true, index: true },
    hits:      { type: Number, default: 1 },
    lastSeen:  { type: Date, default: Date.now, index: true },
    resolved:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

Log404Schema.index({ url: 1, resolved: 1 });

export type ILog404 = InferSchemaType<typeof Log404Schema> & { _id: Schema.Types.ObjectId };
export const Log404 = model('Log404', Log404Schema);
