import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  name: string;
  description: string;
  disclaimer?: string;
  image?: {
    url: string;
    alt?: string;
    mediaAssetId?: mongoose.Types.ObjectId;
  };
  ctaLabel?: string;
  ctaLink?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  displayLocation: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    disclaimer: String,
    image: {
      url: String,
      alt: String,
      mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    },
    ctaLabel: String,
    ctaLink: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    displayLocation: [String],
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>('Offer', OfferSchema);
