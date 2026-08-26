import mongoose, { Schema, Document } from 'mongoose';

export const APPLICATION_STATUSES = [
  'Started', 'Draft', 'Contact Pending', 'OTP Sent', 'Phone Verified', 'Submitted',
  'Under Review', 'Contacted', 'Documents Requested', 'Partner Matched',
  'Appointment Booked', 'Approved', 'Declined', 'Closed', 'Spam',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface IConsentRecord {
  type: string;
  accepted: boolean;
  version: string;
  acceptedAt: Date;
}

export interface IApplication extends Document {
  referenceNumber?: string;
  publicTokenHash: string;
  status: ApplicationStatus;
  currentStep: string;
  completedSteps: string[];
  vehicleType?: string;
  knowsSpecificVehicle?: boolean;
  preferredVehicle?: {
    make?: string;
    model?: string;
    year?: string;
    notes?: string;
  };
  tradeIn?: {
    planning?: string;
    year?: string;
    make?: string;
    model?: string;
    kilometres?: string;
    loanBalance?: string;
    notes?: string;
    detailsSkipped?: boolean;
  };
  downPaymentRange?: string;
  creditCategory?: string;
  purchaseTimeline?: string;
  residencyStatus?: string;
  employmentStatus?: string;
  monthlyIncomeRange?: string;
  incomeDuration?: string;
  employerDetails?: Record<string, string>;
  address?: {
    street?: string;
    unit?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    timeAtAddress?: string;
    entryMode?: 'autocomplete' | 'manual';
  };
  encryptedDateOfBirth?: string;
  firstName?: string;
  lastName?: string;
  encryptedEmail?: string;
  encryptedPhone?: string;
  phoneSearchHash?: string;
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  consentRecords: IConsentRecord[];
  marketingConsent?: boolean;
  source?: string;
  referrer?: string;
  utmData?: { source?: string; medium?: string; campaign?: string };
  deviceCategory?: string;
  assignedTo?: string;
  internalNotes: Array<{ text: string; author?: string; createdAt: Date }>;
  submittedAt?: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    referenceNumber: { type: String, unique: true, sparse: true },
    publicTokenHash: { type: String, required: true, index: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'Started' },
    currentStep: { type: String, default: 'vehicleType' },
    completedSteps: { type: [String], default: [] },
    vehicleType: String,
    knowsSpecificVehicle: Boolean,
    preferredVehicle: {
      make: String,
      model: String,
      year: String,
      notes: String,
    },
    tradeIn: {
      planning: String,
      year: String,
      make: String,
      model: String,
      kilometres: String,
      loanBalance: String,
      notes: String,
      detailsSkipped: Boolean,
    },
    downPaymentRange: String,
    creditCategory: String,
    purchaseTimeline: String,
    residencyStatus: String,
    employmentStatus: String,
    monthlyIncomeRange: String,
    incomeDuration: String,
    employerDetails: { type: Schema.Types.Mixed },
    address: {
      street: String,
      unit: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'Canada' },
      timeAtAddress: String,
      entryMode: String,
    },
    encryptedDateOfBirth: String,
    firstName: String,
    lastName: String,
    encryptedEmail: String,
    encryptedPhone: String,
    phoneSearchHash: String,
    preferredContactMethod: String,
    bestTimeToContact: String,
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: Date,
    consentRecords: [{
      type: { type: String },
      accepted: Boolean,
      version: String,
      acceptedAt: Date,
    }],
    marketingConsent: Boolean,
    source: String,
    referrer: String,
    utmData: {
      source: String,
      medium: String,
      campaign: String,
    },
    deviceCategory: String,
    assignedTo: String,
    internalNotes: [{
      text: String,
      author: String,
      createdAt: { type: Date, default: Date.now },
    }],
    submittedAt: Date,
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ApplicationSchema.index({ status: 1, createdAt: -1 });
ApplicationSchema.index({ phoneSearchHash: 1 });
ApplicationSchema.index({ 'utmData.source': 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
