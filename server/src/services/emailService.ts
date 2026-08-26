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
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587', 10),
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendApplicationNotification(payload: {
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  vehicleType?: string;
  creditCategory?: string;
}): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    logger.warn('SMTP not configured, skipping application notification');
    return;
  }

  const settings = await SiteSettings.findOne();
  const to = settings?.contact?.notificationEmail || env.NOTIFICATION_EMAIL;
  if (!to) return;

  const html = `
    <h2>New Financing Application</h2>
    <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    <p><strong>Name:</strong> ${payload.name}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Phone:</strong> ${payload.phone}</p>
    ${payload.vehicleType ? `<p><strong>Vehicle Type:</strong> ${payload.vehicleType}</p>` : ''}
    ${payload.creditCategory ? `<p><strong>Credit:</strong> ${payload.creditCategory}</p>` : ''}
    <p><strong>Source:</strong> /apply</p>
  `;

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
  const to = settings?.contact?.notificationEmail || env.NOTIFICATION_EMAIL;

  if (!to) return;

  const html = `
    <h2>New ${lead.submissionType} Submission</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Phone:</strong> ${lead.phone}</p>
    ${lead.province ? `<p><strong>Province:</strong> ${lead.province}</p>` : ''}
    ${lead.creditSituation ? `<p><strong>Credit Situation:</strong> ${lead.creditSituation}</p>` : ''}
    ${lead.vehiclePreference ? `<p><strong>Vehicle Preference:</strong> ${lead.vehiclePreference}</p>` : ''}
    ${lead.preferredContact ? `<p><strong>Preferred Contact:</strong> ${lead.preferredContact}</p>` : ''}
    ${lead.vehicleType ? `<p><strong>Vehicle Type:</strong> ${lead.vehicleType}</p>` : ''}
    ${lead.city ? `<p><strong>City:</strong> ${lead.city}, ${lead.province || ''} ${lead.postalCode || ''}</p>` : ''}
    ${lead.employmentStatus ? `<p><strong>Employment:</strong> ${lead.employmentStatus}${lead.employerName ? ` at ${lead.employerName}` : ''}</p>` : ''}
    ${lead.monthlyIncome ? `<p><strong>Monthly Income:</strong> $${lead.monthlyIncome}</p>` : ''}
    ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
    <p><strong>Source:</strong> ${lead.sourcePage || 'Unknown'}</p>
    <p><strong>Submitted:</strong> ${lead.createdAt}</p>
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
