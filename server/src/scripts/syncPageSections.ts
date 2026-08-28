/**
 * Sync specific CMS page sections from seed definitions without wiping the database.
 * Usage: npx ts-node src/scripts/syncPageSections.ts
 */
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Page, BlogPost, FAQ, SiteSettings } from '../models';
import { logger } from '../utils/logger';

// Import buildPages from seed - we'll duplicate minimal updates for gallery + testimonials
async function sync(): Promise<void> {
  await connectDatabase();

  await Page.updateOne(
    { slug: 'gallery' },
    {
      $set: {
        sections: [
          {
            name: 'Gallery Hero',
            sectionType: 'hero',
            eyebrow: 'Gallery',
            heading: 'Our Gallery',
            subheading: 'Explore vehicles and moments from our partner network across Ontario.',
            ctaLabel: 'View Inventory',
            ctaLink: '/apply',
            backgroundImage: { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920', alt: 'Our Gallery' },
            textAlignment: 'left',
            isVisible: true,
            order: 0,
          },
          {
            name: 'Partner Inventory',
            sectionType: 'content-block',
            heading: 'Quality Vehicles for Every Budget',
            body: 'Our partner dealerships maintain diverse inventories including sedans, SUVs, trucks, and crossovers. Vehicles are inspected and come with available warranty options. Browse our gallery for a sample of what is available — contact us to check current inventory in your area.',
            primaryImage: { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1920', alt: 'Quality Vehicles for Every Budget' },
            isVisible: true,
            order: 1,
          },
          {
            name: 'Gallery Grid',
            sectionType: 'gallery-grid',
            heading: 'Featured Vehicles & Customer Moments',
            subheading: 'A sample of inventory and experiences from our Ontario partner network.',
            isVisible: true,
            order: 2,
          },
          {
            name: 'Vehicle Types',
            sectionType: 'features',
            heading: 'What You Will Find',
            items: [
              { title: 'SUVs & Crossovers', description: 'Family-friendly options with space and safety features.', icon: 'truck' },
              { title: 'Sedans', description: 'Fuel-efficient daily drivers for commuting.', icon: 'car' },
              { title: 'Trucks', description: 'Work-ready pickups for business and recreation.', icon: 'truck' },
            ],
            isVisible: true,
            order: 3,
          },
          {
            name: 'Gallery CTA',
            sectionType: 'cta-banner',
            heading: 'Found Something You Like?',
            subheading: 'Contact us to check availability and financing options.',
            ctaLabel: 'Get Pre-Qualified',
            ctaLink: '/apply',
            isVisible: true,
            order: 4,
          },
        ],
      },
    },
  );

  await Page.updateOne(
    { slug: 'testimonials-faqs' },
    {
      $set: {
        sections: [
          {
            name: 'Testimonials Hero',
            sectionType: 'hero',
            heading: 'What Our Customers Say',
            subheading: 'Real stories from Ontario drivers who found financing through Approval Hero.',
            ctaLabel: 'Share Your Story',
            ctaLink: '/apply',
            backgroundImage: { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920', alt: 'What Our Customers Say' },
            isVisible: true,
            order: 0,
          },
          {
            name: 'Testimonials Grid',
            sectionType: 'testimonials-slider',
            heading: 'Customer Testimonials',
            subheading: 'Hear from drivers across Ontario who worked with Approval Hero.',
            metadata: { showAll: true },
            isVisible: true,
            order: 1,
          },
          {
            name: 'Customer Stories',
            sectionType: 'content-block',
            heading: 'Trusted by Ontario Drivers',
            body: 'We are proud of the relationships we have built with customers across the province. Read their experiences below and explore our FAQ section for answers to common questions about the financing process.',
            primaryImage: { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1920', alt: 'Trusted by Ontario Drivers' },
            isVisible: true,
            order: 2,
          },
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
          {
            name: 'Testimonials CTA',
            sectionType: 'cta-banner',
            heading: 'Have Questions? We Are Here to Help.',
            subheading: 'Contact our team or browse the full FAQ below.',
            ctaLabel: 'Contact Us',
            ctaLink: '/contact',
            isVisible: true,
            order: 4,
          },
        ],
      },
    },
  );

  await Page.updateOne(
    { slug: 'about' },
    {
      $set: {
        sections: [
          {
            name: 'About Hero',
            sectionType: 'hero',
            eyebrow: 'Our Story',
            heading: 'About Approval Hero',
            subheading: 'Helping Ontario Drivers Get Back on the Road.',
            body: 'We connect drivers with dealer and lending partners who understand challenging credit — so you can move forward with confidence.',
            ctaLabel: 'Get Pre-Qualified',
            ctaLink: '/apply',
            backgroundImage: { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2001?w=1920&q=85', alt: 'About Approval Hero' },
            metadata: { innerPage: true },
            isVisible: true,
            order: 0,
          },
          {
            name: 'Who We Are',
            sectionType: 'content-block',
            eyebrow: 'Who We Are',
            heading: 'Your Partner in Vehicle Financing',
            body: '<p>Approval Hero was founded with a simple mission: make vehicle financing accessible to everyone in Ontario, regardless of credit history.</p><p>We are not a bank or direct lender. Instead, we work with a network of dealers and lending partners who specialize in programs for bad credit, no credit, bankruptcy, self-employed applicants, and newcomers to Canada.</p>',
            primaryImage: { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1920', alt: 'Your Partner in Vehicle Financing' },
            ctaLabel: 'Explore Our Programs',
            ctaLink: '/services',
            isVisible: true,
            order: 1,
          },
          {
            name: 'What We Believe',
            sectionType: 'content-block',
            eyebrow: 'Our Philosophy',
            heading: 'Everyone Deserves a Second Chance',
            body: '<p>Credit challenges often come from circumstances beyond your control — illness, job loss, divorce, or starting fresh in a new country.</p><p>Our approach is judgment-free. We listen, explain your options clearly, and help you find a realistic path to reliable transportation.</p>',
            primaryImage: { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1920', alt: 'Everyone Deserves a Second Chance' },
            animationDirection: 'right',
            backgroundColor: '#F4F8FC',
            ctaLabel: 'How It Works',
            ctaLink: '/how-it-works',
            isVisible: true,
            order: 2,
          },
          {
            name: 'By the Numbers',
            sectionType: 'stats',
            heading: 'By the Numbers',
            items: [
              { title: '1,000+', description: 'Customers Assisted' },
              { title: '25+', description: 'Lending Partners' },
              { title: '15+', description: 'Years Experience' },
              { title: '<12hr', description: 'Typical Response' },
            ],
            isVisible: true,
            order: 3,
          },
          {
            name: 'Our Values',
            sectionType: 'features',
            eyebrow: 'Our Values',
            heading: 'What Guides Us Every Day',
            items: [
              { title: 'Transparency', description: 'No hidden fees, no pressure tactics. We explain terms in plain language.', icon: 'eye' },
              { title: 'Respect', description: 'Every customer is treated with dignity, regardless of credit score.', icon: 'heart' },
              { title: 'Expertise', description: 'Our team knows Ontario lending programs inside and out.', icon: 'award' },
              { title: 'Results', description: 'We measure success by customers driving reliable vehicles.', icon: 'check-circle' },
            ],
            isVisible: true,
            order: 4,
          },
          {
            name: 'How We Help',
            sectionType: 'process-steps',
            heading: 'Your Journey With Us',
            items: [
              { title: 'Listen & Understand', description: 'We learn about your situation, budget, and transportation needs without judgment.' },
              { title: 'Match Programs', description: 'We connect you with dealer and lender partners suited to your credit profile.' },
              { title: 'Drive Forward', description: 'You review options, choose a vehicle, and finalize terms that work for you.' },
            ],
            isVisible: true,
            order: 5,
          },
          {
            name: 'About CTA',
            sectionType: 'cta-banner',
            heading: 'Ready to Take the Next Step?',
            subheading: 'Start with a free, no-obligation pre-qualification today.',
            ctaLabel: 'Apply Now',
            ctaLink: '/apply',
            backgroundImage: { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920', alt: 'Ready to Take the Next Step?' },
            isVisible: true,
            order: 6,
          },
        ],
      },
    },
  );

  await Page.updateOne(
    { slug: 'home' },
    {
      $set: {
        'sections.$[step].items.0.description':
          'Fill out our secure application in minutes. No obligation and absolutely free of charge.',
        'sections.$[step].items.2.description':
          'Select your dream vehicle from the list of options that fit your preference and budget.',
      },
    },
    {
      arrayFilters: [
        { 'step.sectionType': 'process-steps', 'step.heading': 'Three Simple Steps to Get Started' },
      ],
    },
  );

  await Page.updateOne(
    { slug: 'home' },
    {
      $set: {
        'sections.$[stats].items.2.title': '25+',
        'sections.$[stats].items.3.title': '<12hr',
      },
    },
    {
      arrayFilters: [{ 'stats.sectionType': 'stats', 'stats.name': 'Trust Stats' }],
    },
  );

  const blogCoverFixes: Record<string, string> = {
    'auto-loans-build-credit-canada': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1920',
    'ontario-auto-financing-trends-2025': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920',
  };

  for (const [slug, url] of Object.entries(blogCoverFixes)) {
    await BlogPost.updateOne(
      { slug },
      { $set: { 'coverImage.url': url, 'ogImage.url': url } },
    );
  }

  await FAQ.updateOne(
    { question: 'Can I get approved with bad credit?' },
    {
      $set: {
        answer:
          'Many of our lending partners specialize in helping secure approvals for those who have been denied financing by other institutions, there\'s a wide range of techniques our professionals can leverage to help secure an approval even with credit scores that aren\'t the greatest!',
      },
    },
  );

  await FAQ.updateOne(
    { question: 'Does applying affect my credit score?' },
    {
      $set: {
        question: 'How fast can I get a vehicle and start driving if I apply?',
        answer:
          'Many customers hear back from a financing specialist in under 12 hours. Once you are approved and have selected a vehicle, most people can finalize financing and start driving within a few days — depending on document verification and vehicle availability.',
      },
    },
  );

  await FAQ.updateOne(
    { question: 'What loan terms are available?' },
    {
      $set: {
        answer:
          'Most auto loans range from 36 to 84 months. Longer terms mean lower monthly payments. Your specialist will help you find the right balance between payment affordability and total cost.',
      },
    },
  );

  await FAQ.updateOne(
    { question: 'How long does approval take?' },
    {
      $set: {
        answer:
          'Most customers hear back in less than 12 hours after submitting a complete application. Complex situations may take slightly longer. We prioritize fast communication so you are never left wondering about your status.',
      },
    },
  );

  for (const slug of ['privacy', 'terms'] as const) {
    await Page.updateOne(
      { slug },
      {
        $set: {
          'sections.$[hero].metadata': { minimalHero: true },
          'sections.$[hero].body': '',
          'sections.$[hero].ctaLabel': '',
          'sections.$[hero].ctaLink': '',
        },
      },
      {
        arrayFilters: [{ 'hero.sectionType': 'hero' }],
      },
    );
  }

  await Page.updateOne(
    { slug: 'terms' },
    {
      $set: {
        'sections.$[section].heading': 'What We Ask of Our Clients',
        'sections.$[section].body':
          'By using our services, you agree to provide accurate and complete information in your applications. Misrepresentation of income, employment, or credit history may result in application denial. You are responsible for reviewing and understanding all financing terms before signing any agreement with a lending partner.',
      },
    },
    {
      arrayFilters: [{ 'section.name': 'User Responsibilities' }],
    },
  );

  await Page.updateOne(
    { slug: 'terms' },
    {
      $set: {
        'sections.$[section].heading': 'Legal',
        'sections.$[section].body':
          'These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario. We reserve the right to update these terms at any time for any reason at the sole discretion of the company. Filling out the application confirms that you have read the terms and conditions provided and agree to all legal requirements.',
      },
    },
    {
      arrayFilters: [{ 'section.name': 'Governing Law' }],
    },
  );

  await SiteSettings.updateOne({}, { $unset: { 'general.businessHours': '' } });

  logger.info('Synced gallery, testimonials-faqs, about, home process-steps, home stats, blog cover images, FAQ updates, legal page heroes, terms copy, and removed business hours.');
  await mongoose.disconnect();
  process.exit(0);
}

sync().catch((err) => {
  logger.error('Sync failed:', err);
  process.exit(1);
});
