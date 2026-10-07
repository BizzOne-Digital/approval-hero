/** Canonical public site origin (no trailing slash). */
export function getSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  let base = raw.replace(/\/$/, '');

  try {
    const parsed = new URL(base);
    if (parsed.hostname === 'approvalhero.ca') {
      parsed.hostname = 'www.approvalhero.ca';
      parsed.protocol = 'https:';
      base = parsed.origin;
    }
  } catch {
    // keep raw base
  }

  return base;
}
