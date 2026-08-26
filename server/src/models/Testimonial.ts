import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  customerName: string;
  quote: string;
  rating: number;
  location?: string;
  profileImage?: {
    url: string;
    alt?: string;
    mediaAssetId?: mongoose.Types.ObjectId;
  };
  date?: Date;
  isFeatured: boolean;
  order: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true, trim: true },
    quote: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    location: String,
    profileImage: {
      url: String,
      alt: String,
      mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    },
    date: Date,
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
