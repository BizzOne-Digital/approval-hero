import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpAttempt extends Document {
  applicationId: mongoose.Types.ObjectId;
  recipientSearchHash: string;
  /** @deprecated use recipientSearchHash */
  phoneSearchHash?: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  ipAddress?: string;
  createdAt: Date;
}

const OtpAttemptSchema = new Schema<IOtpAttempt>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    recipientSearchHash: { type: String, required: true, index: true },
    phoneSearchHash: { type: String, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

OtpAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpAttempt = mongoose.model<IOtpAttempt>('OtpAttempt', OtpAttemptSchema);
