import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * Immutable snapshot of a Page or Post at a moment in time.
 * Written automatically on every successful update so an editor can roll back.
 */
const RevisionSchema = new Schema(
  {
    entityType: { type: String, enum: ['page', 'post'], required: true, index: true },
    entityId:   { type: Schema.Types.ObjectId, required: true, index: true },

    // Snapshot of the document AT THIS POINT
    snapshot:   { type: Schema.Types.Mixed, required: true },

    // Diff-friendly metadata for the timeline UI
    label:      { type: String, default: '' },          // e.g. "Updated content", "Published", "Renamed slug"
    authorEmail:{ type: String, default: '' },
    authorName: { type: String, default: '' },
  },
  { timestamps: true }
);

RevisionSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export type IRevision = InferSchemaType<typeof RevisionSchema> & { _id: Schema.Types.ObjectId };
export const Revision = model('Revision', RevisionSchema);
