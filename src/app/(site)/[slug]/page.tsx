import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { publicApi } from '@/lib/api';
import type { GalleryImage } from '@/lib/types';
import type { Metadata } from 'next';

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

async function getPage(slug: string) {
  try {
    return await publicApi.getPage(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return { title: 'Page Not Found' };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

export default async function CmsPage({ params }: { params: { slug: string } }) {
  const needsGallery = params.slug === 'gallery';
  const [page, siteData, galleryImages] = await Promise.all([
    getPage(params.slug),
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
