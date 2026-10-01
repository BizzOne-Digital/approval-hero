import mongoose, { Schema, Document } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Follow-Up' | 'Converted' | 'Closed' | 'Spam';
export type SubmissionType = 'contact' | 'application' | 'lead';

export interface ILead extends Document {
  submissionType: SubmissionType;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  preferredContact?: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  timeAtAddress?: string;
  housingStatus?: string;
  dateOfBirth?: string;
  creditSituation?: string;
  vehiclePreference?: string;
  vehicleType?: string;
  employmentStatus?: string;
  employerName?: string;
  occupation?: string;
  income?: string;
  incomeFrequency?: string;
  monthlyIncome?: string;
  isEmployed?: boolean;
  message?: string;
  consent: boolean;
  sourcePage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  applicationStep?: string;
  status: LeadStatus;
  assignedNote?: string;
  internalNotes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    submissionType: { type: String, enum: ['contact', 'application', 'lead'], required: true },
    name: { type: String, required: true, trim: true },
    firstName: String,
    lastName: String,
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    preferredContact: String,
    province: String,
    city: String,
    address: String,
    postalCode: String,
    timeAtAddress: String,
    housingStatus: String,
    dateOfBirth: String,
    creditSituation: String,
    vehiclePreference: String,
    vehicleType: String,
    employmentStatus: String,
    employerName: String,
    occupation: String,
    income: String,
    incomeFrequency: String,
    monthlyIncome: String,
    isEmployed: Boolean,
    message: String,
    consent: { type: Boolean, required: true },
    sourcePage: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    applicationStep: String,
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Follow-Up', 'Converted', 'Closed', 'Spam'],
      default: 'New',
    },
    assignedNote: String,
    internalNotes: String,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ email: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
