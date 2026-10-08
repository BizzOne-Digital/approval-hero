import type { Metadata } from 'next';
import { getSiteBaseUrl } from '@/lib/siteUrl';

function absolutePageUrl(base: string, path: string): string {
  const normalized = path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return normalized === '/' ? `${base}/` : `${base}${normalized}`;
}

export function pageSeo(options: {
  title?: string | null;
  description?: string | null;
  path: string;
  request?: Request;
}): Metadata {
  const base = getSiteBaseUrl(options.request);
  const url = absolutePageUrl(base, options.path);
  const title = options.title || undefined;
  const description = options.description || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
      type: 'website',
      siteName: 'Approval Hero',
    },
  };
}
