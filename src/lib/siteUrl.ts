const PRODUCTION_ORIGIN = 'https://www.approvalhero.ca';

/** Known Vercel preview hosts → canonical production origin (SEO). */
const VERCEL_HOST_TO_ORIGIN: Record<string, string> = {
  'approval-hero-nb2m.vercel.app': PRODUCTION_ORIGIN,
  'approvalhero.vercel.app': PRODUCTION_ORIGIN,
};

const APEX_TO_ORIGIN: Record<string, string> = {
  'approvalhero.ca': PRODUCTION_ORIGIN,
};

function isDevUrl(value: string | undefined): boolean {
  if (!value) return true;
  return /localhost|127\.0\.0\.1|^http:\/\//i.test(value);
}

function hostnameFromRequest(request?: Request): string | undefined {
  const forwarded = request?.headers.get('x-forwarded-host') || request?.headers.get('host');
  return forwarded?.split(':')[0]?.toLowerCase();
}

function canonicalizeHost(base: string): string {
  try {
    const parsed = new URL(base.startsWith('http') ? base : `https://${base}`);
    const apex = parsed.hostname.replace(/^www\./, '');
    if (APEX_TO_ORIGIN[apex]) {
      return APEX_TO_ORIGIN[apex];
    }
    if (parsed.hostname === 'approvalhero.ca') {
      return PRODUCTION_ORIGIN;
    }
    if (VERCEL_HOST_TO_ORIGIN[parsed.hostname]) {
      return VERCEL_HOST_TO_ORIGIN[parsed.hostname];
    }
    if (/\.vercel\.app$/i.test(parsed.hostname)) {
      return PRODUCTION_ORIGIN;
    }
    if (parsed.hostname.startsWith('www.')) {
      parsed.protocol = 'https:';
      return parsed.origin;
    }
    if (!/localhost|127\.0\.0\.1/i.test(parsed.hostname)) {
      parsed.protocol = 'https:';
      parsed.hostname = `www.${parsed.hostname}`;
      return parsed.origin;
    }
    return parsed.origin;
  } catch {
    return base.replace(/\/$/, '');
  }
}

function originFromHostname(hostname: string): string | null {
  const lower = hostname.toLowerCase();
  if (lower === 'approvalhero.ca' || lower === 'www.approvalhero.ca') {
    return PRODUCTION_ORIGIN;
  }
  if (VERCEL_HOST_TO_ORIGIN[lower]) {
    return VERCEL_HOST_TO_ORIGIN[lower];
  }
  const apex = lower.replace(/^www\./, '');
  if (APEX_TO_ORIGIN[apex]) {
    return APEX_TO_ORIGIN[apex];
  }
  if (/\.vercel\.app$/i.test(lower)) {
    return PRODUCTION_ORIGIN;
  }
  if (/localhost|127\.0\.0\.1/i.test(lower)) {
    return null;
  }
  return canonicalizeHost(`https://${lower}`);
}

/** Canonical public site origin (no trailing slash). */
export function getSiteBaseUrl(request?: Request): string {
  const requestHost = hostnameFromRequest(request);
  if (requestHost) {
    const fromHost = originFromHostname(requestHost);
    if (fromHost) return fromHost.replace(/\/$/, '');
  }

  const explicit = [process.env.NEXT_PUBLIC_SITE_URL, process.env.FRONTEND_URL].find(
    (c): c is string => Boolean(c && !isDevUrl(c)),
  );

  if (explicit) {
    return canonicalizeHost(explicit.replace(/\/$/, ''));
  }

  if (process.env.VERCEL_ENV === 'production') {
    const vercelHost = process.env.VERCEL_URL?.toLowerCase();
    if (vercelHost) {
      const mapped = VERCEL_HOST_TO_ORIGIN[vercelHost] ?? originFromHostname(vercelHost);
      if (mapped) return mapped.replace(/\/$/, '');
    }
    return PRODUCTION_ORIGIN;
  }

  const fallback = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  return canonicalizeHost(fallback.replace(/\/$/, ''));
}
