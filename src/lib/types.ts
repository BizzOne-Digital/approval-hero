export interface ImageRef {
  url: string;
  alt?: string;
  thumbnailUrl?: string;
}

export interface PageSection {
  _id?: string;
  name: string;
  sectionType: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  ctaLabel?: string;
  ctaLink?: string;
  primaryImage?: ImageRef;
  secondaryImage?: ImageRef;
  backgroundImage?: ImageRef;
  items?: SectionItem[];
  backgroundColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  animationPreset?: string;
  animationDirection?: string;
  isVisible: boolean;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface SectionItem {
  title?: string;
  description?: string;
  icon?: string;
  image?: ImageRef;
  link?: string;
  badge?: string;
  metadata?: Record<string, unknown>;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  status: string;
  sections: PageSection[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: ImageRef;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  cardImage?: ImageRef;
  icon?: string;
  badge?: string;
  highlights: string[];
  ctaLabel: string;
  order: number;
  isFeatured: boolean;
  status: string;
  detailPage: ServiceDetail;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ServiceDetail {
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBackgroundImage?: ImageRef;
  introduction?: string;
  whoIsFor?: string;
  challenges?: string;
  howWeHelp?: string;
  process?: { step: number; title: string; description: string }[];
  requiredInfo?: string;
  benefits?: string[];
  ctaTitle?: string;
  ctaDescription?: string;
  sectionImages?: ImageRef[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Testimonial {
  _id: string;
  customerName: string;
  quote: string;
  rating: number;
  location?: string;
  profileImage?: ImageRef;
  isFeatured: boolean;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isFeatured: boolean;
  categoryId?: { name: string; slug: string };
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: ImageRef;
  author: string;
  publishedAt?: string;
  isFeatured: boolean;
  categoryId?: { name: string; slug: string };
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface GalleryImage {
  _id: string;
  title?: string;
  caption?: string;
  alt: string;
  image: ImageRef;
  vehicleType?: string;
  isFeatured: boolean;
  categoryId?: { name: string; slug: string };
}

export interface NavItem {
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
  children?: NavItem[];
}

export interface SiteSettings {
  general: {
    businessName: string;
    tagline: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    serviceArea?: string;
    businessHours?: string;
  };
  social: Record<string, string | undefined>;
  branding: {
    logo?: ImageRef;
    lightLogo?: ImageRef;
    darkLogo?: ImageRef;
    favicon?: ImageRef;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultOgImage?: ImageRef;
    robotsIndex: boolean;
  };
  contact: {
    notificationEmail: string;
    successMessage: string;
    consentText: string;
  };
  animation: {
    introEnabled: boolean;
    introDuration: number;
    smoothScrolling: boolean;
    animationIntensity: string;
    pageTransitions: boolean;
  };
  footer: {
    description: string;
    disclaimer: string;
    copyright: string;
    ctaLabel: string;
    ctaLink: string;
  };
  header: {
    ctaLabel: string;
    ctaLink: string;
    phone: string;
  };
}

export interface Lead {
  _id: string;
  submissionType: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  province?: string;
  creditSituation?: string;
  vehiclePreference?: string;
  sourcePage?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
