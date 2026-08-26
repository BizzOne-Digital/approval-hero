import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: String,
    details: String,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ adminId: 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
