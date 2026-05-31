import { Schema, model, type InferSchemaType } from 'mongoose';

const RedirectSchema = new Schema(
  {
    from: { type: String, required: true, unique: true, index: true, trim: true },
    to:   { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type IRedirect = InferSchemaType<typeof RedirectSchema> & { _id: Schema.Types.ObjectId };
export const Redirect = model('Redirect', RedirectSchema);
