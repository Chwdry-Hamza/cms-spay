import { Schema, model, type InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name:         { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role:         { type: String, enum: ['owner', 'editor', 'author'], default: 'owner' },
    lastLoginAt:  { type: Date },
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof UserSchema> & { _id: Schema.Types.ObjectId };
export const User = model('User', UserSchema);
