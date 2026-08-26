'use client';

import { usePathname } from 'next/navigation';
import { CinematicIntro } from '@/components/animations/CinematicIntro';

export function ApplyRouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApply = pathname?.startsWith('/apply');

  return (
    <>
      {!isApply && <CinematicIntro />}
      {children}
    </>
  );
}