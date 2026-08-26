import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGalleryImage extends Document {
  categoryId: mongoose.Types.ObjectId;
  title?: string;
  caption?: string;
  alt: string;
  image: {
    url: string;
    thumbnailUrl?: string;
    mediaAssetId?: mongoose.Types.ObjectId;
  };
  vehicleType?: string;
  isFeatured: boolean;
  order: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const GalleryCategorySchema = new Schema<IGalleryCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'GalleryCategory', required: true },
    title: String,
    caption: String,
    alt: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      thumbnailUrl: String,
      mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    },
    vehicleType: String,
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export const GalleryCategory = mongoose.model<IGalleryCategory>('GalleryCategory', GalleryCategorySchema);
export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
