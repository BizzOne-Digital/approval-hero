import Image from 'next/image';
import Link from 'next/link';
import { cn, getImageUrl } from '@/lib/utils';

/** Shield mark for header, footer, and app chrome */
export const DEFAULT_SITE_LOGO_ICON = '/images/logo-icon.png';

/** Full horizontal lockup (optional CMS / print use) */
export const DEFAULT_SITE_LOGO = '/images/logo.png';

interface ApprovalHeroLogoProps {
  className?: string;
  height?: number;
  /** Dark navy header/footer — wordmark renders in white */
  onDark?: boolean;
  iconSrc?: string;
  /** Hide “APPROVAL HERO” beside the shield */
  iconOnly?: boolean;
}

export function ApprovalHeroLogo({
  className = '',
  height = 48,
  onDark = false,
  iconSrc,
  iconOnly = false,
}: ApprovalHeroLogoProps) {
  const src = getImageUrl(iconSrc || DEFAULT_SITE_LOGO_ICON);
  const iconWidth = Math.round(height * 0.92);

  return (
    <span className={cn('inline-flex items-center gap-2.5 sm:gap-3', className)}>
      <Image
        src={src}
        alt=""
        width={iconWidth}
        height={height}
        className="h-auto w-auto object-contain flex-shrink-0"
        style={{ height, width: iconWidth }}
        priority
        aria-hidden
      />
      {!iconOnly && (
        <span
          className={cn(
            'font-display font-bold uppercase leading-none tracking-[0.06em]',
            onDark ? 'text-white' : 'text-[#04152D]',
            height >= 44 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          )}
        >
          Approval Hero
        </span>
      )}
      <span className="sr-only">Approval Hero</span>
    </span>
  );
}

export function HeaderLogoLink({
  height = 48,
  iconSrc,
}: {
  height?: number;
  iconSrc?: string;
}) {
  return (
    <Link href="/" className="flex items-center flex-shrink-0">
      <ApprovalHeroLogo height={height} onDark iconSrc={iconSrc} />
    </Link>
  );
}

function isCmsBrandIcon(url?: string): url is string {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (lower.includes('unsplash.com') || lower.includes('hero-car')) return false;
  if (lower.includes('logo-icon')) return true;
  if (lower.includes('/uploads/') && lower.includes('logo')) return true;
  return false;
}

export function brandingLogoUrls(settings?: {
  branding?: { logo?: { url?: string }; lightLogo?: { url?: string }; darkLogo?: { url?: string } };
}) {
  const b = settings?.branding;
  const candidates = [b?.logo?.url, b?.lightLogo?.url, b?.darkLogo?.url];
  const iconSrc = candidates.find(isCmsBrandIcon);
  return { iconSrc };
}
