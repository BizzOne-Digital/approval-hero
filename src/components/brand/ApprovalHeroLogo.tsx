import Image from 'next/image';
import Link from 'next/link';
import { cn, getImageUrl } from '@/lib/utils';

interface ApprovalHeroLogoProps {
  className?: string;
  height?: number;
  /** Use on dark backgrounds — shield icon + white wordmark */
  onDark?: boolean;
  /** CMS branding (darkLogo / logo / favicon) */
  iconSrc?: string;
  wordmarkSrc?: string;
}

export function ApprovalHeroLogo({
  className = '',
  height = 48,
  onDark = false,
  iconSrc,
  wordmarkSrc,
}: ApprovalHeroLogoProps) {
  if (onDark) {
    if (wordmarkSrc) {
      const width = Math.round(height * 3.8);
      return (
        <Image
          src={getImageUrl(wordmarkSrc)}
          alt="Approval Hero"
          width={width}
          height={height}
          className={cn('h-auto object-contain object-left', className)}
          style={{ height, width: 'auto', maxWidth: width }}
          priority
        />
      );
    }

    const iconSize = Math.round(height * 0.9);
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <Image
          src={getImageUrl(iconSrc || '/images/favicon.png')}
          alt=""
          width={iconSize}
          height={iconSize}
          className="object-contain flex-shrink-0"
          style={{ width: iconSize, height: iconSize }}
          priority
        />
        <span
          className="font-display font-bold text-white uppercase tracking-[0.12em] leading-none whitespace-nowrap"
          style={{ fontSize: height * 0.36 }}
        >
          APPROVAL HERO
        </span>
      </div>
    );
  }

  const width = Math.round(height * 3.8);
  return (
    <Image
      src={getImageUrl(wordmarkSrc || iconSrc || '/images/logo.png')}
      alt="Approval Hero"
      width={width}
      height={height}
      className={cn('h-auto object-contain object-left', className)}
      style={{ height, width: 'auto', maxWidth: width }}
      priority
    />
  );
}

export function HeaderLogoLink({
  height = 48,
  iconSrc,
  wordmarkSrc,
}: {
  height?: number;
  iconSrc?: string;
  wordmarkSrc?: string;
}) {
  return (
    <Link href="/" className="flex items-center flex-shrink-0">
      <ApprovalHeroLogo height={height} onDark iconSrc={iconSrc} wordmarkSrc={wordmarkSrc} />
    </Link>
  );
}

export function brandingLogoUrls(settings?: {
  branding?: { logo?: { url?: string }; lightLogo?: { url?: string }; darkLogo?: { url?: string }; favicon?: { url?: string } };
}) {
  const b = settings?.branding;
  const iconSrc = b?.favicon?.url || b?.logo?.url || b?.darkLogo?.url;
  const wordmarkSrc = b?.darkLogo?.url || b?.logo?.url || b?.lightLogo?.url;
  return { iconSrc, wordmarkSrc };
}
