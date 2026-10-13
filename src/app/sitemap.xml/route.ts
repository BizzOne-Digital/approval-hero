import {
  buildSitemapEntries,
  enforceProductionSitemapUrls,
  getFallbackSitemapEntries,
} from '@/lib/sitemapEntries';
import { getSiteBaseUrl } from '@/lib/siteUrl';
import { sitemapToXml } from '@/lib/sitemapXml';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

export async function GET(request: Request) {
  try {
    const entries = await buildSitemapEntries(request);
    const urls = enforceProductionSitemapUrls(entries, request);
    if (!urls.length) {
      const fallback = getFallbackSitemapEntries(getSiteBaseUrl(request));
      return xmlResponse(sitemapToXml(fallback));
    }
    return xmlResponse(sitemapToXml(urls));
  } catch (err) {
    console.error('[sitemap.xml]', err);
    const fallback = getFallbackSitemapEntries(getSiteBaseUrl(request));
    return xmlResponse(sitemapToXml(fallback));
  }
}
