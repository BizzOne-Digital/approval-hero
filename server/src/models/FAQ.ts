import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQCategory extends Document {
  name: string;
  slug: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFAQ extends Document {
  categoryId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  isFeatured: boolean;
  order: number;
  status: 'draft' | 'published';
  serviceIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FAQCategorySchema = new Schema<IFAQCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FAQSchema = new Schema<IFAQ>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'FAQCategory', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  },
  { timestamps: true }
);

export const FAQCategory = mongoose.model<IFAQCategory>('FAQCategory', FAQCategorySchema);
export const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);
