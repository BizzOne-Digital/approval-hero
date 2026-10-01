import mongoose, { Schema, Document } from 'mongoose';
import { IImageRef } from './Page';

export interface IServiceDetailSection {
  _id?: mongoose.Types.ObjectId;
  sectionType: string;
  title?: string;
  content?: string;
  image?: IImageRef;
  items?: Array<{ title?: string; description?: string; icon?: string }>;
  order: number;
  isVisible: boolean;
}

export interface IService extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  cardImage?: IImageRef;
  icon?: string;
  badge?: string;
  highlights: string[];
  ctaLabel: string;
  order: number;
  isFeatured: boolean;
  status: 'draft' | 'published';
  detailPage: {
    heroEyebrow?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroBackgroundImage?: IImageRef;
    introduction?: string;
    whoIsFor?: string;
    challenges?: string;
    howWeHelp?: string;
    process?: Array<{ step: number; title: string; description: string }>;
    requiredInfo?: string;
    benefits?: string[];
    relatedFaqIds?: mongoose.Types.ObjectId[];
    relatedServiceIds?: mongoose.Types.ObjectId[];
    testimonialId?: mongoose.Types.ObjectId;
    ctaTitle?: string;
    ctaDescription?: string;
    sections: IServiceDetailSection[];
    sectionImages: IImageRef[];
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: IImageRef;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageRefSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  thumbnailUrl: { type: String },
  mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
}, { _id: false });

const ServiceDetailSectionSchema = new Schema({
  sectionType: { type: String, required: true },
  title: String,
  content: String,
  image: ImageRefSchema,
  items: [{ title: String, description: String, icon: String }],
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
});

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true },
    cardImage: ImageRefSchema,
    icon: String,
    badge: String,
    highlights: [String],
    ctaLabel: { type: String, default: 'Learn More' },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    detailPage: {
      heroEyebrow: String,
      heroTitle: String,
      heroSubtitle: String,
      heroBackgroundImage: ImageRefSchema,
      introduction: String,
      whoIsFor: String,
      challenges: String,
      howWeHelp: String,
      process: [{ step: Number, title: String, description: String }],
      requiredInfo: String,
      benefits: [String],
      relatedFaqIds: [{ type: Schema.Types.ObjectId, ref: 'FAQ' }],
      relatedServiceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
      testimonialId: { type: Schema.Types.ObjectId, ref: 'Testimonial' },
      ctaTitle: String,
      ctaDescription: String,
      sections: [ServiceDetailSectionSchema],
      sectionImages: [ImageRefSchema],
      seoTitle: String,
      seoDescription: String,
      ogImage: ImageRefSchema,
    },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ status: 1, order: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
