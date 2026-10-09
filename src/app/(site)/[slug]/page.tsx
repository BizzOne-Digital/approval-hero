import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { publicApi } from '@/lib/api';
import { getPublishedPageBySlug } from '@/lib/cms/pages';
import type { GalleryImage } from '@/lib/types';
import type { Metadata } from 'next';
import { pageSeo } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSiteData() {
  try {
    const [settings, navData, services, testimonials, faqData] = await Promise.all([
      publicApi.getSettings(),
      publicApi.getNavigation(),
      publicApi.getServices(),
      publicApi.getTestimonials(),
      publicApi.getFaqs(),
    ]);
    return {
      settings,
      navItems: navData.navigation?.headerItems || [],
      footerColumns: navData.navigation?.footerColumns || [],
      services,
      testimonials,
      faqs: faqData.faqs,
    };
  } catch {
    return { settings: undefined, navItems: [], footerColumns: [], services: [], testimonials: [], faqs: [] };
  }
}

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
    getSiteData(),
    needsGallery ? getGalleryImages() : Promise.resolve([]),
  ]);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="text-center">
          <h1 className="font-display text-6xl text-electric mb-4">404</h1>
          <p className="text-white/60">Page not found</p>
        </div>
      </div>
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
