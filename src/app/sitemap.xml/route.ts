import { buildSitemapEntries } from '@/lib/sitemapEntries';
import { sitemapToXml } from '@/lib/sitemapXml';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const entries = await buildSitemapEntries(request);
  const xml = sitemapToXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
