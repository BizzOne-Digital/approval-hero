import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimateOnScroll } from '@/components/animations/AnimateOnScroll';
import { loadPublicSiteData } from '@/lib/cms/siteContent';
import { getPublishedServiceBySlug } from '@/lib/cms/services';
import { SectionSideImage } from '@/components/sections/SectionSideImage';
import { getImageUrl } from '@/lib/utils';
import type { Metadata } from 'next';
import { pageSeo } from '@/lib/seo';
import { CheckCircle } from 'lucide-react';

import { resolveRouteSlug, type SlugRouteParams } from '@/lib/api/routeParams';

export async function generateMetadata({ params }: SlugRouteParams): Promise<Metadata> {
  try {
    const slug = await resolveRouteSlug(params);
    const service = await getPublishedServiceBySlug(slug);
    if (!service) throw new Error('not found');
    return pageSeo({
      title: service.detailPage?.seoTitle || service.title,
      description: service.detailPage?.seoDescription || service.shortDescription,
      path: `/services/${slug}`,
    });
  } catch {
    return { title: 'Service' };
  }
}

export default async function ServiceDetailPage({ params }: SlugRouteParams) {
  const slug = await resolveRouteSlug(params);
  const [service, siteData] = await Promise.all([
    getPublishedServiceBySlug(slug),
    loadPublicSiteData(),
  ]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="text-center text-white">
          <h1 className="font-display text-4xl mb-4">Service Not Found</h1>
          <Link href="/services" className="btn-primary">View All Services</Link>
        </div>
      </div>
    );
  }

  const detail = service.detailPage;
  const heroBg = detail?.heroBackgroundImage?.url ? getImageUrl(detail.heroBackgroundImage.url) : service.cardImage?.url ? getImageUrl(service.cardImage.url) : '';

  return (
    <>
      <Header settings={siteData.settings} navItems={siteData.navItems} />
      <main id="main-content">
        <section className="relative min-h-[60vh] flex items-end overflow-hidden">
          {heroBg && <Image src={heroBg} alt="" fill className="object-cover" priority />}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/30" />
          <div className="container-custom relative z-10 pt-32 pb-16">
            {detail?.heroEyebrow && <span className="text-electric font-display uppercase tracking-widest text-sm">{detail.heroEyebrow}</span>}
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mt-2 mb-4">
              {detail?.heroTitle || service.title}
            </h1>
            {(detail?.heroSubtitle || service.shortDescription) && (
              <p className="text-ice-blue text-lg max-w-2xl">{detail?.heroSubtitle || service.shortDescription}</p>
            )}
          </div>
        </section>

        {detail?.introduction && (
          <section className="section-padding">
            <div className="container-custom max-w-4xl">
              <AnimateOnScroll>
                <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: detail.introduction }} />
              </AnimateOnScroll>
            </div>
          </section>
        )}

        {detail?.whoIsFor && (
          <section className="section-padding bg-soft">
            <div className="container-custom">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <AnimateOnScroll>
                  <h2 className="font-display text-3xl font-bold text-midnight mb-6">Who This Is For</h2>
                  <div className="prose text-gray-600" dangerouslySetInnerHTML={{ __html: detail.whoIsFor }} />
                </AnimateOnScroll>
                {detail.sectionImages?.[0]?.url && (
                  <AnimateOnScroll direction="right">
                    <SectionSideImage
                      src={getImageUrl(detail.sectionImages[0].url)}
                      alt={detail.sectionImages[0].alt || ''}
                      className="w-full h-auto rounded-lg shadow-lg ring-1 ring-black/5 bg-soft"
                    />
                  </AnimateOnScroll>
                )}
              </div>
            </div>
          </section>
        )}

        {detail?.process && detail.process.length > 0 && (
          <section className="section-padding bg-midnight">
            <div className="container-custom">
              <h2 className="font-display text-3xl font-bold text-white text-center mb-12">How It Works</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {detail.process.map((step) => (
                  <AnimateOnScroll key={step.step}>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-electric/20 border-2 border-electric flex items-center justify-center mx-auto mb-4">
                        <span className="font-display text-xl font-bold text-electric">{step.step}</span>
                      </div>
                      <h3 className="font-display text-lg text-white mb-2">{step.title}</h3>
                      <p className="text-white/60 text-sm">{step.description}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}

        {detail?.benefits && detail.benefits.length > 0 && (
          <section className="section-padding">
            <div className="container-custom max-w-3xl">
              <h2 className="font-display text-3xl font-bold text-midnight text-center mb-8">Benefits</h2>
              <ul className="space-y-4">
                {detail.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="relative py-24 bg-deep-navy">
          <div className="container-custom text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              {detail?.ctaTitle || 'Ready to Get Started?'}
            </h2>
            <p className="text-ice-blue mb-8 max-w-xl mx-auto">
              {detail?.ctaDescription || 'Start your application today. Approval subject to lender criteria.'}
            </p>
            <Link href="/apply" className="btn-primary">Apply Now</Link>
          </div>
        </section>
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
