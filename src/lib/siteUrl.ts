const PRODUCTION_ORIGIN = 'https://www.approvalhero.ca';

function isDevUrl(value: string | undefined): boolean {
  if (!value) return true;
  return /localhost|127\.0\.0\.1|^http:\/\//i.test(value);
}

/** Canonical public site origin (no trailing slash). */
export function getSiteBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, '')}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  let base = candidates.find((c) => c && !isDevUrl(c)) || candidates.find(Boolean) || 'http://localhost:3000';
  base = base.replace(/\/$/, '');

  if (isDevUrl(base) && process.env.VERCEL_ENV === 'production') {
    base = PRODUCTION_ORIGIN;
  }

  try {
    const parsed = new URL(base);
    if (parsed.hostname === 'approvalhero.ca') {
      parsed.hostname = 'www.approvalhero.ca';
      parsed.protocol = 'https:';
      base = parsed.origin;
    }
  } catch {
    if (process.env.VERCEL_ENV === 'production') {
      base = PRODUCTION_ORIGIN;
    }
  }

  return base;
}
