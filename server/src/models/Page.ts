import mongoose, { Schema, Document } from 'mongoose';

export interface IImageRef {
  url: string;
  alt?: string;
  thumbnailUrl?: string;
  mediaAssetId?: mongoose.Types.ObjectId;
}

export interface IPageSection {
  _id?: mongoose.Types.ObjectId;
  name: string;
  sectionType: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  ctaLabel?: string;
  ctaLink?: string;
  primaryImage?: IImageRef;
  secondaryImage?: IImageRef;
  backgroundImage?: IImageRef;
  items?: Array<{
    title?: string;
    description?: string;
    icon?: string;
    image?: IImageRef;
    link?: string;
    badge?: string;
    metadata?: Record<string, unknown>;
  }>;
  backgroundColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  animationPreset?: string;
  animationDirection?: string;
  isVisible: boolean;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface IPage extends Document {
  title: string;
  slug: string;
  status: 'draft' | 'published';
  sections: IPageSection[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: IImageRef;
  canonicalUrl?: string;
  noIndex?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ImageRefSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  thumbnailUrl: { type: String },
  mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
}, { _id: false });

const PageSectionSchema = new Schema({
  name: { type: String, required: true },
  sectionType: { type: String, required: true },
  eyebrow: String,
  heading: String,
  subheading: String,
  body: String,
  ctaLabel: String,
  ctaLink: String,
  primaryImage: ImageRefSchema,
  secondaryImage: ImageRefSchema,
  backgroundImage: ImageRefSchema,
  items: [{
    title: String,
    description: String,
    icon: String,
    image: ImageRefSchema,
    link: String,
    badge: String,
    metadata: Schema.Types.Mixed,
  }],
  backgroundColor: String,
  textAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
  animationPreset: String,
  animationDirection: String,
  isVisible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  metadata: Schema.Types.Mixed,
});

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    sections: [PageSectionSchema],
    seoTitle: String,
    seoDescription: String,
    ogImage: ImageRefSchema,
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PageSchema.index({ slug: 1 });
PageSchema.index({ status: 1 });

export const Page = mongoose.model<IPage>('Page', PageSchema);
