import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  general: {
    businessName: string;
    tagline: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    serviceArea?: string;
    businessHours?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  branding: {
    logo?: { url: string; alt?: string; mediaAssetId?: mongoose.Types.ObjectId };
    lightLogo?: { url: string; alt?: string; mediaAssetId?: mongoose.Types.ObjectId };
    darkLogo?: { url: string; alt?: string; mediaAssetId?: mongoose.Types.ObjectId };
    favicon?: { url: string; mediaAssetId?: mongoose.Types.ObjectId };
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultOgImage?: { url: string; alt?: string };
    googleVerification?: string;
    robotsIndex: boolean;
  };
  contact: {
    notificationEmail: string;
    successMessage: string;
    consentText: string;
    spamProtection: boolean;
  };
  animation: {
    introEnabled: boolean;
    introDuration: number;
    smoothScrolling: boolean;
    animationIntensity: 'low' | 'medium' | 'high';
    reducedMotionFallback: boolean;
    pageTransitions: boolean;
  };
  footer: {
    description: string;
    disclaimer: string;
    copyright: string;
    ctaLabel: string;
    ctaLink: string;
  };
  header: {
    ctaLabel: string;
    ctaLink: string;
    phone: string;
  };
  pricing: {
    showPricing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImageRefSchema = new Schema({
  url: String,
  alt: String,
  mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
}, { _id: false });

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    general: {
      businessName: { type: String, default: 'Approval Hero' },
      tagline: { type: String, default: 'Your Road Forward Starts Here' },
      email: { type: String, default: 'ak_2123@hotmail.com' },
      phone: { type: String, default: '' },
      alternatePhone: String,
      address: String,
      serviceArea: { type: String, default: 'Greater Toronto Area and Ontario' },
      businessHours: { type: String, default: 'Mon-Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM' },
    },
    social: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
      twitter: String,
    },
    branding: {
      logo: ImageRefSchema,
      lightLogo: ImageRefSchema,
      darkLogo: ImageRefSchema,
      favicon: ImageRefSchema,
      primaryColor: { type: String, default: '#04152D' },
      secondaryColor: { type: String, default: '#0866FF' },
      accentColor: { type: String, default: '#21A3FF' },
      headingFont: { type: String, default: 'Oswald' },
      bodyFont: { type: String, default: 'Inter' },
    },
    seo: {
      defaultTitle: { type: String, default: 'Approval Hero | Vehicle Financing Assistance' },
      titleTemplate: { type: String, default: '%s | Approval Hero' },
      defaultDescription: { type: String, default: 'Approval Hero connects customers with dealer and lending partners who understand challenging credit situations.' },
      defaultOgImage: ImageRefSchema,
      googleVerification: String,
      robotsIndex: { type: Boolean, default: true },
    },
    contact: {
      notificationEmail: { type: String, default: 'ak_2123@hotmail.com' },
      successMessage: { type: String, default: 'Thank you! We will contact you shortly.' },
      consentText: { type: String, default: 'I consent to being contacted about vehicle financing options.' },
      spamProtection: { type: Boolean, default: true },
    },
    animation: {
      introEnabled: { type: Boolean, default: true },
      introDuration: { type: Number, default: 3500 },
      smoothScrolling: { type: Boolean, default: true },
      animationIntensity: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
      reducedMotionFallback: { type: Boolean, default: true },
      pageTransitions: { type: Boolean, default: true },
    },
    footer: {
      description: { type: String, default: 'Approval Hero helps customers explore vehicle-financing options through dealer and lending partners.' },
      disclaimer: { type: String, default: 'Approval, rates, terms and zero-down options are subject to lender criteria, credit assessment and eligibility. Approval Hero does not guarantee financing approval.' },
      copyright: { type: String, default: 'Approval Hero. All rights reserved.' },
      ctaLabel: { type: String, default: 'Apply Now' },
      ctaLink: { type: String, default: '/contact' },
    },
    header: {
      ctaLabel: { type: String, default: 'Apply Now' },
      ctaLink: { type: String, default: '/contact' },
      phone: { type: String, default: '' },
    },
    pricing: {
      showPricing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
