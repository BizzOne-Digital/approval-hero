import Link from 'next/link';
import { ApprovalHeroLogo } from '@/components/brand/ApprovalHeroLogo';
import type { SiteSettings } from '@/lib/types';

interface FooterProps {
  settings?: SiteSettings;
  footerColumns?: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
}

const DEFAULT_COLUMNS = [
  {
    title: 'Financing Programs',
    links: [
      { label: 'Bad Credit', href: '/bad-credit' },
      { label: 'No Credit', href: '/no-credit' },
      { label: 'Bankruptcy', href: '/bankruptcy' },
      { label: 'Self-Employed', href: '/self-employed' },
      { label: '$0 Down', href: '/apply' },
      { label: 'Newcomer', href: '/newcomer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Why Choose Us', href: '/why-choose-us' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Approval Programs', href: '/approval-programs' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Testimonials', href: '/testimonials-faqs' },
      { label: 'FAQ', href: '/testimonials-faqs#faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'ak_2123@hotmail.com', href: 'mailto:ak_2123@hotmail.com' },
      { label: 'Apply Online', href: '/apply' },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const className = 'text-white/55 hover:text-white text-sm transition-colors';
  if (href.startsWith('tel:') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function Footer({ settings, footerColumns = [] }: FooterProps) {
  const general = settings?.general;
  const footer = settings?.footer;
  const year = new Date().getFullYear();
  const columns = (footerColumns.length > 0 ? footerColumns : DEFAULT_COLUMNS).map((col) => ({
    ...col,
    links: col.links.filter((link) => !link.href.startsWith('tel:')),
  }));

  return (
    <footer className="bg-[#030d1a] text-white border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <ApprovalHeroLogo height={48} onDark />
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-sm">
              {footer?.description || 'Vehicle financing support for drivers across Ontario.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={footer?.ctaLink || '/apply'}
                className="inline-flex justify-center font-display text-xs uppercase tracking-wider font-bold text-white bg-electric hover:bg-bright-blue rounded-full px-8 py-3 transition-colors"
              >
                {footer?.ctaLabel || 'Get Pre-Qualified'}
              </Link>
            </div>
          </div>

          {columns.map((col) => {
            const isContact = col.title.toLowerCase() === 'contact';
            return (
              <div key={col.title} className="lg:col-span-2">
                <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-electric mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <FooterLink href={link.href} label={link.label} />
                    </li>
                  ))}
                  {isContact && (general?.address || general?.serviceArea) && (
                    <li className="text-white/55 text-sm pt-1">
                      {general?.address || general?.serviceArea}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-6">
          <p className="text-white/35 text-[11px] leading-relaxed mb-4 uppercase tracking-wide">
            {footer?.disclaimer || '$0 down options may be available to qualified applicants. Approval, rates, terms and zero-down options are subject to lender criteria, credit assessment and eligibility. Approval Hero does not guarantee financing approval.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs">
              &copy; {year} {footer?.copyright || 'Approval Hero. All rights reserved.'}
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-white/40 hover:text-white text-xs transition-colors uppercase tracking-wider">
                Privacy
              </Link>
              <Link href="/terms" className="text-white/40 hover:text-white text-xs transition-colors uppercase tracking-wider">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
