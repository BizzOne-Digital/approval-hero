/**
 * Resolve API base URL for browser and Vercel server-side rendering.
 */
export function getApiBaseUrl(): string {
  const normalize = (url: string) => {
    const trimmed = url.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  };

  // Explicit public URL (external API host)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalize(process.env.NEXT_PUBLIC_API_URL);
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
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:5000';
}
