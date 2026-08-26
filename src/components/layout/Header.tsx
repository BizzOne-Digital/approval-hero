'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderLogoLink } from '@/components/brand/ApprovalHeroLogo';
import type { NavItem, SiteSettings } from '@/lib/types';

const DEFAULT_NAV: NavItem[] = [
  { label: 'HOME', href: '/', order: 0, isVisible: true },
  { label: 'ABOUT', href: '/about', order: 1, isVisible: true },
  { label: 'SERVICES', href: '/services', order: 2, isVisible: true },
  { label: 'HOW IT WORKS', href: '/how-it-works', order: 3, isVisible: true },
  { label: 'TESTIMONIALS', href: '/testimonials-faqs', order: 4, isVisible: true },
  { label: 'FAQ', href: '/testimonials-faqs#faq', order: 5, isVisible: true },
  { label: 'CONTACT', href: '/contact', order: 6, isVisible: true },
];

interface HeaderProps {
  settings?: SiteSettings;
  navItems?: NavItem[];
}

export function Header({ settings, navItems }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const phone = settings?.header?.phone || settings?.general?.phone || '416-700-2656';
  const ctaLink = settings?.header?.ctaLink || '/apply';
  const ctaLabel = settings?.header?.ctaLabel || 'Apply Now';

  const nav = (navItems?.filter((n) => n.isVisible).length ? navItems : DEFAULT_NAV)
    .filter((n) => n.isVisible)
    .sort((a, b) => a.order - b.order)
    .map((n) => ({ label: n.label.toUpperCase(), href: n.href }));

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.includes('#')) return pathname === href.split('#')[0];
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#030d1a]/95 backdrop-blur-md border-b border-white/5 py-3'
            : 'bg-transparent py-5 md:py-6'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 flex items-center gap-6">
          {/* Logo */}
          <HeaderLogoLink height={scrolled ? 38 : 44} />

          {/* Center nav — SS1 order */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-5 2xl:gap-7">
            {nav.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  'font-display text-[10px] 2xl:text-[11px] uppercase tracking-[0.18em] font-medium transition-colors whitespace-nowrap',
                  isActive(item.href) ? 'text-electric' : 'text-white/80 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3 ml-auto lg:ml-0 flex-shrink-0">
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="font-display text-[10px] 2xl:text-[11px] uppercase tracking-[0.1em] text-white border border-white/60 rounded-full px-5 py-2.5 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {phone}
            </a>
            <Link
              href={ctaLink}
              className="font-display text-[10px] 2xl:text-[11px] uppercase tracking-[0.1em] font-bold text-white bg-electric hover:bg-[#1a75ff] rounded-full px-6 py-2.5 transition-all shadow-[0_0_20px_rgba(8,102,255,0.4)] whitespace-nowrap"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link href={ctaLink} className="font-display text-[10px] uppercase font-bold text-white bg-electric rounded-full px-4 py-2">
              Apply
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2" aria-label="Menu">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#030d1a]/98 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-5 p-8">
              {nav.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={item.href} className="font-display text-2xl text-white hover:text-electric uppercase tracking-widest">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="mt-6 font-display text-electric border border-electric/50 rounded-full px-8 py-3">
                {phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
