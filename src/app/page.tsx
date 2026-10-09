import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeHero } from '@/components/sections/HomeHero';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { publicApi } from '@/lib/api';
import { getPublishedPageBySlug } from '@/lib/cms/pages';
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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPublishedPageBySlug('home');
    if (!page) throw new Error('missing home');
    return pageSeo({
      title: page.seoTitle || 'Approval Hero | Vehicle Financing Assistance',
      description: page.seoDescription,
      path: '/',
    });
  } catch {
    return pageSeo({ path: '/' });
  }
}

export default async function HomePage() {
  const page = await getPublishedPageBySlug('home');

  const siteData = await getSiteData();
  const sections = page
    ? [...page.sections].filter((s) => s.sectionType !== 'hero').sort((a, b) => a.order - b.order)
    : [];

  return (
    <>
      <Header settings={siteData.settings} navItems={siteData.navItems} />
      <main id="main-content">
        <HomeHero />
        {sections.map((section) => (
          <SectionRenderer
            key={section._id || section.name}
            section={section}
            services={siteData.services}
            testimonials={siteData.testimonials}
            faqs={siteData.faqs}
          />
        ))}
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
