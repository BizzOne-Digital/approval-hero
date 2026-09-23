export const SITE_CONTACT_EMAIL = 'info@approvalhero.ca';

const STALE_EMAILS = ['ak_2123@hotmail.com', 'info@approvalhero.com'];

/** Use for display when CMS may still have an old address. */
export function resolveSiteEmail(email?: string | null): string {
  if (!email) return SITE_CONTACT_EMAIL;
  const normalized = email.trim().toLowerCase();
  if (STALE_EMAILS.includes(normalized)) return SITE_CONTACT_EMAIL;
  if (normalized.includes('hotmail.com')) return SITE_CONTACT_EMAIL;
  return email.trim();
}
