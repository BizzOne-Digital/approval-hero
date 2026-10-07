import { getSiteBaseUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const base = getSiteBaseUrl();
  const body = `User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${base}/sitemap.xml
Host: ${base}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
