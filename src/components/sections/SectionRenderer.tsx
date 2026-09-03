'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from '@/components/animations/AnimateOnScroll';
import { LeadForm } from '@/components/forms/LeadForm';
import { getImageUrl } from '@/lib/utils';
import type { GalleryImage, PageSection, Service, SiteSettings, Testimonial, FAQ } from '@/lib/types';
import {
  ChevronRight,
  Star,
  Shield,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  UserPlus,
  FileText,
  Briefcase,
  Globe,
  DollarSign,
  Eye,
  Heart,
  Award,
  BarChart3,
  LifeBuoy,
  Gift,
  Lock,
  MapPin,
  ThumbsUp,
  Phone,
  Mail,
  Truck,
  Car,
  type LucideIcon,
} from 'lucide-react';

interface SectionRendererProps {
  section: PageSection;
  services?: Service[];
  testimonials?: Testimonial[];
  faqs?: FAQ[];
  galleryImages?: GalleryImage[];
  settings?: SiteSettings;
}

const FEATURE_ICONS: Record<string, LucideIcon> = {
  'shield-check': Shield,
  'dollar-sign': DollarSign,
  clock: Clock,
  'map-pin': MapPin,
  eye: Eye,
  heart: Heart,
  award: Award,
  'check-circle': CheckCircle,
  'trending-up': TrendingUp,
  'user-plus': UserPlus,
  'file-text': FileText,
  briefcase: Briefcase,
  globe: Globe,
  star: Star,
  'bar-chart': BarChart3,
  'life-buoy': LifeBuoy,
  gift: Gift,
  lock: Lock,
  users: Users,
  map: MapPin,
  'thumbs-up': ThumbsUp,
  phone: Phone,
  mail: Mail,
  truck: Truck,
  car: Car,
};

export function SectionRenderer({ section, services, testimonials, faqs, galleryImages, settings }: SectionRendererProps) {
  if (!section.isVisible) return null;

  switch (section.sectionType) {
    case 'hero':
      return <HeroSection section={section} />;
    case 'features':
      return <FeaturesSection section={section} />;
    case 'process-steps':
      return <ProcessRoad section={section} />;
    case 'form-section':
      return <FormSection section={section} settings={settings} />;
    case 'gallery-grid':
      return <GalleryGrid section={section} galleryImages={galleryImages} />;
    case 'trust-strip':
      return <TrustStrip section={section} />;
    case 'story-timeline':
      return <StoryTimeline section={section} />;
    case 'services-grid':
      return <ServicesGrid section={section} services={services} />;
    case 'process-road':
      return <ProcessRoad section={section} />;
    case 'who-we-help':
      return <WhoWeHelp section={section} />;
    case 'zero-down':
      return <ZeroDownFeature section={section} />;
    case 'gallery-preview':
      return <GalleryPreview section={section} />;
    case 'testimonials-slider':
      return <TestimonialsSlider section={section} testimonials={testimonials} />;
    case 'faq-preview':
      return <FaqPreview section={section} faqs={faqs} />;
    case 'cta-banner':
      return <CtaBanner section={section} />;
    case 'content-block':
      return <ContentBlock section={section} />;
    case 'image-text':
      return <ImageText section={section} />;
    case 'stats':
      return <StatsSection section={section} />;
    case 'cards-grid':
      return <CardsGrid section={section} />;
    default:
      return <ContentBlock section={section} />;
  }
}

function HeroSection({ section }: { section: PageSection }) {
  const bg = section.backgroundImage?.url
    ? getImageUrl(section.backgroundImage.url)
    : '/images/hero-bg.png';
  const isInner = section.metadata?.innerPage === true;
  const isMinimal = section.metadata?.minimalHero === true;
  const isMarketingHero = !isInner && !isMinimal;
  const eyebrow = section.eyebrow || (isMinimal ? '' : 'Vehicle Financing Support');
  const heading = section.heading || (isMinimal ? '' : 'Denied Financing?');
  const subheading = section.subheading || (isMinimal ? '' : 'Your Road Forward Starts Here.');
  const body = section.body ?? '';
  const ctaLabel = section.ctaLabel ?? (isMarketingHero ? 'Get Pre-Qualified' : '');
  const ctaLink = section.ctaLink ?? (isMarketingHero ? '/apply' : '');
  const showCtas = Boolean(ctaLabel && ctaLink);

  return (
    <section className={`relative flex items-center overflow-hidden ${isInner ? 'min-h-[72vh]' : 'min-h-screen'}`}>
      <Image
        src={bg}
        alt={section.backgroundImage?.alt || 'Vehicle financing hero'}
        fill
        className="object-cover object-center md:object-right scale-105"
        priority
        quality={90}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isInner
            ? 'linear-gradient(105deg, rgba(3,13,26,0.94) 0%, rgba(4,21,45,0.82) 45%, rgba(4,21,45,0.35) 70%, transparent 100%)'
            : undefined,
        }}
      />
      {!isInner && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#030d1a]/95 via-[#04152D]/75 to-[#04152D]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030d1a]/60 via-transparent to-[#030d1a]/30" />
        </>
      )}
      {isInner && (
        <div
          className="absolute left-0 top-1/2 w-[min(640px,60vw)] h-[2px] pointer-events-none opacity-70"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(8,102,255,0.6), transparent)',
            boxShadow: '0 0 20px rgba(8,102,255,0.35)',
          }}
          aria-hidden="true"
        />
      )}

      <div className={`max-w-[1400px] mx-auto px-5 lg:px-8 relative z-10 w-full ${isInner ? 'pt-32 pb-20 md:pt-36' : 'pt-28 pb-16 md:pt-36 md:pb-24'}`}>
        <div className={`max-w-2xl ${isInner ? '' : ''}`}>
          <AnimateOnScroll>
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <span className="w-10 h-[2px] bg-electric flex-shrink-0" aria-hidden="true" />
              <span className="font-display text-electric text-xs md:text-sm uppercase tracking-[0.25em] font-semibold">
                {eyebrow}
              </span>
            </div>

            <h1 className={`font-display font-bold text-white leading-[1.05] tracking-tight uppercase mb-3 ${isInner ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] mb-2'}`}>
              {heading}
            </h1>
            <p className={`font-display font-bold text-white/95 leading-tight uppercase mb-5 md:mb-6 ${isInner ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] mb-6'}`}>
              {subheading}
            </p>

            {body && (
              <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                {body}
              </p>
            )}

            {showCtas && (
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link
                  href={ctaLink}
                  className="font-display text-sm uppercase tracking-wider font-bold text-white bg-electric hover:bg-bright-blue rounded-full px-8 md:px-10 py-3.5 md:py-4 transition-all shadow-xl shadow-electric/30 hover:shadow-electric/50"
                >
                  {ctaLabel}
                </Link>
              </div>
            )}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ section }: { section: PageSection }) {
  const isDark = section.backgroundColor === '#04152D' || section.backgroundColor === '#072448';
  const count = section.items?.length || 0;
  const gridClass =
    count === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : count === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : count <= 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="section-padding bg-soft" style={bgStyle(section)}>
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-12 md:mb-16">
          {section.eyebrow && (
            <span className="font-display text-electric text-xs uppercase tracking-[0.25em] font-semibold mb-3 block">
              {section.eyebrow}
            </span>
          )}
          {section.heading && (
            <h2 className={`font-display text-3xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-midnight'}`}>
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-ice-blue' : 'text-gray-600'}`}>{section.subheading}</p>
          )}
        </AnimateOnScroll>
        <StaggerChildren className={`grid gap-5 md:gap-6 ${gridClass}`}>
          {section.items?.map((item, i) => {
            const Icon = FEATURE_ICONS[item.icon || ''] || CheckCircle;
            const compact = count === 4;
            const content = (
              <div className={`card-premium h-full group hover:border-electric/30 transition-all ${compact ? 'p-5 md:p-6' : 'p-6 md:p-8'}`}>
                {item.image?.url ? (
                  <div className="relative h-40 mb-5 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(item.image.url)}
                      alt={item.image.alt || item.title || ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className={`rounded-full bg-electric/10 flex items-center justify-center mb-4 ${compact ? 'w-10 h-10' : 'w-12 h-12'}`}>
                    <Icon className={`text-electric ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  </div>
                )}
                <h3 className={`font-display font-bold text-midnight mb-2 group-hover:text-electric transition-colors ${compact ? 'text-base md:text-lg' : 'text-xl'}`}>
                  {item.title}
                </h3>
                <p className={`text-gray-600 leading-relaxed ${compact ? 'text-xs md:text-sm' : 'text-sm'}`}>{item.description}</p>
                {item.link && (
                  <span className="text-electric font-display text-xs uppercase tracking-wider mt-4 inline-flex items-center gap-1">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            );
            return (
              <StaggerItem key={i}>
                {item.link ? <Link href={item.link}>{content}</Link> : content}
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

function FormSection({ section, settings }: { section: PageSection; settings?: SiteSettings }) {
  return (
    <section className="section-padding bg-midnight relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-glow opacity-20" />
      <div className="container-custom relative z-10">
        <AnimateOnScroll className="text-center mb-10">
          {section.heading && (
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{section.heading}</h2>
          )}
          {section.subheading && <p className="text-ice-blue text-lg max-w-2xl mx-auto">{section.subheading}</p>}
        </AnimateOnScroll>
        <div className="max-w-2xl mx-auto">
          <LeadForm variant="hero" sourcePage="/contact" consentText={settings?.contact?.consentText} />
        </div>
        <p className="text-center mt-6">
          <Link href="/apply" className="text-electric hover:text-bright-blue font-display text-sm uppercase tracking-wider">
            Or complete our full application &rarr;
          </Link>
        </p>
      </div>
    </section>
  );
}

function GalleryGrid({ section, galleryImages }: { section: PageSection; galleryImages?: GalleryImage[] }) {
  const images = galleryImages?.filter((g) => g.image?.url) || [];
  if (images.length === 0) return null;

  return (
    <section className="section-padding bg-midnight">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            {section.heading || 'Vehicle Gallery'}
          </h2>
          {section.subheading && <p className="text-ice-blue">{section.subheading}</p>}
        </AnimateOnScroll>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {images.map((item, i) => (
            <AnimateOnScroll key={item._id} delay={i * 0.03}>
              <div
                className={`relative overflow-hidden rounded-lg group ${
                  i === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
                }`}
              >
                <Image
                  src={getImageUrl(item.image.url)}
                  alt={item.alt || item.title || 'Gallery image'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes={i === 0 ? '50vw' : '25vw'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {(item.title || item.caption) && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-display font-semibold">{item.title}</p>
                    {item.caption && <p className="text-white/70 text-xs">{item.caption}</p>}
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStrip({ section }: { section: PageSection }) {
  const icons = [Shield, Users, CheckCircle, Clock, Star];
  return (
    <section className="bg-deep-navy py-8 border-y border-white/10">
      <div className="container-custom">
        <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {section.items?.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <StaggerItem key={i} className="text-center">
                <Icon className="w-8 h-8 text-electric mx-auto mb-3" />
                <p className="text-white font-display text-sm uppercase tracking-wider">{item.title}</p>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}

function StoryTimeline({ section }: { section: PageSection }) {
  return (
    <section className="section-padding bg-midnight relative overflow-hidden">
      <div className="absolute inset-0 road-line opacity-20" />
      <div className="container-custom relative z-10">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">{section.heading}</h2>
          {section.subheading && <p className="text-ice-blue text-lg max-w-2xl mx-auto">{section.subheading}</p>}
        </AnimateOnScroll>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.items?.map((item, i) => (
            <AnimateOnScroll key={i} delay={i * 0.1}>
              <div className="relative p-6 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm hover:border-electric/50 transition-all duration-500 group">
                <span className="font-display text-5xl font-bold text-electric/20 group-hover:text-electric/40 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl text-white mt-2 mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesGrid({ section, services }: { section: PageSection; services?: Service[] }) {
  const items = services?.filter((s) => s.status === 'published').slice(0, 6) || [];
  return (
    <section className="section-padding bg-soft">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-midnight mb-4">{section.heading}</h2>
          {section.subheading && <p className="text-gray-600 text-lg max-w-2xl mx-auto">{section.subheading}</p>}
        </AnimateOnScroll>
        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((service) => (
            <StaggerItem key={service._id}>
              <Link href={`/services/${service.slug}`} className="card-premium group block">
                {service.cardImage?.url && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(service.cardImage.url)}
                      alt={service.cardImage.alt || service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent" />
                    {service.badge && (
                      <span className="absolute top-4 left-4 bg-electric text-white text-xs font-display uppercase px-3 py-1 rounded">
                        {service.badge}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-midnight mb-2 group-hover:text-electric transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.shortDescription}</p>
                  <span className="text-electric font-display text-sm uppercase tracking-wider flex items-center gap-1">
                    {service.ctaLabel} <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function ProcessRoad({ section }: { section: PageSection }) {
  const count = section.items?.length || 0;
  const gridClass =
    count <= 3
      ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto'
      : count === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';

  return (
    <section className="section-padding bg-midnight relative overflow-hidden">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">{section.heading}</h2>
          {section.subheading && (
            <p className="text-ice-blue text-lg max-w-2xl mx-auto">{section.subheading}</p>
          )}
        </AnimateOnScroll>
        <div className="relative">
          {count > 1 && (
            <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2 w-[min(100%,56rem)] h-0.5 bg-electric/30" />
          )}
          <div className={`grid gap-8 lg:gap-10 ${gridClass}`}>
            {section.items?.map((item, i) => (
              <AnimateOnScroll key={i} delay={i * 0.15} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-electric/20 border-2 border-electric flex items-center justify-center mx-auto mb-4 relative z-10 bg-midnight">
                  <span className="font-display text-xl font-bold text-electric">{i + 1}</span>
                </div>
                <h3 className="font-display text-lg text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoWeHelp({ section }: { section: PageSection }) {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-midnight mb-4">{section.heading}</h2>
        </AnimateOnScroll>
        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {section.items?.map((item, i) => (
            <StaggerItem key={i}>
              <div className="p-6 bg-white rounded-lg border border-ice-blue hover:border-electric hover:shadow-lg transition-all duration-300 text-center">
                <h3 className="font-display text-lg font-semibold text-midnight mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function ZeroDownFeature({ section }: { section: PageSection }) {
  const bg = section.backgroundImage?.url ? getImageUrl(section.backgroundImage.url) : '';
  return (
    <section className="relative section-padding overflow-hidden">
      {bg && <Image src={bg} alt="" fill className="object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-r from-electric/90 to-bright-blue/80" />
      <div className="container-custom relative z-10 text-center">
        <AnimateOnScroll>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">{section.heading}</h2>
          {section.body && <p className="text-white/90 text-lg max-w-3xl mx-auto mb-4">{section.body}</p>}
          <p className="text-white/70 text-sm max-w-2xl mx-auto mb-8">
            $0 down options may be available to qualified applicants. Subject to lender approval and eligibility criteria.
          </p>
          {section.ctaLabel && (
            <Link href={section.ctaLink || '/apply'} className="btn-secondary">{section.ctaLabel}</Link>
          )}
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function GalleryPreview({ section }: { section: PageSection }) {
  return (
    <section className="section-padding bg-midnight">
      <div className="container-custom">
        <AnimateOnScroll className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{section.heading}</h2>
            {section.subheading && <p className="text-ice-blue">{section.subheading}</p>}
          </div>
          <Link href="/gallery" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-midnight hidden md:inline-flex">
            View Gallery
          </Link>
        </AnimateOnScroll>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {section.items?.slice(0, 8).map((item, i) => (
            <AnimateOnScroll key={i} delay={i * 0.05} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className={`relative overflow-hidden rounded-lg group ${i === 0 ? 'col-span-2 row-span-2 h-80' : 'h-40'}`}>
                {item.image?.url && (
                  <Image
                    src={getImageUrl(item.image.url)}
                    alt={item.image.alt || item.title || ''}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-midnight/0 group-hover:bg-midnight/40 transition-colors" />
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSlider({ section, testimonials }: { section: PageSection; testimonials?: Testimonial[] }) {
  const showAll = section.metadata?.showAll === true;
  const items = showAll
    ? testimonials || []
    : testimonials?.filter((t) => t.isFeatured).slice(0, 6) || testimonials?.slice(0, 6) || [];

  return (
    <section className="section-padding bg-soft overflow-hidden">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-midnight mb-4">{section.heading}</h2>
          {section.subheading && <p className="text-gray-600 text-lg max-w-2xl mx-auto">{section.subheading}</p>}
        </AnimateOnScroll>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">Testimonials coming soon.</p>
          ) : (
            items.map((t, i) => (
              <AnimateOnScroll key={t._id} delay={i * 0.1}>
                <div className="card-premium p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-electric text-electric" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-display font-semibold text-midnight">{t.customerName}</p>
                    {t.location && <p className="text-gray-500 text-sm">{t.location}</p>}
                  </div>
                </div>
              </AnimateOnScroll>
            ))
          )}
        </div>
        <p className="text-center text-gray-400 text-xs mt-8">Individual experiences may vary. Not a guarantee of similar results.</p>
      </div>
    </section>
  );
}

function FaqPreview({ section, faqs }: { section: PageSection; faqs?: FAQ[] }) {
  const showAll = section.metadata?.showAll === true;
  const items = showAll
    ? faqs || []
    : faqs?.filter((f) => f.isFeatured).slice(0, 6) || faqs?.slice(0, 6) || [];
  return (
    <section id="faq" className="section-padding scroll-mt-28">      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-midnight mb-4">{section.heading}</h2>
        </AnimateOnScroll>
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((faq, i) => (
            <AnimateOnScroll key={faq._id} delay={i * 0.05}>
              <details className="group bg-white rounded-lg border border-ice-blue overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-display font-semibold text-midnight hover:text-electric transition-colors">
                  {faq.question}
                  <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </details>
            </AnimateOnScroll>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/testimonials-faqs" className="btn-outline">View All FAQs</Link>
        </div>
      </div>
    </section>
  );
}

function CtaBanner({ section }: { section: PageSection }) {
  const bg = section.backgroundImage?.url ? getImageUrl(section.backgroundImage.url) : '';
  return (
    <section className="relative py-32 overflow-hidden">
      {bg && <Image src={bg} alt="" fill className="object-cover" />}
      <div className="absolute inset-0 bg-midnight/80" />
      <div className="absolute bottom-0 left-0 right-0 road-line" />
      <div className="container-custom relative z-10 text-center">
        <AnimateOnScroll>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">{section.heading}</h2>
          {section.subheading && <p className="text-ice-blue text-lg mb-8 max-w-2xl mx-auto">{section.subheading}</p>}
          {section.ctaLabel && (
            <Link href={section.ctaLink || '/apply'} className="btn-primary text-lg">{section.ctaLabel}</Link>
          )}
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function ContentBlock({ section }: { section: PageSection }) {
  const bg = section.backgroundImage?.url ? getImageUrl(section.backgroundImage.url) : undefined;
  const sideImage = section.primaryImage?.url ? getImageUrl(section.primaryImage.url) : '';
  const reversed = section.animationDirection === 'right';
  const isDark = section.backgroundColor === '#04152D' || section.backgroundColor === '#072448';
  const hasSoftBg = section.backgroundColor === '#F4F8FC';

  if (sideImage && !bg) {
    return (
      <section
        className="section-padding relative overflow-hidden"
        style={section.backgroundColor ? { backgroundColor: section.backgroundColor } : { backgroundColor: reversed ? '#F4F8FC' : '#ffffff' }}
      >
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <AnimateOnScroll direction={reversed ? 'right' : 'left'} className={reversed ? 'lg:order-2' : ''}>
              <div className="relative h-72 sm:h-80 lg:h-[28rem] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <Image
                  src={sideImage}
                  alt={section.primaryImage?.alt || section.heading || ''}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/30 to-transparent" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll direction={reversed ? 'left' : 'right'} className={reversed ? 'lg:order-1' : ''}>
              {section.eyebrow && (
                <span className="inline-flex items-center gap-2 font-display text-electric text-xs uppercase tracking-[0.25em] font-semibold mb-4">
                  <span className="w-8 h-px bg-electric" />
                  {section.eyebrow}
                </span>
              )}
              {section.heading && (
                <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-midnight mb-5 leading-tight">
                  {section.heading}
                </h2>
              )}
              {section.body && (
                <div
                  className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              )}
              {section.ctaLabel && (
                <Link href={section.ctaLink || '/apply'} className="btn-primary mt-8 inline-flex">
                  {section.ctaLabel}
                </Link>
              )}
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`section-padding relative ${hasSoftBg ? 'bg-soft' : ''}`}
      style={{ ...bgStyle(section), ...(bg ? {} : {}) }}
    >
      {bg && (
        <>
          <Image src={bg} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-midnight/70" />
        </>
      )}
      <div className="container-custom relative z-10">
        <AnimateOnScroll className={`max-w-4xl ${section.textAlignment === 'center' ? 'mx-auto text-center' : ''}`}>
          {section.eyebrow && (
            <span className={`inline-block font-display uppercase tracking-widest text-sm mb-4 ${isDark || bg ? 'text-electric' : 'text-electric'}`}>
              {section.eyebrow}
            </span>
          )}
          {section.heading && (
            <h2 className={`font-display text-3xl md:text-4xl font-bold mb-6 ${isDark || bg ? 'text-white' : 'text-midnight'}`}>
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className={`text-lg mb-6 ${isDark || bg ? 'text-ice-blue' : 'text-gray-600'}`}>{section.subheading}</p>
          )}
          {section.body && (
            <div
              className={`prose max-w-none ${isDark || bg ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          )}
          {section.ctaLabel && (
            <Link href={section.ctaLink || '/apply'} className="btn-primary mt-8 inline-flex">{section.ctaLabel}</Link>
          )}
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function bgStyle(section: PageSection) {
  return section.backgroundColor ? { backgroundColor: section.backgroundColor } : {};
}

function ImageText({ section }: { section: PageSection }) {
  const img = section.primaryImage?.url ? getImageUrl(section.primaryImage.url) : '';
  const reversed = section.animationDirection === 'right';
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
          <AnimateOnScroll direction={reversed ? 'right' : 'left'}>
            {img && (
              <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden">
                <Image src={img} alt={section.primaryImage?.alt || ''} fill className="object-cover" />
              </div>
            )}
          </AnimateOnScroll>
          <AnimateOnScroll direction={reversed ? 'left' : 'right'} className={reversed ? 'lg:order-first' : ''}>
            {section.eyebrow && <span className="text-electric font-display uppercase tracking-widest text-sm">{section.eyebrow}</span>}
            <h2 className="font-display text-3xl md:text-4xl font-bold text-midnight mt-2 mb-4">{section.heading}</h2>
            {section.body && <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.body }} />}
            {section.ctaLabel && <Link href={section.ctaLink || '#'} className="btn-primary mt-6 inline-flex">{section.ctaLabel}</Link>}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ section }: { section: PageSection }) {
  return (
    <section className="section-padding bg-deep-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-glow opacity-20" />
      <div className="container-custom relative z-10">
        {section.heading && (
          <AnimateOnScroll className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">{section.heading}</h2>
          </AnimateOnScroll>
        )}
        <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
          {section.items?.map((item, i) => (
            <StaggerItem key={i}>
              <p className="font-display text-4xl md:text-5xl font-bold text-electric mb-2">{item.title}</p>
              <p className="text-ice-blue text-sm uppercase tracking-wider">{item.description}</p>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function CardsGrid({ section }: { section: PageSection }) {
  return (
    <section className="section-padding">
      <div className="container-custom">
        {section.heading && (
          <AnimateOnScroll className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-midnight">{section.heading}</h2>
          </AnimateOnScroll>
        )}
        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.items?.map((item, i) => (
            <StaggerItem key={i}>
              <div className="card-premium p-8">
                {item.image?.url && (
                  <div className="relative h-40 mb-6 rounded overflow-hidden">
                    <Image src={getImageUrl(item.image.url)} alt={item.image.alt || ''} fill className="object-cover" />
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-midnight mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                {item.link && (
                  <Link href={item.link} className="text-electric text-sm font-display uppercase mt-4 inline-flex items-center gap-1">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
