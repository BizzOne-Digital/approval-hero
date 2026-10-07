import type { MetadataRoute } from 'next';
import { buildSitemapEntries } from '@/lib/sitemapEntries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
