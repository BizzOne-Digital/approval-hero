import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimateOnScroll } from '@/components/animations/AnimateOnScroll';
import { LeadForm } from '@/components/forms/LeadForm';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { publicApi } from '@/lib/api';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSiteData() {
  try {
    const [settings, navData] = await Promise.all([
      publicApi.getSettings(),
      publicApi.getNavigation(),
    ]);
    return { settings, navItems: navData.navigation?.headerItems || [], footerColumns: navData.navigation?.footerColumns || [] };
  } catch {
    return { settings: undefined, navItems: [], footerColumns: [] };
  }
}

export const metadata: Metadata = {
  title: 'Contact & Apply',
  description: 'Contact Approval Hero or start your vehicle financing application today.',
};

export default async function ContactPage() {
  const [page, siteData] = await Promise.all([
    publicApi.getPage('contact').catch(() => null),
    getSiteData(),
  ]);

  const general = siteData.settings?.general;
  const cmsSections = page
    ? [...page.sections]
        .filter((s) => s.sectionType !== 'hero' && s.sectionType !== 'form-section')
        .sort((a, b) => a.order - b.order)
    : [];

  return (
    <>
      <Header settings={siteData.settings} navItems={siteData.navItems} />
      <main id="main-content">
        <section className="relative pt-32 pb-20 bg-midnight overflow-hidden">
          <div className="absolute inset-0 bg-blue-glow opacity-30" />
          <div className="container-custom relative z-10">
            <AnimateOnScroll>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">Contact & Apply</h1>
              <p className="text-ice-blue text-lg max-w-2xl">
                Get in touch or start your vehicle financing application today.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        <section className="section-padding bg-electric/5">
          <div className="container-custom text-center">
            <h2 className="font-display text-2xl font-bold text-midnight mb-4">Ready to Get Pre-Approved?</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Our secure multi-step application takes about 60 seconds.
            </p>
            <Link href="/apply" className="btn-primary">
              Start Application
            </Link>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="font-display text-2xl font-bold text-midnight mb-8">Get In Touch</h2>
                <div className="space-y-6">
                  <a
                    href={`tel:${general?.phone?.replace(/\D/g, '')}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-ice-blue hover:border-electric transition-colors"
                  >
                    <Phone className="w-6 h-6 text-electric" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold text-midnight">{general?.phone || '416-700-2656'}</p>
                    </div>
                  </a>
                  <a
                    href={`mailto:${general?.email}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-ice-blue hover:border-electric transition-colors"
                  >
                    <Mail className="w-6 h-6 text-electric" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-midnight">{general?.email || 'ak_2123@hotmail.com'}</p>
                    </div>
                  </a>
                  {general?.serviceArea && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-ice-blue">
                      <MapPin className="w-6 h-6 text-electric" />
                      <div>
                        <p className="text-sm text-gray-500">Service Area</p>
                        <p className="font-semibold text-midnight">{general.serviceArea}</p>
                      </div>
                    </div>
                  )}
                  {general?.businessHours && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-ice-blue">
                      <Clock className="w-6 h-6 text-electric" />
                      <div>
                        <p className="text-sm text-gray-500">Business Hours</p>
                        <p className="font-semibold text-midnight">{general.businessHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <LeadForm variant="full" sourcePage="/contact" consentText={siteData.settings?.contact?.consentText} />
            </div>
          </div>
        </section>

        {cmsSections.map((section) => (
          <SectionRenderer
            key={section._id || section.name}
            section={section}
            settings={siteData.settings}
          />
        ))}
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
