import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { env } from '../config/env';
import {
  SiteSettings,
  Navigation,
  Page,
  Service,
  GalleryCategory,
  GalleryImage,
  Testimonial,
  FAQCategory,
  FAQ,
  BlogCategory,
  BlogPost,
  Offer,
  Lead,
} from '../models';
import { slugify } from '../utils/sanitize';
import { logger } from '../utils/logger';
import type { IPageSection } from '../models';

const CLEAR_FLAG = process.argv.includes('--clear') || process.argv.includes('-c');

// Unsplash image helpers
const IMAGES = {
  heroCar: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920',
  dealership: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1920',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1920',
  sedan: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920',
  truck: 'https://images.unsplash.com/photo-1533473359331-30c20e68572a?w=1920',
  interior: 'https://images.unsplash.com/photo-148529157115f-772ac1456bb2?w=1920',
  keys: 'https://images.unsplash.com/photo-1485463611174-63bad6f4b50b?w=1920',
  handshake: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1920',
  roadTrip: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920',
  cityDrive: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2001?w=1920',
  happyCustomer: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
  credit: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920',
  family: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920',
  mechanic: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920',
  parkingLot: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920',
  steering: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1920',
  dashboard: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920',
  showroom: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920',
  zeroDown: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920',
};

function img(url: string, alt: string) {
  return { url, alt };
}

function heroSection(
  name: string,
  heading: string,
  subheading: string,
  order: number,
  backgroundUrl: string,
  ctaLabel = 'Get Pre-Qualified',
  ctaLink = '/apply',
  eyebrow?: string,
  body?: string,
  metadata?: Record<string, unknown>,
): IPageSection {
  return {
    name,
    sectionType: 'hero',
    eyebrow: eyebrow || 'Vehicle Financing Support',
    heading,
    subheading,
    body,
    ctaLabel,
    ctaLink,
    backgroundImage: img(backgroundUrl, heading),
    textAlignment: 'left',
    animationPreset: 'fade-up',
    isVisible: true,
    order,
    metadata,
  };
}

type FeatureItem = NonNullable<IPageSection['items']>[number];

function featuresSection(
  name: string,
  heading: string,
  items: FeatureItem[],
  order: number,
  eyebrow?: string,
): IPageSection {
  return {
    name,
    sectionType: 'features',
    eyebrow,
    heading,
    items,
    textAlignment: 'center',
    animationPreset: 'stagger',
    isVisible: true,
    order,
  };
}

function contentBlock(
  name: string,
  heading: string,
  body: string,
  order: number,
  imageUrl?: string,
  ctaLabel?: string,
  ctaLink?: string,
  options?: { eyebrow?: string; animationDirection?: string; backgroundColor?: string },
): IPageSection {
  return {
    name,
    sectionType: 'content-block',
    eyebrow: options?.eyebrow,
    heading,
    body,
    primaryImage: imageUrl ? img(imageUrl, heading) : undefined,
    ctaLabel,
    ctaLink,
    textAlignment: 'left',
    animationPreset: 'fade-in',
    animationDirection: options?.animationDirection,
    backgroundColor: options?.backgroundColor,
    isVisible: true,
    order,
  };
}

function ctaBanner(
  name: string,
  heading: string,
  subheading: string,
  order: number,
  ctaLabel = 'Get Started',
  ctaLink = '/apply',
): IPageSection {
  return {
    name,
    sectionType: 'cta-banner',
    heading,
    subheading,
    ctaLabel,
    ctaLink,
    backgroundImage: img(IMAGES.heroCar, heading),
    textAlignment: 'center',
    animationPreset: 'zoom-in',
    isVisible: true,
    order,
  };
}

function processSteps(
  name: string,
  heading: string,
  steps: Array<{ title: string; description: string }>,
  order: number,
): IPageSection {
  return {
    name,
    sectionType: 'process-steps',
    heading,
    items: steps.map((s, i) => ({ ...s, badge: String(i + 1) })),
    textAlignment: 'center',
    animationPreset: 'stagger',
    isVisible: true,
    order,
  };
}

function statsSection(
  name: string,
  items: Array<{ title: string; description: string }>,
  order: number,
): IPageSection {
  return {
    name,
    sectionType: 'stats',
    items,
    textAlignment: 'center',
    isVisible: true,
    order,
  };
}

async function clearData(): Promise<void> {
  logger.info('Clearing existing data...');
  await Promise.all([
    SiteSettings.deleteMany({}),
    Navigation.deleteMany({}),
    Page.deleteMany({}),
    Service.deleteMany({}),
    GalleryCategory.deleteMany({}),
    GalleryImage.deleteMany({}),
    Testimonial.deleteMany({}),
    FAQCategory.deleteMany({}),
    FAQ.deleteMany({}),
    BlogCategory.deleteMany({}),
    BlogPost.deleteMany({}),
    Offer.deleteMany({}),
    Lead.deleteMany({}),
  ]);
  logger.info('Existing data cleared.');
}

async function seedSiteSettings(): Promise<void> {
  await SiteSettings.create({
    general: {
      businessName: 'Approval Hero',
      tagline: 'Your Road Forward Starts Here',
      email: 'ak_2123@hotmail.com',
      phone: '416-700-2656',
      alternatePhone: '1-888-555-0199',
      address: 'Greater Toronto Area, Ontario, Canada',
      serviceArea: 'Greater Toronto Area and across Ontario',
      businessHours: 'Mon-Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM | Sun: Closed',
    },
    social: {
      facebook: 'https://facebook.com/approvalhero',
      instagram: 'https://instagram.com/approvalhero',
      linkedin: 'https://linkedin.com/company/approvalhero',
      youtube: 'https://youtube.com/@approvalhero',
      tiktok: 'https://tiktok.com/@approvalhero',
      twitter: 'https://twitter.com/approvalhero',
    },
    branding: {
      logo: img(IMAGES.heroCar, 'Approval Hero logo'),
      lightLogo: img(IMAGES.heroCar, 'Approval Hero light logo'),
      darkLogo: img(IMAGES.heroCar, 'Approval Hero dark logo'),
      favicon: img(IMAGES.keys, 'Approval Hero favicon'),
      primaryColor: '#04152D',
      secondaryColor: '#0866FF',
      accentColor: '#21A3FF',
      headingFont: 'Oswald',
      bodyFont: 'Inter',
    },
    seo: {
      defaultTitle: 'Approval Hero | Vehicle Financing Assistance in Ontario',
      titleTemplate: '%s | Approval Hero',
      defaultDescription:
        'Approval Hero connects Ontario drivers with dealer and lending partners who specialize in vehicle financing — including bad credit, no credit, bankruptcy, and $0 down options.',
      defaultOgImage: img(IMAGES.heroCar, 'Approval Hero - Vehicle Financing'),
      googleVerification: '',
      robotsIndex: true,
    },
    contact: {
      notificationEmail: 'ak_2123@hotmail.com',
      successMessage: 'Thank you! A financing specialist will contact you within one business day.',
      consentText:
        'I consent to being contacted by Approval Hero and its lending partners about vehicle financing options via phone, email, or text message.',
      spamProtection: true,
    },
    animation: {
      introEnabled: true,
      introDuration: 3500,
      smoothScrolling: true,
      animationIntensity: 'high',
      reducedMotionFallback: true,
      pageTransitions: true,
    },
    footer: {
      description:
        'Approval Hero helps Ontario customers explore vehicle financing through trusted dealer and lending partners — even with challenging credit histories.',
      disclaimer:
        'Approval, rates, terms, and zero-down options are subject to lender criteria, credit assessment, income verification, and eligibility. Approval Hero is not a lender and does not guarantee financing approval. Vehicle images are for illustration purposes only.',
      copyright: `© ${new Date().getFullYear()} Approval Hero. All rights reserved.`,
      ctaLabel: 'Apply Now',
      ctaLink: '/apply',
    },
    header: {
      ctaLabel: 'Apply Now',
      ctaLink: '/apply',
      phone: '416-700-2656',
    },
    pricing: {
      showPricing: false,
    },
  });
  logger.info('Site settings created.');
}

async function seedNavigation(): Promise<void> {
  await Navigation.create({
    headerItems: [
      { label: 'Home', href: '/', order: 0, isVisible: true },
      { label: 'About', href: '/about', order: 1, isVisible: true },
      { label: 'Services', href: '/services', order: 2, isVisible: true },
      { label: 'How It Works', href: '/how-it-works', order: 3, isVisible: true },
      { label: 'Testimonials', href: '/testimonials-faqs', order: 4, isVisible: true },
      { label: 'FAQ', href: '/testimonials-faqs#faq', order: 5, isVisible: true },
      { label: 'Contact', href: '/contact', order: 6, isVisible: true },
    ],
    footerColumns: [
      {
        title: 'Financing Programs',
        order: 0,
        links: [
          { label: 'Bad Credit Financing', href: '/bad-credit', order: 0 },
          { label: 'No Credit Financing', href: '/no-credit', order: 1 },
          { label: 'Bankruptcy & Proposal', href: '/bankruptcy', order: 2 },
          { label: 'Self-Employed', href: '/self-employed', order: 3 },
          { label: '$0 Down Payment', href: '/zero-down', order: 4 },
          { label: 'Newcomer Programs', href: '/newcomer', order: 5 },
        ],
      },
      {
        title: 'Company',
        order: 1,
        links: [
          { label: 'About Us', href: '/about', order: 0 },
          { label: 'Why Choose Us', href: '/why-choose-us', order: 1 },
          { label: 'How It Works', href: '/how-it-works', order: 2 },
          { label: 'Approval Programs', href: '/approval-programs', order: 3 },
          { label: 'Gallery', href: '/gallery', order: 4 },
          { label: 'Contact', href: '/contact', order: 5 },
        ],
      },
      {
        title: 'Resources',
        order: 2,
        links: [
          { label: 'Testimonials & FAQs', href: '/testimonials-faqs', order: 0 },
          { label: 'Blog', href: '/blog', order: 1 },
          { label: 'Privacy Policy', href: '/privacy', order: 2 },
          { label: 'Terms of Service', href: '/terms', order: 3 },
        ],
      },
      {
        title: 'Contact',
        order: 3,
        links: [
          { label: '416-700-2656', href: 'tel:4167002656', order: 0 },
          { label: 'ak_2123@hotmail.com', href: 'mailto:ak_2123@hotmail.com', order: 1 },
          { label: 'Apply Online', href: '/apply', order: 2 },
        ],
      },
    ],
    serviceMenuEnabled: true,
  });
  logger.info('Navigation created.');
}

function buildPages() {
  return [
    {
      title: 'Home',
      slug: 'home',
      status: 'published' as const,
      seoTitle: 'Approval Hero | Vehicle Financing in Ontario',
      seoDescription:
        'Get approved for vehicle financing in Ontario — bad credit, no credit, bankruptcy, and $0 down programs available through Approval Hero.',
      ogImage: img(IMAGES.heroCar, 'Approval Hero home'),
      sections: [
        heroSection(
          'Home Hero',
          'Denied Financing?',
          'Your Road Forward Starts Here.',
          0,
          IMAGES.heroCar,
          'Get Pre-Qualified',
          '/apply',
          'Vehicle Financing Support',
          'We connect drivers with dealer partners who understand challenging credit situations.',
        ),
        featuresSection(
          'Why Approval Hero',
          'Financing Solutions Built Around You',
          [
            { title: 'All Credit Welcome', description: 'Programs for bad credit, no credit, bankruptcy, and consumer proposals.', icon: 'shield-check' },
            { title: '$0 Down Options', description: 'Explore zero-down payment programs subject to lender approval and eligibility.', icon: 'dollar-sign' },
            { title: 'Fast Pre-Approval', description: 'Complete a simple application and hear back from a specialist quickly.', icon: 'clock' },
            { title: 'Ontario-Wide Network', description: 'Connected with dealers and lenders across the Greater Toronto Area and beyond.', icon: 'map-pin' },
          ],
          1,
          'Why Choose Us',
        ),
        contentBlock(
          'Our Mission',
          'Helping You Get Behind the Wheel',
          'At Approval Hero, we believe everyone deserves a fair shot at reliable transportation. Our team works with a network of dealer and lending partners who understand that life happens — job changes, medical bills, divorce, or newcomer status should not permanently block your access to a vehicle. We guide you through the process with transparency and respect.',
          2,
          IMAGES.handshake,
          'Learn About Us',
          '/about',
        ),
        processSteps(
          'How It Works Preview',
          'Three Simple Steps to Get Started',
          [
            { title: 'Apply Online', description: 'Fill out our secure application in minutes. No obligation and no impact on your credit score for the initial inquiry.' },
            { title: 'Review Your Options', description: 'A financing specialist reviews your situation and matches you with programs that fit your needs and budget.' },
            { title: 'Drive Away', description: 'Once approved, select your vehicle from partner inventory and finalize your financing terms.' },
          ],
          3,
        ),
        statsSection('Trust Stats', [
          { title: '15+', description: 'Years Combined Experience' },
          { title: '1,000+', description: 'Customers Assisted' },
          { title: '50+', description: 'Lending Partners' },
          { title: '24hr', description: 'Typical Response Time' },
        ], 4),
        ctaBanner(
          'Home CTA',
          'Ready to Explore Your Financing Options?',
          'Apply today and let Approval Hero connect you with programs designed for your unique situation.',
          5,
        ),
      ],
    },
    {
      title: 'About Us',
      slug: 'about',
      status: 'published' as const,
      seoTitle: 'About Approval Hero',
      seoDescription: 'Learn about Approval Hero — Ontario vehicle financing specialists helping customers with all credit situations.',
      sections: [
        heroSection(
          'About Hero',
          'About Approval Hero',
          'Helping Ontario Drivers Get Back on the Road.',
          0,
          IMAGES.cityDrive,
          'Get Pre-Qualified',
          '/apply',
          'Our Story',
          'We connect drivers with dealer and lending partners who understand challenging credit — so you can move forward with confidence.',
          { innerPage: true },
        ),
        contentBlock(
          'Who We Are',
          'Your Partner in Vehicle Financing',
          '<p>Approval Hero was founded with a simple mission: make vehicle financing accessible to everyone in Ontario, regardless of credit history.</p><p>We are not a bank or direct lender. Instead, we work with a network of dealers and lending partners who specialize in programs for bad credit, no credit, bankruptcy, self-employed applicants, and newcomers to Canada.</p>',
          1,
          IMAGES.dealership,
          'Explore Our Programs',
          '/services',
          { eyebrow: 'Who We Are' },
        ),
        contentBlock(
          'What We Believe',
          'Everyone Deserves a Second Chance',
          '<p>Credit challenges often come from circumstances beyond your control — illness, job loss, divorce, or starting fresh in a new country.</p><p>Our approach is judgment-free. We listen, explain your options clearly, and help you find a realistic path to reliable transportation.</p>',
          2,
          IMAGES.suv,
          'How It Works',
          '/how-it-works',
          { eyebrow: 'Our Philosophy', animationDirection: 'right', backgroundColor: '#F4F8FC' },
        ),
        statsSection('By the Numbers', [
          { title: '1,000+', description: 'Customers Assisted' },
          { title: '50+', description: 'Lending Partners' },
          { title: '15+', description: 'Years Experience' },
          { title: '24hr', description: 'Typical Response' },
        ], 3),
        featuresSection('Our Values', 'What Guides Us Every Day', [
          { title: 'Transparency', description: 'No hidden fees, no pressure tactics. We explain terms in plain language.', icon: 'eye' },
          { title: 'Respect', description: 'Every customer is treated with dignity, regardless of credit score.', icon: 'heart' },
          { title: 'Expertise', description: 'Our team knows Ontario lending programs inside and out.', icon: 'award' },
          { title: 'Results', description: 'We measure success by customers driving reliable vehicles.', icon: 'check-circle' },
        ], 4, 'Our Values'),
        processSteps('How We Help', 'Your Journey With Us', [
          { title: 'Listen & Understand', description: 'We learn about your situation, budget, and transportation needs without judgment.' },
          { title: 'Match Programs', description: 'We connect you with dealer and lender partners suited to your credit profile.' },
          { title: 'Drive Forward', description: 'You review options, choose a vehicle, and finalize terms that work for you.' },
        ], 5),
        ctaBanner('About CTA', 'Ready to Take the Next Step?', 'Start with a free, no-obligation pre-qualification today.', 6, 'Apply Now', '/apply'),
      ],
    },
    {
      title: 'Services',
      slug: 'services',
      status: 'published' as const,
      seoTitle: 'Vehicle Financing Services',
      seoDescription: 'Explore Approval Hero financing services — bad credit, no credit, bankruptcy, self-employed, newcomer, and zero-down programs.',
      sections: [
        heroSection('Services Hero', 'Our Financing Services', 'Comprehensive vehicle financing programs for every credit situation in Ontario.', 0, IMAGES.showroom, 'View Programs', '/approval-programs', 'What We Offer'),
        featuresSection('Service Categories', 'Programs Tailored to Your Situation', [
          { title: 'Bad Credit Financing', description: 'Specialized programs for scores below 600.', icon: 'trending-up', link: '/bad-credit' },
          { title: 'No Credit Financing', description: 'First-time buyers and thin-file applicants welcome.', icon: 'user-plus', link: '/no-credit' },
          { title: 'Bankruptcy & Proposal', description: 'Financing during or after insolvency proceedings.', icon: 'file-text', link: '/bankruptcy' },
          { title: 'Self-Employed', description: 'Programs using bank statements and tax returns.', icon: 'briefcase', link: '/self-employed' },
          { title: 'Newcomer Programs', description: 'Options for new Canadian residents without local credit.', icon: 'globe', link: '/newcomer' },
          { title: '$0 Down Payment', description: 'Explore zero-down options subject to approval.', icon: 'dollar-sign', link: '/zero-down' },
        ], 1),
        contentBlock('Full-Service Support', 'More Than Just Financing', 'Beyond matching you with a lender, Approval Hero helps with trade-in evaluation, vehicle selection guidance, and understanding your payment terms. Our goal is to set you up for long-term success — not just get you approved today.', 2, IMAGES.mechanic),
        ctaBanner('Services CTA', 'Not Sure Which Program Fits?', 'Contact us and we will help identify the right path for your situation.', 3, 'Get Personalized Help', '/apply'),
      ],
    },
    {
      title: 'Approval Programs',
      slug: 'approval-programs',
      status: 'published' as const,
      seoTitle: 'Vehicle Approval Programs',
      seoDescription: 'Browse Approval Hero vehicle approval programs for all credit types across Ontario.',
      sections: [
        heroSection('Programs Hero', 'Approval Programs', 'Find the right financing program for your credit profile and budget.', 0, IMAGES.parkingLot, 'Apply Now', '/apply', 'Programs'),
        contentBlock('Program Overview', 'Financing for Every Situation', 'Our approval programs cover the full spectrum of credit situations. Whether you have excellent credit, a few late payments, active bankruptcy, or no Canadian credit history at all — there may be a program available for you. Each program has different requirements, rates, and terms set by the lending partner.', 1, IMAGES.credit),
        featuresSection('Available Programs', 'Choose Your Path', [
          { title: 'Standard Approval', description: 'For customers with good to excellent credit seeking competitive rates.', icon: 'star' },
          { title: 'Subprime Programs', description: 'Designed for credit scores between 500-650 with flexible terms.', icon: 'bar-chart' },
          { title: 'Deep Subprime', description: 'Options for scores below 500, including recent bankruptcy discharge.', icon: 'life-buoy' },
          { title: 'First-Time Buyer', description: 'Programs for applicants with no prior auto loan history.', icon: 'gift' },
        ], 2),
        processSteps('Program Steps', 'How to Access a Program', [
          { title: 'Submit Application', description: 'Provide basic personal, employment, and housing information.' },
          { title: 'Credit Review', description: 'A specialist reviews your profile and identifies eligible programs.' },
          { title: 'Program Match', description: 'You receive options with estimated payments and terms.' },
          { title: 'Vehicle Selection', description: 'Choose from partner inventory within your approved amount.' },
        ], 3),
        ctaBanner('Programs CTA', 'Start Your Application Today', 'It takes just a few minutes and there is no obligation.', 4),
      ],
    },
    {
      title: 'How It Works',
      slug: 'how-it-works',
      status: 'published' as const,
      seoTitle: 'How Vehicle Financing Works',
      seoDescription: 'Learn how Approval Hero connects you with vehicle financing — from application to driving away.',
      sections: [
        heroSection('How It Works Hero', 'How It Works', 'A straightforward process designed to get you approved and on the road.', 0, IMAGES.roadTrip, 'Start Application', '/apply'),
        processSteps('Full Process', 'Your Journey with Approval Hero', [
          { title: 'Step 1: Apply', description: 'Complete our online application form with your contact details, employment info, and housing situation. The form takes about 5 minutes.' },
          { title: 'Step 2: Consultation', description: 'A financing specialist calls you within one business day to discuss your needs, budget, and credit situation in detail.' },
          { title: 'Step 3: Pre-Approval', description: 'We submit your application to appropriate lending partners and present you with available options including rates, terms, and payment estimates.' },
          { title: 'Step 4: Vehicle Selection', description: 'Browse partner dealership inventory or bring your own vehicle. We help ensure it fits within your approved financing amount.' },
          { title: 'Step 5: Finalize & Drive', description: 'Sign your financing documents, complete any required insurance, and drive away in your new vehicle.' },
        ], 1),
        contentBlock('What You Will Need', 'Documents to Have Ready', 'Valid government-issued photo ID, proof of income (pay stubs, bank statements, or tax returns), proof of residence (utility bill or lease agreement), and details about your current vehicle if trading in. Self-employed applicants should have 3-6 months of bank statements available.', 2, IMAGES.dashboard),
        ctaBanner('How It Works CTA', 'Ready to Begin?', 'Your next vehicle is closer than you think.', 3),
      ],
    },
    {
      title: 'Why Choose Us',
      slug: 'why-choose-us',
      status: 'published' as const,
      seoTitle: 'Why Choose Approval Hero',
      seoDescription: 'Discover why Ontario drivers trust Approval Hero for vehicle financing assistance.',
      sections: [
        heroSection('Why Choose Hero', 'Why Choose Approval Hero', 'Experience the difference of working with financing specialists who truly care.', 0, IMAGES.happyCustomer, 'Apply Now', '/apply'),
        featuresSection('Advantages', 'The Approval Hero Advantage', [
          { title: 'No Judgment Zone', description: 'We have heard every credit story. Yours will be handled with confidentiality and respect.', icon: 'lock' },
          { title: 'Wide Lender Network', description: 'Access to dozens of lending partners means more options and better chances of approval.', icon: 'users' },
          { title: 'Ontario Focused', description: 'We understand provincial regulations, insurance requirements, and local market conditions.', icon: 'map' },
          { title: 'Free Consultation', description: 'No fees to apply or consult. You only proceed if the terms work for you.', icon: 'thumbs-up' },
        ], 1),
        statsSection('By the Numbers', [
          { title: '98%', description: 'Customer Satisfaction' },
          { title: '48hr', description: 'Average Approval Time' },
          { title: '0', description: 'Application Fees' },
          { title: '100%', description: 'Confidential Process' },
        ], 2),
        contentBlock('Real People, Real Results', 'Stories That Inspire Us', 'Every approval reminds us why we do this work. From single parents needing a reliable minivan to newcomers purchasing their first Canadian vehicle — each success story reinforces our commitment to accessible transportation.', 3, IMAGES.family, 'Read Testimonials', '/testimonials-faqs'),
        ctaBanner('Why Choose CTA', 'Join Thousands of Satisfied Customers', 'Take the first step toward your next vehicle today.', 4),
      ],
    },
    {
      title: 'Bad Credit Financing',
      slug: 'bad-credit',
      status: 'published' as const,
      seoTitle: 'Bad Credit Car Loans Ontario',
      seoDescription: 'Bad credit vehicle financing in Ontario. Approval Hero connects you with lenders who work with credit scores below 600.',
      sections: [
        heroSection('Bad Credit Hero', 'Bad Credit? You Still Have Options.', 'Specialized vehicle financing programs for Ontario drivers with less-than-perfect credit.', 0, IMAGES.credit, 'Apply Now', '/apply', 'Bad Credit Programs'),
        contentBlock('Understanding Bad Credit', 'What Counts as Bad Credit?', 'In Canada, credit scores range from 300 to 900. Generally, scores below 600 are considered subprime. Late payments, collections, high credit utilization, and past defaults can all impact your score. The good news: many lenders specialize in helping subprime borrowers rebuild while getting the transportation they need.', 1, IMAGES.office),
        featuresSection('Bad Credit Solutions', 'How We Help', [
          { title: 'Subprime Lenders', description: 'Partners who regularly approve scores in the 500-600 range.', icon: 'check' },
          { title: 'Credit Rebuilding', description: 'On-time auto payments can improve your score over time.', icon: 'trending-up' },
          { title: 'Flexible Terms', description: 'Longer terms available to keep monthly payments manageable.', icon: 'calendar' },
          { title: 'Trade-In Credit', description: 'Use your current vehicle equity to strengthen your application.', icon: 'repeat' },
        ], 2),
        ctaBanner('Bad Credit CTA', 'Do Not Let Your Credit Score Hold You Back', 'Apply today — approval is not guaranteed, but options may be available.', 3),
      ],
    },
    {
      title: 'No Credit Financing',
      slug: 'no-credit',
      status: 'published' as const,
      seoTitle: 'No Credit Car Loans Ontario',
      seoDescription: 'First-time buyer and no credit vehicle financing in Ontario through Approval Hero.',
      sections: [
        heroSection('No Credit Hero', 'No Credit History? No Problem.', 'First-time buyer programs for Ontario residents building their credit from scratch.', 0, IMAGES.keys, 'Apply Now', '/apply', 'No Credit Programs'),
        contentBlock('Building From Zero', 'Starting Your Credit Journey', 'Whether you are a young adult, recent graduate, or someone who has always paid cash, having no credit history can be just as challenging as bad credit. Lenders need a way to assess your reliability. Our newcomer and first-time buyer programs use alternative verification methods like employment history, rent payments, and bank account activity.', 1, IMAGES.steering),
        featuresSection('No Credit Options', 'Programs Available', [
          { title: 'First-Time Buyer', description: 'Designed for applicants with no prior auto loan or credit card history.', icon: 'user' },
          { title: 'Co-Signer Programs', description: 'A qualified co-signer can strengthen your application significantly.', icon: 'users' },
          { title: 'Starter Vehicles', description: 'Affordable, reliable vehicles to keep payments low while building credit.', icon: 'car' },
          { title: 'Graduated Programs', description: 'Start with a smaller loan and qualify for better terms on your next vehicle.', icon: 'arrow-up' },
        ], 2),
        ctaBanner('No Credit CTA', 'Start Building Your Credit Today', 'Your first vehicle loan could be the foundation of a strong credit profile.', 3),
      ],
    },
    {
      title: 'Bankruptcy & Consumer Proposal',
      slug: 'bankruptcy',
      status: 'published' as const,
      seoTitle: 'Bankruptcy Car Loans Ontario',
      seoDescription: 'Vehicle financing during or after bankruptcy and consumer proposals in Ontario.',
      sections: [
        heroSection('Bankruptcy Hero', 'Financing After Bankruptcy', 'Programs for Ontario residents in bankruptcy, consumer proposal, or recently discharged.', 0, IMAGES.office, 'Apply Now', '/apply', 'Bankruptcy Programs'),
        contentBlock('Life After Insolvency', 'You Can Still Get Approved', 'Bankruptcy and consumer proposals are legal tools for financial recovery — not permanent barriers to vehicle ownership. Many of our lending partners specialize in post-bankruptcy financing. The key factors are your current income stability, time since filing or discharge, and demonstrated ability to manage new credit responsibly.', 1, IMAGES.handshake),
        featuresSection('Bankruptcy Programs', 'What to Expect', [
          { title: 'During Proposal', description: 'Some lenders approve applicants with active consumer proposals.', icon: 'file' },
          { title: 'Post-Discharge', description: 'More options become available after bankruptcy discharge.', icon: 'unlock' },
          { title: 'Income Focus', description: 'Stable employment is often weighted more heavily than past insolvency.', icon: 'briefcase' },
          { title: 'Rebuild Strategy', description: 'An auto loan can be a powerful credit-rebuilding tool.', icon: 'trending-up' },
        ], 2),
        ctaBanner('Bankruptcy CTA', 'Your Fresh Start Includes Reliable Transportation', 'Let us explore what is available for your specific situation.', 3),
      ],
    },
    {
      title: 'Self-Employed Financing',
      slug: 'self-employed',
      status: 'published' as const,
      seoTitle: 'Self-Employed Car Loans Ontario',
      seoDescription: 'Vehicle financing for self-employed and business owners in Ontario using alternative income verification.',
      sections: [
        heroSection('Self-Employed Hero', 'Self-Employed? We Understand Your Income.', 'Financing programs that use bank statements, tax returns, and business revenue — not just pay stubs.', 0, IMAGES.office, 'Apply Now', '/apply', 'Self-Employed Programs'),
        contentBlock('Proving Your Income', 'Beyond the Pay Stub', 'Self-employed Canadians — freelancers, contractors, small business owners, and gig workers — often earn well but struggle with traditional financing because their income looks irregular on paper. Our partner lenders accept bank statements, Notice of Assessment (NOA), and business financials as proof of income.', 1, IMAGES.mechanic),
        featuresSection('Self-Employed Solutions', 'Documentation Options', [
          { title: 'Bank Statements', description: '3-6 months of business or personal account deposits.', icon: 'file-text' },
          { title: 'Tax Returns', description: 'Recent T1 General and NOA from Canada Revenue Agency.', icon: 'file' },
          { title: 'Business Revenue', description: 'GST/HST returns and profit-and-loss statements accepted.', icon: 'bar-chart' },
          { title: 'Mixed Income', description: 'Programs for those with both employment and self-employment income.', icon: 'layers' },
        ], 2),
        ctaBanner('Self-Employed CTA', 'Your Business Success Should Not Block Your Commute', 'Apply with the income documentation you actually have.', 3),
      ],
    },
    {
      title: 'Newcomer Financing',
      slug: 'newcomer',
      status: 'published' as const,
      seoTitle: 'Newcomer Car Loans Canada',
      seoDescription: 'Vehicle financing for newcomers to Canada without established Canadian credit history.',
      sections: [
        heroSection('Newcomer Hero', 'New to Canada? Welcome — and Let Us Help You Drive.', 'Specialized programs for permanent residents, work permit holders, and new citizens.', 0, IMAGES.cityDrive, 'Apply Now', '/apply', 'Newcomer Programs'),
        contentBlock('Starting Fresh in Canada', 'Building Your Canadian Credit', 'Arriving in Canada with no local credit history is completely normal. You may have an excellent credit record in your home country, but Canadian lenders cannot access it. Newcomer programs use your immigration status, employment letter, down payment, and international references to assess your application.', 1, IMAGES.family),
        featuresSection('Newcomer Programs', 'Who Qualifies', [
          { title: 'Permanent Residents', description: 'Programs available shortly after landing in Canada.', icon: 'home' },
          { title: 'Work Permit Holders', description: 'Valid work permits with stable employment accepted.', icon: 'briefcase' },
          { title: 'International Students', description: 'Some programs available with co-signer or larger down payment.', icon: 'book' },
          { title: 'Foreign Credit Transfer', description: 'Select lenders consider international banking relationships.', icon: 'globe' },
        ], 2),
        ctaBanner('Newcomer CTA', 'Your Canadian Journey Deserves Reliable Transportation', 'Apply today and start building your Canadian credit history.', 3),
      ],
    },
    {
      title: '$0 Down Payment',
      slug: 'zero-down',
      status: 'published' as const,
      seoTitle: '$0 Down Car Loans Ontario',
      seoDescription: 'Explore zero down payment vehicle financing options in Ontario through Approval Hero.',
      sections: [
        heroSection('Zero Down Hero', '$0 Down Payment Programs', 'Explore vehicle financing with no money down — subject to lender approval and eligibility.', 0, IMAGES.zeroDown, 'Apply Now', '/apply', 'Zero Down'),
        contentBlock('Understanding Zero Down', 'What Does $0 Down Mean?', 'A zero-down program means you finance the full purchase price of the vehicle without an upfront cash payment. These programs are subject to lender criteria including credit score, income, debt-to-income ratio, and vehicle age/mileage. Not every applicant will qualify for zero down, but it is worth exploring — especially if saving for a down payment would delay your transportation needs.', 1, IMAGES.showroom),
        featuresSection('Zero Down Benefits', 'Why Consider $0 Down', [
          { title: 'Preserve Savings', description: 'Keep your emergency fund intact while getting a reliable vehicle.', icon: 'piggy-bank' },
          { title: 'Faster Access', description: 'No need to wait months saving for a down payment.', icon: 'zap' },
          { title: 'Trade-In Equity', description: 'Your trade-in value may cover the down payment requirement entirely.', icon: 'repeat' },
          { title: 'Flexible Programs', description: 'Multiple lenders offer varying zero-down terms.', icon: 'sliders' },
        ], 2),
        contentBlock('Important Disclaimer', 'Subject to Approval', 'Zero-down financing is not guaranteed and depends on individual creditworthiness, income verification, and lender policies. Interest rates and terms may differ from programs requiring a down payment. Approval Hero will always present terms transparently before you commit.', 3, IMAGES.credit),
        ctaBanner('Zero Down CTA', 'See If You Qualify for $0 Down', 'Apply now for a free, no-obligation assessment.', 4),
      ],
    },
    {
      title: 'Gallery',
      slug: 'gallery',
      status: 'published' as const,
      seoTitle: 'Vehicle Gallery',
      seoDescription: 'Browse vehicles and customer moments from Approval Hero partner dealerships.',
      sections: [
        heroSection('Gallery Hero', 'Our Gallery', 'Explore vehicles and moments from our partner network across Ontario.', 0, IMAGES.parkingLot, 'View Inventory', '/apply', 'Gallery'),
        contentBlock('Partner Inventory', 'Quality Vehicles for Every Budget', 'Our partner dealerships maintain diverse inventories including sedans, SUVs, trucks, and crossovers. Vehicles are inspected and come with available warranty options. Browse our gallery for a sample of what is available — contact us to check current inventory in your area.', 1, IMAGES.suv),
        {
          name: 'Gallery Grid',
          sectionType: 'gallery-grid',
          heading: 'Featured Vehicles & Customer Moments',
          subheading: 'A sample of inventory and experiences from our Ontario partner network.',
          isVisible: true,
          order: 2,
        },
        featuresSection('Vehicle Types', 'What You Will Find', [
          { title: 'SUVs & Crossovers', description: 'Family-friendly options with space and safety features.', icon: 'truck', image: img(IMAGES.suv, 'SUV') },
          { title: 'Sedans', description: 'Fuel-efficient daily drivers for commuting.', icon: 'car', image: img(IMAGES.sedan, 'Sedan') },
          { title: 'Trucks', description: 'Work-ready pickups for business and recreation.', icon: 'truck', image: img(IMAGES.truck, 'Truck') },
        ], 3),
        ctaBanner('Gallery CTA', 'Found Something You Like?', 'Contact us to check availability and financing options.', 4),
      ],
    },
    {
      title: 'Testimonials & FAQs',
      slug: 'testimonials-faqs',
      status: 'published' as const,
      seoTitle: 'Testimonials & FAQs',
      seoDescription: 'Read customer testimonials and frequently asked questions about Approval Hero vehicle financing.',
      sections: [
        heroSection('Testimonials Hero', 'What Our Customers Say', 'Real stories from Ontario drivers who found financing through Approval Hero.', 0, IMAGES.happyCustomer, 'Share Your Story', '/apply'),
        {
          name: 'Testimonials Grid',
          sectionType: 'testimonials-slider',
          heading: 'Customer Testimonials',
          subheading: 'Hear from drivers across Ontario who worked with Approval Hero.',
          metadata: { showAll: true },
          isVisible: true,
          order: 1,
        },
        contentBlock('Customer Stories', 'Trusted by Ontario Drivers', 'We are proud of the relationships we have built with customers across the province. Read their experiences below and explore our FAQ section for answers to common questions about the financing process.', 2, IMAGES.handshake),
        {
          name: 'FAQ Section',
          sectionType: 'faq-preview',
          heading: 'Frequently Asked Questions',
          subheading: 'Find answers to common questions about vehicle financing.',
          metadata: { showAll: true },
          textAlignment: 'center',
          isVisible: true,
          order: 3,
        },
        ctaBanner('Testimonials CTA', 'Have Questions? We Are Here to Help.', 'Contact our team or browse the full FAQ below.', 4, 'Contact Us', '/contact'),
      ],
    },
    {
      title: 'Contact',
      slug: 'contact',
      status: 'published' as const,
      seoTitle: 'Contact Approval Hero',
      seoDescription: 'Contact Approval Hero for vehicle financing assistance in Ontario. Call 416-700-2656 or apply online.',
      sections: [
        heroSection('Contact Hero', 'Get In Touch', 'Ready to explore your financing options? We are here to help.', 0, IMAGES.office, 'Call Now', 'tel:4167002656', 'Contact'),
        { name: 'Contact Form', sectionType: 'form-section', heading: 'Apply Online', subheading: 'Complete the form below and a financing specialist will contact you within one business day.', body: 'Fields: name, email, phone, credit situation, vehicle preference, message, consent.', textAlignment: 'center', isVisible: true, order: 1 },
        featuresSection('Contact Info', 'Other Ways to Reach Us', [
          { title: 'Phone', description: '416-700-2656 — Mon-Fri 9AM-6PM, Sat 10AM-4PM', icon: 'phone' },
          { title: 'Email', description: 'ak_2123@hotmail.com — We respond within 24 hours', icon: 'mail' },
          { title: 'Service Area', description: 'Greater Toronto Area and all of Ontario', icon: 'map-pin' },
        ], 2),
        contentBlock('What Happens Next', 'After You Apply', 'Once we receive your application, a financing specialist will review your information and contact you to discuss your situation. This initial conversation is free and carries no obligation. We will explain available programs, estimated payments, and next steps based on your unique profile.', 3, IMAGES.handshake),
      ],
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      status: 'published' as const,
      seoTitle: 'Privacy Policy',
      seoDescription: 'Approval Hero privacy policy — how we collect, use, and protect your personal information.',
      noIndex: false,
      sections: [
        heroSection('Privacy Hero', 'Privacy Policy', 'How Approval Hero protects and uses your personal information.', 0, IMAGES.office, undefined, undefined, 'Legal'),
        contentBlock('Information We Collect', 'Personal Information', 'We collect information you provide directly, including your name, email address, phone number, employment details, housing information, and credit situation when you submit an application or contact form. We may also collect technical data such as IP address, browser type, and pages visited through cookies and analytics tools.', 1),
        contentBlock('How We Use Your Information', 'Purpose of Collection', 'Your information is used to process financing applications, connect you with appropriate lending partners, respond to inquiries, send relevant communications about your application, and improve our services. We do not sell your personal information to third parties.', 2),
        contentBlock('Data Security', 'Protecting Your Data', 'We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information. While no system is 100% secure, we take reasonable steps to safeguard your data against unauthorized access, alteration, or disclosure.', 3),
        contentBlock('Your Rights', 'Access and Control', 'You may request access to, correction of, or deletion of your personal information by contacting us at ak_2123@hotmail.com. You may also withdraw consent for marketing communications at any time. This policy was last updated in 2025.', 4),
      ],
    },
    {
      title: 'Terms of Service',
      slug: 'terms',
      status: 'published' as const,
      seoTitle: 'Terms of Service',
      seoDescription: 'Approval Hero terms of service for vehicle financing assistance services in Ontario.',
      sections: [
        heroSection('Terms Hero', 'Terms of Service', 'Terms governing your use of Approval Hero services and website.', 0, IMAGES.office, undefined, undefined, 'Legal'),
        contentBlock('Service Description', 'What Approval Hero Provides', 'Approval Hero is a vehicle financing assistance service that connects customers with dealer and lending partners. We are not a direct lender, bank, or credit union. We do not make lending decisions, set interest rates, or guarantee financing approval. All lending decisions are made solely by our partner institutions.', 1),
        contentBlock('User Responsibilities', 'Your Obligations', 'By using our services, you agree to provide accurate and complete information in your applications. Misrepresentation of income, employment, or credit history may result in application denial and could constitute fraud. You are responsible for reviewing and understanding all financing terms before signing any agreement with a lending partner.', 2),
        contentBlock('Limitation of Liability', 'Disclaimer', 'Approval Hero is not liable for lending decisions, vehicle conditions, dealership practices, or disputes between you and any lending partner or dealer. Financing terms including rates, payments, and eligibility are determined exclusively by lenders. Vehicle images and payment examples on this website are illustrative only.', 3),
        contentBlock('Governing Law', 'Jurisdiction', 'These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario. We reserve the right to update these terms at any time with notice posted on this page.', 4),
      ],
    },
  ];
}

async function seedPages(): Promise<void> {
  const pages = buildPages();
  await Page.insertMany(pages);
  logger.info(`Created ${pages.length} pages.`);
}

async function seedTestimonials(): Promise<mongoose.Types.ObjectId[]> {
  const testimonials = await Testimonial.insertMany([
    {
      customerName: 'Marcus T.',
      quote: 'After my divorce tanked my credit score, I thought I would be taking the bus forever. Approval Hero found me a program with a manageable payment and I am now driving a reliable SUV for my kids.',
      rating: 5,
      location: 'Scarborough, ON',
      profileImage: img(IMAGES.happyCustomer, 'Marcus T.'),
      date: new Date('2024-11-15'),
      isFeatured: true,
      order: 0,
      status: 'published',
    },
    {
      customerName: 'Priya S.',
      quote: 'As a newcomer with no Canadian credit history, every dealership turned me away. Approval Hero connected me with a lender who understood my situation. I had my sedan within two weeks.',
      rating: 5,
      location: 'Brampton, ON',
      date: new Date('2024-10-22'),
      isFeatured: true,
      order: 1,
      status: 'published',
    },
    {
      customerName: 'James R.',
      quote: 'I am self-employed and my income varies month to month. They used my bank statements instead of pay stubs and got me approved. Professional, fast, and no judgment.',
      rating: 5,
      location: 'Mississauga, ON',
      date: new Date('2025-01-08'),
      isFeatured: true,
      order: 2,
      status: 'published',
    },
    {
      customerName: 'Linda M.',
      quote: 'Coming out of a consumer proposal, I did not think anyone would finance me. Approval Hero was honest about my options and helped me rebuild my credit with an affordable car loan.',
      rating: 4,
      location: 'Hamilton, ON',
      date: new Date('2024-09-30'),
      isFeatured: false,
      order: 3,
      status: 'published',
    },
    {
      customerName: 'Ahmed K.',
      quote: 'The $0 down program was exactly what I needed. I did not have savings for a down payment but desperately needed a car for my new job. They made it happen.',
      rating: 5,
      location: 'Toronto, ON',
      date: new Date('2025-02-14'),
      isFeatured: true,
      order: 4,
      status: 'published',
    },
    {
      customerName: 'Sarah W.',
      quote: 'First-time buyer with zero credit history. They walked me through every step and explained all the terms clearly. I never felt pressured. Highly recommend Approval Hero.',
      rating: 5,
      location: 'Oshawa, ON',
      date: new Date('2024-12-05'),
      isFeatured: false,
      order: 5,
      status: 'published',
    },
  ]);
  logger.info(`Created ${testimonials.length} testimonials.`);
  return testimonials.map((t) => t._id);
}

async function seedFaqs(): Promise<{ categories: mongoose.Types.ObjectId[]; faqIds: mongoose.Types.ObjectId[] }> {
  const catData = [
    { name: 'General', slug: 'general', order: 0 },
    { name: 'Application Process', slug: 'application-process', order: 1 },
    { name: 'Credit & Eligibility', slug: 'credit-eligibility', order: 2 },
    { name: 'Payments & Terms', slug: 'payments-terms', order: 3 },
  ];
  const categories = await FAQCategory.insertMany(catData);
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const faqData = [
    { categoryId: catMap['general'], question: 'What is Approval Hero?', answer: 'Approval Hero is a vehicle financing assistance service based in Ontario. We connect customers with dealer and lending partners who specialize in programs for various credit situations, including bad credit, no credit, bankruptcy, and zero-down options.', order: 0, isFeatured: true },
    { categoryId: catMap['general'], question: 'Is Approval Hero a lender?', answer: 'No. Approval Hero is not a bank, credit union, or direct lender. We work with a network of lending partners who make all credit decisions, set rates, and establish loan terms. Our role is to match you with appropriate programs.', order: 1, isFeatured: true },
    { categoryId: catMap['general'], question: 'What areas do you serve?', answer: 'We primarily serve the Greater Toronto Area and all of Ontario. Our lending and dealer partners have coverage across the province, so customers in cities like Ottawa, London, Hamilton, and Windsor can also access our programs.', order: 2 },
    { categoryId: catMap['application-process'], question: 'How do I apply?', answer: 'You can apply online through our contact page, call us at 416-700-2656, or email ak_2123@hotmail.com. The online application takes about 5 minutes and requires basic personal, employment, and housing information.', order: 0, isFeatured: true },
    { categoryId: catMap['application-process'], question: 'Does applying affect my credit score?', answer: 'The initial inquiry through Approval Hero does not perform a hard credit pull. If you proceed with a specific lending partner, they may perform a credit check as part of their approval process. We always recommend asking before any hard inquiry is made.', order: 1 },
    { categoryId: catMap['application-process'], question: 'How long does approval take?', answer: 'Most customers hear back within 24-48 business hours after submitting a complete application. Complex situations may take slightly longer. We prioritize fast communication so you are never left wondering about your status.', order: 2 },
    { categoryId: catMap['application-process'], question: 'What documents do I need?', answer: 'Typically: valid photo ID, proof of income (pay stubs, bank statements, or tax returns), proof of residence (utility bill or lease), and insurance information. Self-employed applicants should have 3-6 months of bank statements. Newcomers may need immigration documents and employment letters.', order: 3 },
    { categoryId: catMap['credit-eligibility'], question: 'Can I get approved with bad credit?', answer: 'Many of our lending partners specialize in subprime financing for credit scores below 600. Approval is not guaranteed and depends on factors including income, employment stability, debt-to-income ratio, and down payment. We encourage you to apply so we can assess your specific situation.', order: 0, isFeatured: true },
    { categoryId: catMap['credit-eligibility'], question: 'Can I finance a car during bankruptcy?', answer: 'Some lenders work with applicants who have active consumer proposals or recent bankruptcy discharges. Options are more limited and terms may differ from standard programs. Contact us to discuss your specific insolvency status and timeline.', order: 1 },
    { categoryId: catMap['credit-eligibility'], question: 'I have no credit history. Can I still qualify?', answer: 'Yes. First-time buyer and newcomer programs use alternative verification such as employment history, rent payments, bank account activity, and co-signers. Having no credit is different from bad credit, and there are programs designed specifically for your situation.', order: 2 },
    { categoryId: catMap['credit-eligibility'], question: 'Do you offer $0 down payment programs?', answer: 'Zero-down programs are available through select lending partners, subject to creditworthiness, income verification, and vehicle eligibility. Not all applicants will qualify. Trade-in equity may also satisfy down payment requirements.', order: 3, isFeatured: true },
    { categoryId: catMap['payments-terms'], question: 'What interest rates should I expect?', answer: 'Rates vary widely based on credit profile, loan term, vehicle age, and lender. Subprime rates are typically higher than prime rates. We present all terms transparently before you commit to any agreement. There are no hidden fees from Approval Hero.', order: 0 },
    { categoryId: catMap['payments-terms'], question: 'What loan terms are available?', answer: 'Most auto loans range from 36 to 84 months. Longer terms mean lower monthly payments but more interest paid over time. Your specialist will help you find the right balance between payment affordability and total cost.', order: 1 },
    { categoryId: catMap['payments-terms'], question: 'Can I pay off my loan early?', answer: 'Most Canadian auto loans allow early repayment, though some lenders charge a prepayment penalty. Review your specific loan agreement for details. Paying off early can save significant interest and further improve your credit score.', order: 2 },
  ];

  const faqs = await FAQ.insertMany(faqData.map((f) => ({ ...f, status: 'published' })));
  logger.info(`Created ${categories.length} FAQ categories and ${faqs.length} FAQs.`);
  return { categories: categories.map((c) => c._id), faqIds: faqs.map((f) => f._id) };
}

function buildServices(testimonialIds: mongoose.Types.ObjectId[], faqIds: mongoose.Types.ObjectId[]) {
  const standardProcess = [
    { step: 1, title: 'Apply Online', description: 'Submit your application with basic personal and financial information.' },
    { step: 2, title: 'Specialist Review', description: 'A financing expert reviews your profile and identifies matching programs.' },
    { step: 3, title: 'Choose Your Vehicle', description: 'Select from partner inventory within your approved financing range.' },
    { step: 4, title: 'Finalize & Drive', description: 'Complete paperwork, arrange insurance, and take delivery of your vehicle.' },
  ];

  const serviceDefs = [
    {
      title: 'Bad Credit Financing',
      shortDescription: 'Vehicle financing programs for Ontario drivers with credit scores below 600.',
      cardImage: img(IMAGES.credit, 'Bad credit financing'),
      icon: 'trending-up',
      badge: 'Popular',
      highlights: ['Scores below 600 accepted', 'Credit rebuilding opportunity', 'Flexible terms available'],
      order: 0,
      isFeatured: true,
      heroImage: IMAGES.credit,
      introduction: 'Bad credit does not have to mean no car. Our subprime lending partners regularly approve applicants with credit challenges.',
    },
    {
      title: 'No Credit Financing',
      shortDescription: 'First-time buyer programs for applicants with no established credit history.',
      cardImage: img(IMAGES.keys, 'No credit financing'),
      icon: 'user-plus',
      highlights: ['First-time buyers welcome', 'Co-signer options', 'Credit building from day one'],
      order: 1,
      isFeatured: true,
      heroImage: IMAGES.keys,
      introduction: 'Starting with no credit history? Our first-time buyer programs use alternative verification to get you approved.',
    },
    {
      title: 'Bankruptcy & Consumer Proposal',
      shortDescription: 'Financing options during or after bankruptcy and consumer proposals.',
      cardImage: img(IMAGES.office, 'Bankruptcy financing'),
      icon: 'file-text',
      badge: 'Specialized',
      highlights: ['Active proposal options', 'Post-discharge programs', 'Income-focused assessment'],
      order: 2,
      isFeatured: true,
      heroImage: IMAGES.office,
      introduction: 'Insolvency is a fresh start, not a dead end. We connect you with lenders who understand post-bankruptcy financing.',
    },
    {
      title: 'Self-Employed Financing',
      shortDescription: 'Auto loans for freelancers, contractors, and business owners using alternative income docs.',
      cardImage: img(IMAGES.mechanic, 'Self-employed financing'),
      icon: 'briefcase',
      highlights: ['Bank statement programs', 'Tax return acceptance', 'Mixed income support'],
      order: 3,
      isFeatured: false,
      heroImage: IMAGES.mechanic,
      introduction: 'Self-employed income does not fit on a pay stub. Our partners accept bank statements, NOAs, and business financials.',
    },
    {
      title: 'Newcomer to Canada',
      shortDescription: 'Vehicle financing for new permanent residents and work permit holders.',
      cardImage: img(IMAGES.cityDrive, 'Newcomer financing'),
      icon: 'globe',
      highlights: ['No Canadian credit required', 'Work permit programs', 'PR and citizen options'],
      order: 4,
      isFeatured: true,
      heroImage: IMAGES.cityDrive,
      introduction: 'New to Canada? Build your credit history with your first Canadian auto loan through our newcomer programs.',
    },
    {
      title: '$0 Down Payment',
      shortDescription: 'Explore zero down payment vehicle financing subject to lender approval.',
      cardImage: img(IMAGES.zeroDown, '$0 down financing'),
      icon: 'dollar-sign',
      badge: 'Hot',
      highlights: ['No upfront cash required', 'Trade-in equity accepted', 'Subject to approval'],
      order: 5,
      isFeatured: true,
      heroImage: IMAGES.zeroDown,
      introduction: 'Keep your savings intact while getting the vehicle you need with our zero-down payment programs.',
    },
    {
      title: 'Trade-In Assistance',
      shortDescription: 'Maximize your current vehicle value to strengthen your financing application.',
      cardImage: img(IMAGES.sedan, 'Trade-in assistance'),
      icon: 'repeat',
      highlights: ['Fair market evaluation', 'Equity applied to down payment', 'Simplified process'],
      order: 6,
      isFeatured: false,
      heroImage: IMAGES.sedan,
      introduction: 'Your current vehicle has value. We help you leverage trade-in equity to reduce your financing amount or cover down payment requirements.',
    },
    {
      title: 'Vehicle Selection Support',
      shortDescription: 'Expert guidance choosing a reliable vehicle within your approved budget.',
      cardImage: img(IMAGES.showroom, 'Vehicle selection'),
      icon: 'search',
      highlights: ['Budget-aligned options', 'Reliability focus', 'Partner inventory access'],
      order: 7,
      isFeatured: false,
      heroImage: IMAGES.showroom,
      introduction: 'Not sure what to buy? Our team helps you find a dependable vehicle that fits your approved financing amount and lifestyle needs.',
    },
  ];

  return serviceDefs.map((def, index) => ({
    title: def.title,
    slug: slugify(def.title),
    shortDescription: def.shortDescription,
    cardImage: def.cardImage,
    icon: def.icon,
    badge: def.badge,
    highlights: def.highlights,
    ctaLabel: 'Learn More',
    order: def.order,
    isFeatured: def.isFeatured,
    status: 'published' as const,
    seoTitle: `${def.title} | Approval Hero`,
    seoDescription: def.shortDescription,
    detailPage: {
      heroEyebrow: 'Approval Hero Service',
      heroTitle: def.title,
      heroSubtitle: def.shortDescription,
      heroBackgroundImage: img(def.heroImage, def.title),
      introduction: def.introduction,
      whoIsFor: `Ontario residents who need vehicle financing and match the profile for ${def.title.toLowerCase()}. Contact us to confirm eligibility for your specific situation.`,
      challenges: 'Traditional lenders often have rigid requirements that exclude applicants with non-standard credit or income profiles. This can leave capable, responsible people without transportation options.',
      howWeHelp: 'Approval Hero connects you with lending partners who specialize in your situation. We present options clearly, help you understand terms, and guide you through vehicle selection and finalization.',
      process: standardProcess,
      requiredInfo: 'Valid photo ID, proof of income, proof of residence, and details about your credit situation. Additional documents may be requested based on your specific program.',
      benefits: def.highlights,
      relatedFaqIds: faqIds.slice(0, 4),
      testimonialId: testimonialIds[index % testimonialIds.length],
      ctaTitle: 'Ready to Get Started?',
      ctaDescription: `Apply today to explore ${def.title.toLowerCase()} options available to you.`,
      sections: [
        {
          sectionType: 'content',
          title: 'Program Details',
          content: def.introduction,
          image: img(def.heroImage, def.title),
          order: 0,
          isVisible: true,
        },
        {
          sectionType: 'benefits',
          title: 'Key Benefits',
          items: def.highlights.map((h) => ({ title: h, description: '', icon: 'check' })),
          order: 1,
          isVisible: true,
        },
        {
          sectionType: 'process',
          title: 'Our Process',
          items: standardProcess.map((p) => ({ title: p.title, description: p.description })),
          order: 2,
          isVisible: true,
        },
      ],
      sectionImages: [
        img(def.heroImage, def.title),
        img(IMAGES.handshake, 'Customer consultation'),
        img(IMAGES.dealership, 'Partner dealership'),
      ],
      seoTitle: `${def.title} | Approval Hero Ontario`,
      seoDescription: def.shortDescription,
      ogImage: img(def.heroImage, def.title),
    },
  }));
}

async function seedServices(testimonialIds: mongoose.Types.ObjectId[], faqIds: mongoose.Types.ObjectId[]): Promise<void> {
  const services = buildServices(testimonialIds, faqIds);
  const created = await Service.insertMany(services);

  // Link related services
  const serviceIds = created.map((s) => s._id);
  for (let i = 0; i < created.length; i++) {
    const related = serviceIds.filter((_, j) => j !== i).slice(0, 3);
    await Service.findByIdAndUpdate(created[i]._id, {
      'detailPage.relatedServiceIds': related,
    });
  }

  logger.info(`Created ${created.length} services.`);
}

async function seedGallery(): Promise<void> {
  const categories = await GalleryCategory.insertMany([
    { name: 'SUVs', slug: 'suvs', description: 'Sport utility vehicles and crossovers from our partner inventory.', order: 0 },
    { name: 'Sedans', slug: 'sedans', description: 'Fuel-efficient sedans for daily commuting.', order: 1 },
    { name: 'Trucks', slug: 'trucks', description: 'Pickup trucks for work and recreation.', order: 2 },
    { name: 'Customer Moments', slug: 'customer-moments', description: 'Happy customers picking up their new vehicles.', order: 3 },
    { name: 'Vehicle Interiors', slug: 'vehicle-interiors', description: 'Quality interiors and features.', order: 4 },
    { name: 'Dealership Experience', slug: 'dealership-experience', description: 'Our partner dealership environments.', order: 5 },
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const galleryImages = [
    { categoryId: catMap['suvs'], title: 'Family SUV', alt: 'Black SUV in dealership lot', url: IMAGES.suv, vehicleType: 'SUV', isFeatured: true, order: 0 },
    { categoryId: catMap['suvs'], title: 'Crossover', alt: 'Silver crossover SUV', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920', vehicleType: 'Crossover', order: 1 },
    { categoryId: catMap['suvs'], title: 'Compact SUV', alt: 'White compact SUV', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293bb4?w=1920', vehicleType: 'SUV', order: 2 },
    { categoryId: catMap['suvs'], title: 'Premium SUV', alt: 'Luxury SUV front view', url: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=1920', vehicleType: 'SUV', order: 3 },
    { categoryId: catMap['sedans'], title: 'Sport Sedan', alt: 'Red sport sedan', url: IMAGES.sedan, vehicleType: 'Sedan', isFeatured: true, order: 0 },
    { categoryId: catMap['sedans'], title: 'Executive Sedan', alt: 'Black executive sedan', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920', vehicleType: 'Sedan', order: 1 },
    { categoryId: catMap['sedans'], title: 'Compact Sedan', alt: 'Blue compact sedan', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920', vehicleType: 'Sedan', order: 2 },
    { categoryId: catMap['trucks'], title: 'Work Truck', alt: 'Pickup truck on job site', url: IMAGES.truck, vehicleType: 'Truck', isFeatured: true, order: 0 },
    { categoryId: catMap['trucks'], title: 'Heavy Duty', alt: 'Heavy duty pickup truck', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1920', vehicleType: 'Truck', order: 1 },
    { categoryId: catMap['trucks'], title: 'Adventure Truck', alt: 'Truck on mountain road', url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1920', vehicleType: 'Truck', order: 2 },
    { categoryId: catMap['customer-moments'], title: 'Keys Handover', alt: 'Customer receiving car keys', url: IMAGES.keys, isFeatured: true, order: 0 },
    { categoryId: catMap['customer-moments'], title: 'Happy Driver', alt: 'Smiling customer with new car', url: IMAGES.happyCustomer, order: 1 },
    { categoryId: catMap['customer-moments'], title: 'Family Pickup', alt: 'Family picking up new vehicle', url: IMAGES.family, order: 2 },
    { categoryId: catMap['customer-moments'], title: 'Deal Closing', alt: 'Handshake at dealership', url: IMAGES.handshake, order: 3 },
    { categoryId: catMap['vehicle-interiors'], title: 'Leather Interior', alt: 'Premium leather car interior', url: IMAGES.interior, isFeatured: true, order: 0 },
    { categoryId: catMap['vehicle-interiors'], title: 'Dashboard View', alt: 'Modern car dashboard', url: IMAGES.dashboard, order: 1 },
    { categoryId: catMap['vehicle-interiors'], title: 'Steering Wheel', alt: 'Car steering wheel close-up', url: IMAGES.steering, order: 2 },
    { categoryId: catMap['dealership-experience'], title: 'Showroom Floor', alt: 'Bright dealership showroom', url: IMAGES.showroom, isFeatured: true, order: 0 },
    { categoryId: catMap['dealership-experience'], title: 'Lot View', alt: 'Dealership parking lot with vehicles', url: IMAGES.parkingLot, order: 1 },
    { categoryId: catMap['dealership-experience'], title: 'Consultation', alt: 'Financing consultation at desk', url: IMAGES.office, order: 2 },
    { categoryId: catMap['dealership-experience'], title: 'Service Bay', alt: 'Vehicle inspection in service bay', url: IMAGES.mechanic, order: 3 },
  ];

  await GalleryImage.insertMany(
    galleryImages.map((g) => ({
      categoryId: g.categoryId,
      title: g.title,
      alt: g.alt,
      image: { url: g.url, thumbnailUrl: `${g.url}&h=400` },
      vehicleType: g.vehicleType,
      isFeatured: g.isFeatured ?? false,
      order: g.order,
      status: 'published' as const,
    })),
  );

  logger.info(`Created ${categories.length} gallery categories and ${galleryImages.length} images.`);
}

async function seedBlog(): Promise<void> {
  const categories = await BlogCategory.insertMany([
    { name: 'Financing Tips', slug: 'financing-tips', description: 'Advice for navigating vehicle financing in Ontario.' },
    { name: 'Credit Building', slug: 'credit-building', description: 'Strategies to improve and establish your credit score.' },
    { name: 'Industry News', slug: 'industry-news', description: 'Updates on the Ontario auto financing landscape.' },
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const posts = [
    {
      title: '5 Tips for Getting Approved with Bad Credit in Ontario',
      slug: 'tips-bad-credit-ontario',
      excerpt: 'Practical strategies to improve your chances of vehicle financing approval when your credit score is below 600.',
      categoryId: catMap['financing-tips'],
      tags: ['bad credit', 'ontario', 'tips', 'approval'],
      isFeatured: true,
      content: `<h2>Understanding Your Credit Situation</h2>
<p>Before applying for vehicle financing, obtain a free copy of your credit report from Equifax or TransUnion. Review it for errors — incorrect late payments or accounts that are not yours can unfairly lower your score. Disputing errors can sometimes improve your score within weeks.</p>
<h2>1. Be Realistic About Your Budget</h2>
<p>Lenders assess your debt-to-income ratio carefully. A vehicle payment that fits comfortably within 15-20% of your gross monthly income is more likely to be approved. Use our online application to discuss budget with a specialist before shopping.</p>
<h2>2. Consider a Down Payment</h2>
<p>Even $500-$1,000 down can significantly improve approval odds and reduce your interest rate. If cash is tight, a trade-in with equity serves the same purpose. Explore our <a href="/zero-down">$0 down programs</a> if saving is not possible.</p>
<h2>3. Choose an Appropriate Vehicle</h2>
<p>Lenders prefer financing newer, lower-mileage vehicles with strong resale value. A reliable 2-3 year old sedan is often easier to approve than an older luxury vehicle. Your specialist can recommend vehicles that match your approval profile.</p>
<h2>4. Gather Your Documents Early</h2>
<p>Having pay stubs, bank statements, proof of residence, and ID ready speeds up the process and demonstrates organization to lenders. Self-employed applicants should prepare 3-6 months of business bank statements.</p>
<h2>5. Work with Specialists</h2>
<p>Applying randomly at dealerships can result in multiple hard credit inquiries that further damage your score. Approval Hero submits your application to appropriate lenders strategically, minimizing unnecessary credit pulls.</p>
<p>Ready to explore your options? <a href="/contact">Apply today</a> for a free consultation.</p>`,
      coverImage: img(IMAGES.credit, 'Bad credit financing tips'),
      sectionImages: [
        { url: IMAGES.office, alt: 'Credit consultation', caption: 'Work with a financing specialist' },
        { url: IMAGES.dashboard, alt: 'Vehicle dashboard', caption: 'Choose the right vehicle for your budget' },
      ],
      author: 'Approval Hero Team',
      publishedAt: new Date('2025-01-20'),
      seoTitle: '5 Bad Credit Car Loan Tips for Ontario',
      seoDescription: 'Improve your chances of vehicle financing approval in Ontario with these five practical tips for bad credit applicants.',
    },
    {
      title: 'How Auto Loans Help Build Your Canadian Credit Score',
      slug: 'auto-loans-build-credit-canada',
      excerpt: 'An auto loan can be one of the most effective tools for establishing and rebuilding credit in Canada.',
      categoryId: catMap['credit-building'],
      tags: ['credit building', 'auto loan', 'canada', 'newcomer'],
      isFeatured: true,
      content: `<h2>Why Auto Loans Matter for Credit</h2>
<p>In Canada, your credit score is calculated based on payment history, credit utilization, length of credit history, types of credit, and recent inquiries. An installment loan like an auto loan adds a valuable credit type to your profile and — most importantly — creates a track record of on-time payments.</p>
<h2>Payment History Is King</h2>
<p>Payment history accounts for approximately 35% of your credit score. Every on-time monthly car payment is reported to Equifax and TransUnion, gradually building a positive history. Even one late payment can set you back, so set up automatic payments or calendar reminders.</p>
<h2>Installment vs. Revolving Credit</h2>
<p>Credit cards are revolving credit — lenders like to see you can manage fixed-payment installment loans too. An auto loan diversifies your credit mix, which accounts for about 10% of your score.</p>
<h2>Best Practices for Newcomers</h2>
<p>If you are new to Canada, an auto loan may be your first major credit account. Start with an affordable vehicle and reliable payment schedule. After 12-24 months of on-time payments, you will likely qualify for better rates on your next vehicle or a credit card.</p>
<h2>Rebuilding After Bankruptcy</h2>
<p>Post-bankruptcy, an auto loan is often recommended by credit counselors as a rebuilding tool. Subprime auto lenders report to credit bureaus, so consistent payments demonstrate financial responsibility to future lenders.</p>
<p>Explore our <a href="/no-credit">no credit programs</a> or <a href="/newcomer">newcomer financing</a> to get started.</p>`,
      coverImage: img(IMAGES.keys, 'Building credit with auto loan'),
      author: 'Approval Hero Team',
      publishedAt: new Date('2025-02-05'),
      seoTitle: 'How Auto Loans Build Credit in Canada',
      seoDescription: 'Learn how a vehicle loan can help establish and rebuild your Canadian credit score over time.',
    },
    {
      title: 'Self-Employed? Here Is How to Document Your Income for a Car Loan',
      slug: 'self-employed-income-documentation',
      excerpt: 'A guide to the income documents self-employed Canadians need when applying for vehicle financing.',
      categoryId: catMap['financing-tips'],
      tags: ['self-employed', 'income', 'documentation', 'car loan'],
      content: `<h2>The Self-Employed Challenge</h2>
<p>Traditional auto lenders ask for recent pay stubs — something most self-employed Canadians do not have. Fortunately, many subprime and alternative lenders accept other documentation to verify income.</p>
<h2>Accepted Documents</h2>
<ul>
<li><strong>Bank statements:</strong> 3-6 months of business or personal account statements showing regular deposits.</li>
<li><strong>Notice of Assessment (NOA):</strong> Your most recent NOA from the Canada Revenue Agency confirms reported income.</li>
<li><strong>T1 General tax return:</strong> Line 15000 (net income) is commonly used.</li>
<li><strong>GST/HST returns:</strong> Useful for businesses with significant revenue.</li>
<li><strong>Contracts and invoices:</strong> Long-term client contracts can demonstrate income stability.</li>
</ul>
<h2>Tips for a Stronger Application</h2>
<p>Separate business and personal finances with dedicated accounts. Maintain consistent deposits even if amounts vary. If you recently started your business, a co-signer or larger down payment strengthens your application.</p>
<p>Approval Hero specializes in <a href="/self-employed">self-employed financing</a>. Apply today and bring the documents you have — we will guide you from there.</p>`,
      coverImage: img(IMAGES.mechanic, 'Self-employed income docs'),
      author: 'Approval Hero Team',
      publishedAt: new Date('2025-03-10'),
      seoTitle: 'Self-Employed Car Loan Income Documentation',
      seoDescription: 'What income documents self-employed Canadians need for vehicle financing approval in Ontario.',
    },
    {
      title: 'Ontario Auto Financing Trends for 2025',
      slug: 'ontario-auto-financing-trends-2025',
      excerpt: 'Key trends shaping vehicle financing in Ontario this year — from rates to electric vehicle programs.',
      categoryId: catMap['industry-news'],
      tags: ['ontario', 'trends', '2025', 'auto financing'],
      content: `<h2>Interest Rate Environment</h2>
<p>After years of rate increases, the Bank of Canada has begun easing monetary policy. While prime auto loan rates are gradually declining, subprime rates remain elevated. Applicants with credit challenges should still expect higher rates than pre-2022 levels, making it important to shop programs through specialists like Approval Hero.</p>
<h2>Electric Vehicle Financing</h2>
<p>EV adoption continues to grow in Ontario. Federal iZEV incentives have shifted, but many lenders now offer competitive EV financing with longer terms. Used EV prices have normalized, making them accessible to subprime borrowers for the first time.</p>
<h2>Longer Loan Terms</h2>
<p>84-month (7-year) auto loans are increasingly common, especially for subprime applicants seeking lower monthly payments. While this reduces monthly cost, borrowers pay more interest over time. We help customers understand the total cost before committing.</p>
<h2>Digital-First Applications</h2>
<p>More lenders now accept fully digital applications with e-signatures and virtual document submission. Approval Hero has embraced this shift — our online application and digital document process means faster approvals without multiple dealership visits.</p>
<h2>Increased Newcomer Demand</h2>
<p>With record immigration levels, demand for newcomer auto financing programs has surged. Lenders are expanding alternative verification methods to serve this growing market. Approval Hero's <a href="/newcomer">newcomer programs</a> are designed for exactly this audience.</p>`,
      coverImage: img(IMAGES.cityDrive, 'Ontario auto financing 2025'),
      author: 'Approval Hero Team',
      publishedAt: new Date('2025-04-01'),
      seoTitle: 'Ontario Auto Financing Trends 2025',
      seoDescription: 'Key vehicle financing trends in Ontario for 2025 including rates, EVs, and newcomer programs.',
    },
  ];

  await BlogPost.insertMany(posts.map((p) => ({ ...p, status: 'published' as const, ogImage: p.coverImage })));
  logger.info(`Created ${categories.length} blog categories and ${posts.length} blog posts.`);
}

async function seedOffer(): Promise<void> {
  await Offer.create({
    name: '$0 Down Payment',
    description:
      'Explore vehicle financing with no money down! Subject to lender approval, credit assessment, and eligibility. Keep your savings while getting the reliable transportation you need.',
    disclaimer:
      'Zero-down financing is not guaranteed. Approval, rates, and terms are determined by lending partners based on individual creditworthiness, income, and vehicle eligibility. See representative for details.',
    image: img(IMAGES.zeroDown, '$0 Down Payment Offer'),
    ctaLabel: 'Apply for $0 Down',
    ctaLink: '/zero-down',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isActive: true,
    displayLocation: ['home', 'zero-down', 'header-banner', 'popup'],
  });
  logger.info('$0 Down offer created.');
}

async function seedLeads(): Promise<void> {
  await Lead.insertMany([
    {
      submissionType: 'application',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '647-555-0142',
      preferredContact: 'phone',
      province: 'ON',
      creditSituation: 'Bad credit (score ~520)',
      vehiclePreference: 'SUV',
      message: 'Looking for a reliable family SUV. Currently employed full-time for 2 years.',
      consent: true,
      sourcePage: '/bad-credit',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'bad-credit-ontario',
      status: 'New',
    },
    {
      submissionType: 'contact',
      name: 'Fatima Al-Rashid',
      email: 'fatima.ar@example.com',
      phone: '905-555-0198',
      preferredContact: 'email',
      province: 'ON',
      creditSituation: 'Newcomer - no Canadian credit',
      vehiclePreference: 'Sedan',
      message: 'Arrived in Canada 6 months ago on a work permit. Need a car for commuting.',
      consent: true,
      sourcePage: '/newcomer',
      status: 'Contacted',
      assignedNote: 'Scheduled callback for Thursday 2pm',
    },
    {
      submissionType: 'lead',
      name: 'Robert MacLeod',
      email: 'r.macleod@example.com',
      phone: '416-555-0167',
      preferredContact: 'phone',
      province: 'ON',
      creditSituation: 'Discharged bankruptcy (6 months ago)',
      vehiclePreference: 'Truck',
      message: 'Self-employed contractor, discharged bankruptcy 6 months ago. Steady income via bank deposits.',
      consent: true,
      sourcePage: '/self-employed',
      utmSource: 'facebook',
      utmMedium: 'social',
      status: 'Qualified',
    },
  ]);
  logger.info('Created 3 sample leads (development mode).');
}

async function seed(): Promise<void> {
  logger.info('Starting Approval Hero database seed...');
  if (CLEAR_FLAG) {
    logger.info('--clear flag detected.');
  }

  await connectDatabase();

  if (CLEAR_FLAG) {
    await clearData();
  }

  await seedSiteSettings();
  await seedNavigation();
  await seedPages();
  const testimonialIds = await seedTestimonials();
  const { faqIds } = await seedFaqs();
  await seedServices(testimonialIds, faqIds);
  await seedGallery();
  await seedBlog();
  await seedOffer();

  if (env.isDev) {
    await seedLeads();
  }

  logger.info('Seed completed successfully!');
  logger.info('Summary: Site settings, navigation, 17 pages, 8 services, 6 gallery categories, 6 testimonials, 4 FAQ categories, 14 FAQs, 3 blog categories, 4 blog posts, 1 offer' + (env.isDev ? ', 3 sample leads' : ''));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  logger.error('Seed failed:', error);
  process.exit(1);
});
