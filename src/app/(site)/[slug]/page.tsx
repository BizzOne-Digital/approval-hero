import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { publicApi } from '@/lib/api';
import { getPublishedPageBySlug, isDatabaseConfigured } from '@/lib/cms/pages';
import { loadPublicSiteData } from '@/lib/cms/siteContent';
import type { GalleryImage } from '@/lib/types';
import type { Metadata } from 'next';
import { pageSeo } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const data = await publicApi.getGallery();
    return data.images || [];
  } catch {
    return [];
  }
}

import { resolveRouteSlug, type SlugRouteParams } from '@/lib/api/routeParams';

export async function generateMetadata({ params }: SlugRouteParams): Promise<Metadata> {
  const slug = await resolveRouteSlug(params);
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: 'Page Not Found' };
  return pageSeo({
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    path: `/${slug}`,
  });
}

export default async function CmsPage({ params }: SlugRouteParams) {
  const slug = await resolveRouteSlug(params);
  const needsGallery = slug === 'gallery';
  const [page, siteData, galleryImages] = await Promise.all([
    getPublishedPageBySlug(slug),
    loadPublicSiteData(),
    needsGallery ? getGalleryImages() : Promise.resolve([]),
  ]);

  if (!page) {
    const missingDb = !isDatabaseConfigured();
    return (
      <>
        <Header settings={siteData.settings} navItems={siteData.navItems} />
        <main id="main-content" className="min-h-[70vh] flex items-center justify-center bg-midnight pt-24 pb-16 px-5">
          <div className="text-center max-w-lg">
            <h1 className="font-display text-6xl text-electric mb-4">404</h1>
            <p className="text-white/60 mb-4">
              {missingDb
                ? 'This page could not load because the database is not connected locally.'
                : 'Page not found or not published.'}
            </p>
            {missingDb && (
              <p className="text-white/45 text-sm leading-relaxed">
                Copy <code className="text-electric/90">.env.example</code> to <code className="text-electric/90">.env</code>, set{' '}
                <code className="text-electric/90">MONGO_URI</code>, then run{' '}
                <code className="text-electric/90">npm run dev</code> (web + API). Use the same Atlas URI as Vercel production.
              </p>
            )}
          </div>
        </main>
        <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
      </>
    );
  }

  const sections = [...page.sections].sort((a, b) => a.order - b.order);

  return (
    <>
      <Header settings={siteData.settings} navItems={siteData.navItems} />
      <main id="main-content">
        {sections.map((section) => (
          <SectionRenderer
            key={section._id || section.name}
            section={section}
            services={siteData.services}
            testimonials={siteData.testimonials}
            faqs={siteData.faqs}
            galleryImages={galleryImages}
            settings={siteData.settings}
          />
        ))}
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
