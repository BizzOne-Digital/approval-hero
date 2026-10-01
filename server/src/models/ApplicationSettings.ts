import mongoose, { Schema, Document } from 'mongoose';

export interface IOptionItem {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
}

export interface IVehicleTypeOption extends IOptionItem {
  imageUrl?: string;
}

export interface IApplicationSettings extends Document {
  version: string;
  vehicleTypes: IVehicleTypeOption[];
  downPaymentOptions: IOptionItem[];
  creditCategories: IOptionItem[];
  purchaseTimelines: IOptionItem[];
  residencyStatuses: IOptionItem[];
  employmentStatuses: IOptionItem[];
  incomeRanges: IOptionItem[];
  incomeDurations: IOptionItem[];
  contactMethods: IOptionItem[];
  bestTimeOptions: IOptionItem[];
  consentWording: {
    accuracy: string;
    contact: string;
    privacy: string;
    partnerShare: string;
    marketing: string;
    version: string;
  };
  successMessage: {
    heading: string;
    body: string;
    expectedResponseTime: string;
  };
  trustIndicators: string[];
  downPaymentDisclaimer: string;
  privacyNotice: string;
  dataRetentionDays: number;
  updatedAt: Date;
}

const ApplicationSettingsSchema = new Schema<IApplicationSettings>(
  {
    version: { type: String, default: '1.0.0' },
    vehicleTypes: [{ id: String, label: String, description: String, imageUrl: String, enabled: { type: Boolean, default: true } }],
    downPaymentOptions: [{ id: String, label: String, description: String, enabled: { type: Boolean, default: true } }],
    creditCategories: [{ id: String, label: String, description: String, enabled: { type: Boolean, default: true } }],
    purchaseTimelines: [{ id: String, label: String, enabled: { type: Boolean, default: true } }],
    residencyStatuses: [{ id: String, label: String, enabled: { type: Boolean, default: true } }],
    employmentStatuses: [{ id: String, label: String, enabled: { type: Boolean, default: true } }],
    incomeRanges: [{ id: String, label: String, description: String, enabled: { type: Boolean, default: true } }],
    incomeDurations: [{ id: String, label: String, enabled: { type: Boolean, default: true } }],
    contactMethods: [{ id: String, label: String, enabled: { type: Boolean, default: true } }],
    bestTimeOptions: [{ id: String, label: String, enabled: { type: Boolean, default: true } }],
    consentWording: {
      accuracy: String,
      contact: String,
      privacy: String,
      partnerShare: String,
      marketing: String,
      version: String,
    },
    successMessage: {
      heading: String,
      body: String,
      expectedResponseTime: String,
    },
    trustIndicators: [String],
    downPaymentDisclaimer: String,
    privacyNotice: String,
    dataRetentionDays: { type: Number, default: 365 },
  },
  { timestamps: true },
);

export const ApplicationSettings = mongoose.model<IApplicationSettings>('ApplicationSettings', ApplicationSettingsSchema);
