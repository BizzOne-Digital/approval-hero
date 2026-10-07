const PRODUCTION_ORIGIN = 'https://www.approvalhero.ca';

function isDevUrl(value: string | undefined): boolean {
  if (!value) return true;
  return /localhost|127\.0\.0\.1|^http:\/\//i.test(value);
}

function isPreviewHost(value: string): boolean {
  return /\.vercel\.app$/i.test(new URL(value).hostname);
}

function canonicalizeHost(base: string): string {
  try {
    const parsed = new URL(base);
    if (parsed.hostname === 'approvalhero.ca') {
      parsed.hostname = 'www.approvalhero.ca';
      parsed.protocol = 'https:';
    }
    return parsed.origin;
  } catch {
    return base;
  }
}

/** Canonical public site origin (no trailing slash). */
export function getSiteBaseUrl(request?: Request): string {
  if (request) {
    const forwarded = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const hostname = forwarded?.split(':')[0]?.toLowerCase();
    if (hostname === 'approvalhero.ca' || hostname === 'www.approvalhero.ca') {
      return PRODUCTION_ORIGIN;
    }
  }

  const explicit = [process.env.NEXT_PUBLIC_SITE_URL, process.env.FRONTEND_URL]
    .filter((c): c is string => Boolean(c && !isDevUrl(c)))
    .find((c) => {
      try {
        return !isPreviewHost(c);
      } catch {
        return true;
      }
    });

  if (explicit) {
    return canonicalizeHost(explicit.replace(/\/$/, ''));
  }

  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_ORIGIN;
  }

  const fallback = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  return canonicalizeHost(fallback.replace(/\/$/, ''));
}
