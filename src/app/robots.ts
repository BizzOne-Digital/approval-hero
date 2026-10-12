import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getSiteBaseUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function robots(): MetadataRoute.Robots {
  const host = headers().get('host')?.split(':')[0]?.toLowerCase();
  if (host && /\.vercel\.app$/i.test(host)) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  const base = getSiteBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
