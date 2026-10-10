import { connectDB } from '@/lib/db';
import type { FAQ, NavItem, Service, SiteSettings, Testimonial } from '@/lib/types';
import { FAQ as FAQModel } from '@server/models/FAQ';
import { Navigation } from '@server/models/Navigation';
import { Service as ServiceModel } from '@server/models/Service';
import { SiteSettings as SiteSettingsModel } from '@server/models/SiteSettings';
import { Testimonial as TestimonialModel } from '@server/models/Testimonial';

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    await connectDB();
    const rows = await TestimonialModel.find({ status: 'published' }).sort('order').lean();
    return rows as unknown as Testimonial[];
  } catch (err) {
    console.error('[cms/getPublishedTestimonials]', err);
    return [];
  }
}

export async function getPublishedFaqs(): Promise<FAQ[]> {
  try {
    await connectDB();
    const rows = await FAQModel.find({ status: 'published' })
      .populate('categoryId', 'name slug')
      .sort('order')
      .lean();
    return rows as unknown as FAQ[];
  } catch (err) {
    console.error('[cms/getPublishedFaqs]', err);
    return [];
  }
}

export async function getPublishedServices(): Promise<Service[]> {
  try {
    await connectDB();
    const rows = await ServiceModel.find({ status: 'published' }).sort('order').lean();
    return rows as unknown as Service[];
  } catch (err) {
    console.error('[cms/getPublishedServices]', err);
    return [];
  }
}

export async function getSiteSettingsDocument(): Promise<SiteSettings | undefined> {
  try {
    await connectDB();
    const settings = await SiteSettingsModel.findOne().lean();
    return settings ? (settings as unknown as SiteSettings) : undefined;
  } catch (err) {
    console.error('[cms/getSiteSettingsDocument]', err);
    return undefined;
  }
}

export async function getNavigationDocument() {
  try {
    await connectDB();
    return Navigation.findOne().lean();
  } catch (err) {
    console.error('[cms/getNavigationDocument]', err);
    return null;
  }
}

export type PublicSiteData = {
  settings?: SiteSettings;
  navItems: NavItem[];
  footerColumns: unknown[];
  services: Service[];
  testimonials: Testimonial[];
  faqs: FAQ[];
};

export async function loadPublicSiteData(): Promise<PublicSiteData> {
  const [settings, navigation, services, testimonials, faqs] = await Promise.all([
    getSiteSettingsDocument(),
    getNavigationDocument(),
    getPublishedServices(),
    getPublishedTestimonials(),
    getPublishedFaqs(),
  ]);

  return {
    settings,
    navItems: (navigation?.headerItems || []) as NavItem[],
    footerColumns: navigation?.footerColumns || [],
    services,
    testimonials,
    faqs,
  };
}
