import mongoose, { Schema, Document } from 'mongoose';

export interface INavItem {
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
  children?: INavItem[];
}

export interface INavigation extends Document {
  headerItems: INavItem[];
  footerColumns: Array<{
    title: string;
    links: Array<{ label: string; href: string; order: number }>;
    order: number;
  }>;
  serviceMenuEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NavItemSchema = new Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  children: [{ type: Schema.Types.Mixed }],
});

const NavigationSchema = new Schema<INavigation>(
  {
    headerItems: [NavItemSchema],
    footerColumns: [{
      title: String,
      links: [{ label: String, href: String, order: Number }],
      order: Number,
    }],
    serviceMenuEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Navigation = mongoose.model<INavigation>('Navigation', NavigationSchema);
