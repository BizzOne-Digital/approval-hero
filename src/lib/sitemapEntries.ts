import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { getSiteBaseUrl } from '@/lib/siteUrl';
import { Page } from '@server/models/Page';
import { Service } from '@server/models/Service';
import { BlogPost } from '@server/models/Blog';

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(url: string, lastModified: Date, priority: number, changeFrequency: SitemapEntry['changeFrequency']): SitemapEntry {
  return { url, lastModified, priority, changeFrequency };
}

function pagePath(slug: string): string {
  if (slug === 'home') return '/';
  return `/${slug}`;
}

/** Static fallback when MongoDB is unavailable (build / misconfigured env). */
const FALLBACK_SLUGS = [
  'home',
  'about',
  'apply',
  'services',
  'approval-programs',
  'how-it-works',
  'why-choose-us',
  'bad-credit',
  'no-credit',
  'bankruptcy',
  'self-employed',
  'newcomer',
  'zero-down',
  'gallery',
  'testimonials-faqs',
  'contact',
  'privacy',
  'terms',
  'blog',
];

export async function buildSitemapEntries(request?: Request): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl(request);
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  const add = (path: string, lastModified: Date, priority: number, changeFrequency: SitemapEntry['changeFrequency'] = 'weekly') => {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '') || '/';
    const url = normalized === '/' ? `${baseUrl}/` : `${baseUrl}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
    if (seen.has(url)) return;
    seen.add(url);
    entries.push(entry(url, lastModified, priority, changeFrequency));
  };

  try {
    await connectDB();

    const [pages, services, posts] = await Promise.all([
      Page.find({ status: 'published', noIndex: { $ne: true } }).select('slug updatedAt').lean(),
      Service.find({ status: 'published' }).select('slug updatedAt').lean(),
      BlogPost.find({ status: 'published' }).select('slug updatedAt publishedAt').lean(),
    ]);

    for (const page of pages) {
      const slug = String(page.slug || '');
      if (!slug) continue;
      const path = pagePath(slug);
      const modified = page.updatedAt ? new Date(page.updatedAt) : new Date();
      add(path, modified, path === '/' ? 1 : 0.8);
    }

    add('/apply', new Date(), 0.9, 'monthly');

    for (const service of services) {
      const slug = String(service.slug || '');
      if (!slug) continue;
      add(`/services/${slug}`, service.updatedAt ? new Date(service.updatedAt) : new Date(), 0.7);
    }

    add('/blog', new Date(), 0.75, 'weekly');
    for (const post of posts) {
      const slug = String(post.slug || '');
      if (!slug) continue;
      const modified = post.updatedAt
        ? new Date(post.updatedAt)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : new Date();
      add(`/blog/${slug}`, modified, 0.6, 'monthly');
    }
  } catch {
    for (const slug of FALLBACK_SLUGS) {
      const path = slug === 'apply' ? '/apply' : pagePath(slug === 'home' ? 'home' : slug);
      add(path, new Date(), path === '/' ? 1 : 0.8);
    }
    add('/apply', new Date(), 0.9);
  }

  entries.sort((a, b) => a.url.localeCompare(b.url));
  return entries;
}
