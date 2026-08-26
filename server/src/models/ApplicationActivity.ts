import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplicationActivity extends Document {
  applicationId: Types.ObjectId;
  action: string;
  description?: string;
  previousStatus?: string;
  newStatus?: string;
  performedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ApplicationActivitySchema = new Schema<IApplicationActivity>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    action: { type: String, required: true },
    description: String,
    previousStatus: String,
    newStatus: String,
    performedBy: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ApplicationActivity = mongoose.model<IApplicationActivity>('ApplicationActivity', ApplicationActivitySchema);
