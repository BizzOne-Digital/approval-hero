/**
 * Resolve API base URL for browser and Vercel server-side rendering.
 */
export function getApiBaseUrl(): string {
  const normalize = (url: string) => {
    const trimmed = url.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  };

  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  const isLocalhost = publicUrl && /localhost|127\.0\.0\.1/i.test(publicUrl);

  // Browser: same-origin /api unless a real production API URL is configured
  if (typeof window !== 'undefined') {
    if (!publicUrl || isLocalhost) {
      return `${window.location.origin}/api`;
    }
    return normalize(publicUrl);
  }

  // Explicit public URL (external API host) — ignore localhost on Vercel SSR
  if (publicUrl && !(process.env.VERCEL_URL && isLocalhost)) {
    return normalize(publicUrl);
  }

  // Vercel: use built-in Next.js API routes on same domain
  if (process.env.VERCEL_URL) {
    return normalize(`https://${process.env.VERCEL_URL}`);
  }

  // Server-side fallback
  if (typeof window === 'undefined') {
    const serverUrl = process.env.API_URL || process.env.INTERNAL_API_URL;
    if (serverUrl) return normalize(serverUrl);
  }

  // Local dev: Express API
  return 'http://localhost:5000/api';
}

/**
 * Base URL for uploads (no /api suffix).
 */
export function getUploadsBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_UPLOADS_URL) {
    return process.env.NEXT_PUBLIC_UPLOADS_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:5000';
}
