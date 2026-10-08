import type { MetadataRoute } from 'next';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function sitemapToXml(entries: MetadataRoute.Sitemap): string {
  const body = entries
    .map((item) => {
      const lastmod = item.lastModified ? new Date(item.lastModified).toISOString() : new Date().toISOString();
      const changefreq = item.changeFrequency || 'weekly';
      const priority = item.priority ?? 0.5;
      return [
        '  <url>',
        `    <loc>${escapeXml(item.url)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
  ].join('\n');
}
