import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: {
    url: string;
    alt?: string;
    mediaAssetId?: mongoose.Types.ObjectId;
  };
  sectionImages?: Array<{
    url: string;
    alt?: string;
    caption?: string;
    mediaAssetId?: mongoose.Types.ObjectId;
  }>;
  categoryId?: mongoose.Types.ObjectId;
  tags: string[];
  author: string;
  publishedAt?: Date;
  isFeatured: boolean;
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: {
    url: string;
    alt?: string;
    mediaAssetId?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
  },
  { timestamps: true }
);

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: {
      url: String,
      alt: String,
      mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    },
    sectionImages: [{
      url: String,
      alt: String,
      caption: String,
      mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    }],
    categoryId: { type: Schema.Types.ObjectId, ref: 'BlogCategory' },
    tags: [String],
    author: { type: String, default: 'Approval Hero Team' },
    publishedAt: Date,
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    seoTitle: String,
    seoDescription: String,
    ogImage: {
      url: String,
      alt: String,
      mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    },
  },
  { timestamps: true }
);

BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, publishedAt: -1 });

export const BlogCategory = mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema);
export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
