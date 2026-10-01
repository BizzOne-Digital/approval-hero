import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { SiteSettings } from '../models';
import { logger } from '../utils/logger';
import { ILead } from '../models/Lead';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    const port = parseInt(env.SMTP_PORT || '587', 10);
    const secure = env.SMTP_SECURE === 'true' || port === 465;
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

function emailRow(label: string, value?: string | number | boolean | null): string {
  if (value === undefined || value === null || value === '') return '';
  return `<p><strong>${label}:</strong> ${value}</p>`;
}

const EMPLOYER_DETAIL_LABELS: Record<string, string> = {
  employerName: 'Employer Name',
  jobTitle: 'Job Title',
  startDate: 'Employment Start / Duration',
  employerPhone: 'Employer Phone',
  businessName: 'Business Name',
  industry: 'Industry',
  timeInBusiness: 'Time in Business',
  businessPhone: 'Business Phone',
  incomeSource: 'Income Source',
  timeReceiving: 'Time Receiving Income',
};

function formatEmployerDetails(details?: Record<string, string>): string {
  if (!details) return '';
  return Object.entries(details)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => emailRow(EMPLOYER_DETAIL_LABELS[k] || k, v))
    .join('');
}

function formatVehiclePreference(v?: {
  make?: string;
  model?: string;
  year?: string;
  notes?: string;
}): string {
  if (!v) return '';
  const parts = [v.year, v.make, v.model].filter(Boolean).join(' ');
  let html = '';
  if (parts) html += emailRow('Preferred Vehicle', parts);
  if (v.notes?.trim()) html += emailRow('Vehicle Notes', v.notes);
  return html;
}

function formatTradeIn(t?: {
  planning?: string;
  year?: string;
  make?: string;
  model?: string;
  kilometres?: string;
  loanBalance?: string;
  notes?: string;
  detailsSkipped?: boolean;
}): string {
  if (!t) return '';
  let html = '';
  if (t.planning) html += emailRow('Trade-In Plan', t.planning);
  if (t.detailsSkipped) html += emailRow('Trade-In Details', 'Skipped');
  const vehicle = [t.year, t.make, t.model].filter(Boolean).join(' ');
  if (vehicle) html += emailRow('Trade-In Vehicle', vehicle);
  if (t.kilometres) html += emailRow('Trade-In Kilometres', t.kilometres);
  if (t.loanBalance) html += emailRow('Trade-In Loan Balance', t.loanBalance);
  if (t.notes?.trim()) html += emailRow('Trade-In Notes', t.notes);
  return html;
}

export type ApplicationNotificationPayload = {
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  vehicleType?: string;
  knowsSpecificVehicle?: boolean;
  preferredVehicle?: { make?: string; model?: string; year?: string; notes?: string };
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
  };
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  source?: string;
  submittedAt?: Date;
};

function buildApplicationNotificationHtml(payload: ApplicationNotificationPayload): string {
  const addr = payload.address;
  const addressLine = addr
    ? [addr.street, addr.unit ? `Unit ${addr.unit}` : '', addr.city, addr.province, addr.postalCode, addr.country]
        .filter(Boolean)
        .join(', ')
    : '';

  return `
    <h2>New Financing Application</h2>
    ${emailRow('Reference', payload.referenceNumber)}
    ${emailRow('Name', payload.name)}
    ${payload.firstName || payload.lastName ? emailRow('First Name', payload.firstName) : ''}
    ${payload.firstName || payload.lastName ? emailRow('Last Name', payload.lastName) : ''}
    ${emailRow('Email', payload.email)}
    ${emailRow('Phone', payload.phone)}
    ${emailRow('Date of Birth', payload.dateOfBirth)}
    ${emailRow('Preferred Contact Method', payload.preferredContactMethod)}
    ${emailRow('Best Time to Contact', payload.bestTimeToContact)}
    ${emailRow('Vehicle Type', payload.vehicleType)}
    ${payload.knowsSpecificVehicle !== undefined ? emailRow('Knows Specific Vehicle', payload.knowsSpecificVehicle ? 'Yes' : 'No') : ''}
    ${formatVehiclePreference(payload.preferredVehicle)}
    ${formatTradeIn(payload.tradeIn)}
    ${emailRow('Down Payment Range', payload.downPaymentRange)}
    ${emailRow('Credit Situation', payload.creditCategory)}
    ${emailRow('Purchase Timeline', payload.purchaseTimeline)}
    ${emailRow('Residency Status', payload.residencyStatus)}
    ${emailRow('Employment Status', payload.employmentStatus)}
    ${emailRow('Monthly Income Range', payload.monthlyIncomeRange)}
    ${emailRow('Income Duration', payload.incomeDuration)}
    ${formatEmployerDetails(payload.employerDetails)}
    ${addressLine ? emailRow('Address', addressLine) : ''}
    ${addr?.timeAtAddress ? emailRow('Time at Address', addr.timeAtAddress) : ''}
    ${emailRow('Source', payload.source || '/apply')}
    ${emailRow('Submitted', payload.submittedAt ? payload.submittedAt.toISOString() : undefined)}
  `;
}

export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    logger.warn('SMTP not configured, cannot send OTP email');
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0866FF;">Approval Hero</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0a1628;">${code}</p>
      <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `${code} is your Approval Hero verification code`,
      html,
      text: `Your Approval Hero verification code is ${code}. It expires in 10 minutes.`,
    });
    logger.info('OTP email sent');
    return true;
  } catch (error) {
    logger.error('Failed to send OTP email:', error);
    return false;
  }
}

export async function sendApplicationNotification(payload: ApplicationNotificationPayload): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    logger.warn('SMTP not configured, skipping application notification');
    return;
  }

  const settings = await SiteSettings.findOne();
  const to = settings?.contact?.notificationEmail || env.NOTIFICATION_EMAIL || 'info@approvalhero.ca';
  if (!to) return;

  const html = buildApplicationNotificationHtml(payload);

  try {
    await transport.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `New Application ${payload.referenceNumber} - ${payload.name}`,
      html,
    });
    logger.info('Application notification email sent');
  } catch (error) {
    logger.error('Failed to send application notification:', error);
  }
}

export async function sendLeadNotification(lead: ILead): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    logger.warn('SMTP not configured, skipping email notification');
    return;
  }

  const settings = await SiteSettings.findOne();
  const to = settings?.contact?.notificationEmail || env.NOTIFICATION_EMAIL || 'info@approvalhero.ca';

  if (!to) return;

  const locationParts = [lead.address, lead.city, lead.province, lead.postalCode].filter(Boolean);
  const incomeDisplay = lead.monthlyIncome || lead.income;
  const incomeLabel = lead.incomeFrequency ? ` (${lead.incomeFrequency})` : '';

  const html = `
    <h2>New ${lead.submissionType} Submission</h2>
    ${emailRow('Name', lead.name)}
    ${lead.firstName ? emailRow('First Name', lead.firstName) : ''}
    ${lead.lastName ? emailRow('Last Name', lead.lastName) : ''}
    ${emailRow('Email', lead.email)}
    ${emailRow('Phone', lead.phone)}
    ${emailRow('Preferred Contact', lead.preferredContact)}
    ${emailRow('Date of Birth', lead.dateOfBirth)}
    ${lead.province && !lead.city ? emailRow('Province', lead.province) : ''}
    ${locationParts.length ? emailRow('Address / Location', locationParts.join(', ')) : ''}
    ${emailRow('Time at Address', lead.timeAtAddress)}
    ${emailRow('Housing Status', lead.housingStatus)}
    ${emailRow('Credit Situation', lead.creditSituation)}
    ${emailRow('Vehicle Preference', lead.vehiclePreference)}
    ${emailRow('Vehicle Type', lead.vehicleType)}
    ${lead.isEmployed !== undefined ? emailRow('Currently Employed', lead.isEmployed ? 'Yes' : 'No') : ''}
    ${emailRow('Employment Status', lead.employmentStatus)}
    ${emailRow('Employer', lead.employerName)}
    ${emailRow('Occupation', lead.occupation)}
    ${incomeDisplay ? emailRow('Income', `$${incomeDisplay}${incomeLabel}`) : ''}
    ${emailRow('Message', lead.message)}
    ${emailRow('Application Step', lead.applicationStep)}
    ${emailRow('Source', lead.sourcePage || 'Unknown')}
    ${emailRow('Submitted', lead.createdAt?.toISOString?.() ?? String(lead.createdAt))}
  `;

  try {
    await transport.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject: `New ${lead.submissionType} - ${lead.name}`,
      html,
    });
    logger.info('Lead notification email sent');
  } catch (error) {
    logger.error('Failed to send lead notification:', error);
  }
}

export async function getSmtpStatus(): Promise<{ configured: boolean; connected: boolean }> {
  const transport = getTransporter();
  if (!transport) return { configured: false, connected: false };
  try {
    await transport.verify();
    return { configured: true, connected: true };
  } catch {
    return { configured: true, connected: false };
  }
}
