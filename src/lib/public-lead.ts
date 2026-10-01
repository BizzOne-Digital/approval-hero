import { Lead } from '@server/models/Lead';
import { SiteSettings } from '@server/models/SiteSettings';
import { sendLeadNotification } from '@server/services/emailService';

export async function createLeadFromBody(
  body: Record<string, unknown>,
  submissionType: 'contact' | 'application' | 'lead',
) {
  const payload = { ...body };
  if (!payload.name && payload.firstName && payload.lastName) {
    payload.name = `${payload.firstName} ${payload.lastName}`.trim();
  }

  const lead = await Lead.create({
    submissionType,
    ...payload,
    status: 'New',
  });

  sendLeadNotification(lead).catch(() => {});

  const settings = await SiteSettings.findOne();
  const message =
    settings?.contact?.successMessage ||
    (submissionType === 'application' ? 'Application received!' : 'Thank you!');

  return { id: lead.id, message };
}
