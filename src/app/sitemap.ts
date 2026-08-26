import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const pages = [
    '',
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

  return pages.map((p) => ({
    url: `${baseUrl}/${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
}
