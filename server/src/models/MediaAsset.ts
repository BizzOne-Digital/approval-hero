import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaAsset extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  folder: string;
  width?: number;
  height?: number;
  referenceCount: number;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    thumbnailUrl: String,
    alt: { type: String, default: '' },
    folder: { type: String, required: true },
    width: Number,
    height: Number,
    referenceCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true }
);

MediaAssetSchema.index({ folder: 1 });
MediaAssetSchema.index({ filename: 1 });

export const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
