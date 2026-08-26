import { Application, IApplication } from '../models/Application';
import { ApplicationActivity } from '../models/ApplicationActivity';
import {
  encryptField,
  decryptField,
  hashForSearch,
  hashToken,
  generatePublicToken,
  generateReferenceNumber,
} from '../utils/encryption';
import { sendApplicationOtp, verifyApplicationOtp } from './otpService';
import { sendApplicationNotification } from './emailService';
import { getApplicationSettings } from './applicationSettingsService';

const SESSION_DAYS = 30;

export async function findApplicationByToken(token: string, options?: { allowSubmitted?: boolean }) {
  const hash = hashToken(token);
  const statusFilter = options?.allowSubmitted
    ? { $nin: ['Closed', 'Spam'] as const }
    : { $nin: ['Submitted', 'Closed', 'Spam'] as const };
  return Application.findOne({ publicTokenHash: hash, isArchived: false, status: statusFilter });
}

export async function startApplicationSession(meta: {
  source?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceCategory?: string;
}) {
  const token = generatePublicToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const app = await Application.create({
    publicTokenHash: hashToken(token),
    status: 'Started',
    currentStep: 'vehicleType',
    completedSteps: [],
    phoneVerified: false,
    emailVerified: false,
    consentRecords: [],
    internalNotes: [],
    lastActivityAt: new Date(),
    expiresAt,
    source: meta.source || 'apply',
    referrer: meta.referrer,
    utmData: {
      source: meta.utmSource,
      medium: meta.utmMedium,
      campaign: meta.utmCampaign,
    },
    deviceCategory: meta.deviceCategory,
  });

  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'application_started',
    description: 'Application session created',
  });

  return { token, applicationId: app.id, currentStep: app.currentStep, status: app.status };
}

export function sanitizeApplicationForClient(app: IApplication, settings?: Awaited<ReturnType<typeof getApplicationSettings>>) {
  const decryptAddress = app.address ? {
    city: app.address.city,
    province: app.address.province,
    country: app.address.country,
    timeAtAddress: app.address.timeAtAddress,
    entryMode: app.address.entryMode,
    street: app.address.street ? decryptField(app.address.street) : '',
    unit: app.address.unit ? decryptField(app.address.unit) : '',
    postalCode: app.address.postalCode ? decryptField(app.address.postalCode) : '',
  } : undefined;

  return {
    id: app.id,
    status: app.status,
    currentStep: app.currentStep,
    completedSteps: app.completedSteps,
    referenceNumber: app.referenceNumber,
    phoneVerified: app.phoneVerified,
    emailVerified: app.emailVerified,
    vehicleType: app.vehicleType,
    knowsSpecificVehicle: app.knowsSpecificVehicle,
    preferredVehicle: app.preferredVehicle,
    tradeIn: app.tradeIn,
    downPaymentRange: app.downPaymentRange,
    creditCategory: app.creditCategory,
    purchaseTimeline: app.purchaseTimeline,
    residencyStatus: app.residencyStatus,
    employmentStatus: app.employmentStatus,
    monthlyIncomeRange: app.monthlyIncomeRange,
    incomeDuration: app.incomeDuration,
    employerDetails: app.employerDetails,
    address: decryptAddress,
    firstName: app.firstName,
    lastName: app.lastName,
    preferredContactMethod: app.preferredContactMethod,
    bestTimeToContact: app.bestTimeToContact,
    hasEmail: !!app.encryptedEmail,
    hasPhone: !!app.encryptedPhone,
    hasDob: !!app.encryptedDateOfBirth,
    email: app.encryptedEmail ? decryptField(app.encryptedEmail) : undefined,
    phone: app.encryptedPhone ? decryptField(app.encryptedPhone) : undefined,
    dateOfBirth: app.encryptedDateOfBirth ? decryptField(app.encryptedDateOfBirth) : undefined,
    marketingConsent: app.marketingConsent,
    settings: settings ? {
      vehicleTypes: settings.vehicleTypes.filter((v) => v.enabled !== false),
      downPaymentOptions: settings.downPaymentOptions.filter((v) => v.enabled !== false),
      creditCategories: settings.creditCategories.filter((v) => v.enabled !== false),
      purchaseTimelines: settings.purchaseTimelines.filter((v) => v.enabled !== false),
      residencyStatuses: settings.residencyStatuses.filter((v) => v.enabled !== false),
      employmentStatuses: settings.employmentStatuses.filter((v) => v.enabled !== false),
      incomeRanges: settings.incomeRanges.filter((v) => v.enabled !== false),
      incomeDurations: settings.incomeDurations.filter((v) => v.enabled !== false),
      contactMethods: settings.contactMethods.filter((v) => v.enabled !== false),
      bestTimeOptions: settings.bestTimeOptions.filter((v) => v.enabled !== false),
      consentWording: settings.consentWording,
      successMessage: settings.successMessage,
      trustIndicators: settings.trustIndicators,
      downPaymentDisclaimer: settings.downPaymentDisclaimer,
      privacyNotice: settings.privacyNotice,
    } : undefined,
  };
}

export async function saveApplicationStep(token: string, stepId: string, data: Record<string, unknown>) {
  const app = await findApplicationByToken(token);
  if (!app) throw new Error('Session not found or expired');

  if (['Submitted', 'Closed', 'Spam'].includes(app.status)) {
    throw new Error('Application already submitted');
  }

  switch (stepId) {
    case 'vehicleType':
      app.vehicleType = String(data.vehicleType || '');
      break;
    case 'knowsSpecificVehicle':
      app.knowsSpecificVehicle = data.knowsSpecificVehicle === true || data.knowsSpecificVehicle === 'yes';
      break;
    case 'preferredVehicle':
      app.preferredVehicle = {
        make: String(data.make || ''),
        model: String(data.model || ''),
        year: data.year ? String(data.year) : undefined,
        notes: data.notes ? String(data.notes) : undefined,
      };
      if (!app.preferredVehicle.make || !app.preferredVehicle.model) {
        throw new Error('Vehicle make and model are required');
      }
      break;
    case 'tradeIn':
      app.tradeIn = {
        planning: String(data.planning || ''),
        year: data.year ? String(data.year) : undefined,
        make: data.make ? String(data.make) : undefined,
        model: data.model ? String(data.model) : undefined,
        kilometres: data.kilometres ? String(data.kilometres) : undefined,
        loanBalance: data.loanBalance ? String(data.loanBalance) : undefined,
        notes: data.notes ? String(data.notes) : undefined,
        detailsSkipped: data.detailsSkipped === true,
      };
      break;
    case 'tradeInDetails':
      app.tradeIn = {
        ...app.tradeIn,
        planning: app.tradeIn?.planning || 'yes',
        year: data.year ? String(data.year) : undefined,
        make: data.make ? String(data.make) : undefined,
        model: data.model ? String(data.model) : undefined,
        kilometres: data.kilometres ? String(data.kilometres) : undefined,
        loanBalance: data.loanBalance ? String(data.loanBalance) : undefined,
        notes: data.notes ? String(data.notes) : undefined,
        detailsSkipped: data.detailsSkipped === true,
      };
      break;
    case 'downPayment':
      app.downPaymentRange = String(data.downPaymentRange || '');
      break;
    case 'creditSituation':
      app.creditCategory = String(data.creditCategory || '');
      break;
    case 'purchaseTiming':
      app.purchaseTimeline = String(data.purchaseTimeline || '');
      break;
    case 'residencyStatus':
      app.residencyStatus = String(data.residencyStatus || '');
      break;
    case 'employmentStatus':
      app.employmentStatus = String(data.employmentStatus || '');
      break;
    case 'monthlyIncome':
      app.monthlyIncomeRange = String(data.monthlyIncomeRange || '');
      break;
    case 'incomeDuration':
      app.incomeDuration = String(data.incomeDuration || '');
      break;
    case 'employmentDetails':
      app.employerDetails = data as Record<string, string>;
      break;
    case 'address':
      app.address = {
        street: encryptField(String(data.street || '')),
        unit: data.unit ? encryptField(String(data.unit)) : undefined,
        city: String(data.city || ''),
        province: String(data.province || 'ON'),
        postalCode: encryptField(String(data.postalCode || '')),
        country: String(data.country || 'Canada'),
        timeAtAddress: String(data.timeAtAddress || ''),
        entryMode: (data.entryMode as 'autocomplete' | 'manual') || 'manual',
      };
      break;
    case 'dateOfBirth': {
      const month = Number(data.month);
      const day = Number(data.day);
      const year = Number(data.year);
      const dob = new Date(year, month - 1, day);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) throw new Error('Invalid date of birth');
      const age = new Date().getFullYear() - year;
      if (age < 18) throw new Error('Applicant must be 18 or older');
      app.encryptedDateOfBirth = encryptField(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      break;
    }
    case 'contactDetails': {
      const phone = String(data.phone || '').replace(/\D/g, '');
      const email = String(data.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Valid email required');
      if (phone.length < 10) throw new Error('Valid Canadian phone required');
      app.firstName = String(data.firstName || '').trim();
      app.lastName = String(data.lastName || '').trim();
      app.encryptedEmail = encryptField(email);
      app.encryptedPhone = encryptField(phone);
      app.phoneSearchHash = hashForSearch(phone);
      app.preferredContactMethod = String(data.preferredContactMethod || 'phone');
      app.bestTimeToContact = String(data.bestTimeToContact || '');
      app.phoneVerified = false;
      app.emailVerified = false;
      break;
    }
    default:
      throw new Error('Unknown step');
  }

  if (!app.completedSteps.includes(stepId)) {
    app.completedSteps.push(stepId);
  }
  app.currentStep = String(data.nextStep || stepId);
  app.status = app.status === 'Started' ? 'Draft' : app.status;
  app.lastActivityAt = new Date();
  await app.save();

  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'application_step_completed',
    description: `Completed step: ${stepId}`,
    metadata: { stepId },
  });

  return app;
}

export async function requestOtp(token: string, ipAddress?: string) {
  const app = await findApplicationByToken(token);
  if (!app || !app.encryptedEmail) throw new Error('Email address required before verification');
  const email = decryptField(app.encryptedEmail);
  const result = await sendApplicationOtp({ applicationId: app.id, email, ipAddress });
  if (result.sent) {
    app.status = 'OTP Sent';
    app.lastActivityAt = new Date();
    await app.save();
    await ApplicationActivity.create({
      applicationId: app._id,
      action: 'email_verification_requested',
      description: 'Verification code sent by email',
    });
  }
  return result;
}

export async function confirmOtp(token: string, code: string) {
  const app = await findApplicationByToken(token);
  if (!app || !app.encryptedEmail) throw new Error('Invalid session');
  const email = decryptField(app.encryptedEmail);
  const verified = await verifyApplicationOtp({ applicationId: app.id, email, code });
  if (!verified) throw new Error('Invalid or expired verification code');
  app.emailVerified = true;
  app.emailVerifiedAt = new Date();
  app.status = 'Email Verified';
  app.lastActivityAt = new Date();
  await app.save();
  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'email_verified',
    description: 'Email verified successfully',
  });
  return app;
}

export async function submitApplication(token: string, consents: {
  accuracy: boolean;
  contact: boolean;
  privacy: boolean;
  partnerShare: boolean;
  marketing?: boolean;
}) {
  const app = await findApplicationByToken(token);
  if (!app) throw new Error('Session not found');
  if (app.status === 'Submitted') throw new Error('Application already submitted');
  if (!app.emailVerified && !app.phoneVerified) throw new Error('Email verification required');
  if (!consents.accuracy || !consents.contact || !consents.privacy || !consents.partnerShare) {
    throw new Error('All required consents must be accepted');
  }

  const settings = await getApplicationSettings();
  const now = new Date();
  app.consentRecords = [
    { type: 'accuracy', accepted: true, version: settings.consentWording.version, acceptedAt: now },
    { type: 'contact', accepted: true, version: settings.consentWording.version, acceptedAt: now },
    { type: 'privacy', accepted: true, version: settings.consentWording.version, acceptedAt: now },
    { type: 'partnerShare', accepted: true, version: settings.consentWording.version, acceptedAt: now },
  ];
  if (consents.marketing) {
    app.consentRecords.push({ type: 'marketing', accepted: true, version: settings.consentWording.version, acceptedAt: now });
    app.marketingConsent = true;
  }

  app.referenceNumber = generateReferenceNumber();
  app.status = 'Submitted';
  app.submittedAt = now;
  app.lastActivityAt = now;
  await app.save();

  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'application_submitted',
    description: 'Application submitted',
    newStatus: 'Submitted',
  });

  const email = app.encryptedEmail ? decryptField(app.encryptedEmail) : '';
  const phone = app.encryptedPhone ? decryptField(app.encryptedPhone) : '';
  await sendApplicationNotification({
    referenceNumber: app.referenceNumber!,
    name: `${app.firstName} ${app.lastName}`,
    email,
    phone,
    vehicleType: app.vehicleType,
    creditCategory: app.creditCategory,
  });

  return {
    referenceNumber: app.referenceNumber,
    successMessage: settings.successMessage,
  };
}

export async function getApplicationSession(token: string) {
  const app = await findApplicationByToken(token, { allowSubmitted: true });
  if (!app) throw new Error('Session not found or expired');
  const settings = await getApplicationSettings();
  return sanitizeApplicationForClient(app, settings);
}

export function decryptApplicationForAdmin(app: IApplication) {
  return {
  ...app.toObject(),
    encryptedEmail: app.encryptedEmail ? decryptField(app.encryptedEmail) : undefined,
    encryptedPhone: app.encryptedPhone ? decryptField(app.encryptedPhone) : undefined,
    encryptedDateOfBirth: app.encryptedDateOfBirth ? decryptField(app.encryptedDateOfBirth) : undefined,
    address: app.address ? {
      ...app.address,
      street: app.address.street ? decryptField(app.address.street) : '',
      unit: app.address.unit ? decryptField(app.address.unit) : '',
      postalCode: app.address.postalCode ? decryptField(app.address.postalCode) : '',
    } : undefined,
  };
}
