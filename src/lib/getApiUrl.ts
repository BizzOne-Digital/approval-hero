/**
 * Resolve API base URL for browser and Vercel server-side rendering.
 * On Vercel, NEXT_PUBLIC_API_URL must point to your live API (not localhost).
 */
export function getApiBaseUrl(): string {
  const normalize = (url: string) => {
    const trimmed = url.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  };

  // Server-side (SSR on Vercel): allow dedicated server-only URL
  if (typeof window === 'undefined') {
    const serverUrl = process.env.API_URL || process.env.INTERNAL_API_URL;
    if (serverUrl) return normalize(serverUrl);
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl) return normalize(publicUrl);

  return 'http://localhost:5000/api';
}
