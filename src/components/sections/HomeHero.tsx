import Image from 'next/image';
import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Image
        src="/images/hero-bg.png"
        alt="Premium SUV at night with Toronto skyline"
        fill
        className="object-cover object-[70%_center] md:object-[right_center]"
        priority
        quality={95}
        sizes="100vw"
      />

      {/* Left-heavy gradient — car stays visible on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(3,13,26,0.96) 0%, rgba(4,21,45,0.85) 36%, rgba(4,21,45,0.4) 56%, rgba(4,21,45,0.12) 72%, transparent 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030d1a]/65 via-transparent to-[#030d1a]/15" />

      {/* Cinematic blue light streak (SS1) */}
      <div
        className="absolute left-0 top-[46%] w-[min(720px,70vw)] h-[2px] pointer-events-none opacity-80"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(33,163,255,0.35) 25%, rgba(8,102,255,0.75) 50%, rgba(33,163,255,0.35) 75%, transparent 100%)',
          boxShadow: '0 0 24px rgba(8,102,255,0.45)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 lg:px-8 pt-28 pb-24 md:pt-32 md:pb-28 min-h-screen flex flex-col justify-center">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <span className="block w-10 h-[2px] bg-electric flex-shrink-0" aria-hidden="true" />
            <span className="font-display text-electric text-[11px] md:text-xs uppercase tracking-[0.28em] font-semibold">
              Vehicle Financing Support
            </span>
          </div>

          {/* Headlines */}
          <h1 className="font-display text-[2.35rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-white uppercase leading-[1.02] tracking-tight mb-1">
            Denied Financing?
          </h1>
          <p className="font-display text-xl sm:text-2xl md:text-3xl lg:text-[2.35rem] font-bold text-white uppercase leading-[1.08] tracking-tight mb-6 md:mb-8">
            Your Road Forward Starts Here.
          </p>

          <p className="text-white/70 text-base md:text-[1.05rem] leading-relaxed mb-8 md:mb-10 max-w-md">
            We connect drivers with dealer partners who understand challenging credit situations.
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center font-display text-xs md:text-sm uppercase tracking-[0.12em] font-bold text-white bg-electric hover:bg-[#1a75ff] rounded-full px-8 md:px-10 py-3.5 md:py-4 transition-all shadow-[0_0_30px_rgba(8,102,255,0.45)] hover:shadow-[0_0_40px_rgba(8,102,255,0.6)]"
            >
              Get Pre-Qualified
            </Link>
            <a
              href="tel:4167002656"
              className="inline-flex items-center justify-center font-display text-xs md:text-sm uppercase tracking-[0.12em] font-semibold text-white border border-white/70 rounded-full px-8 md:px-10 py-3.5 md:py-4 hover:bg-white/10 transition-colors"
            >
              Call 416-700-2656
            </a>
          </div>
        </div>

        {/* Disclaimer — pinned to bottom-left like SS1 */}
        <p className="absolute bottom-6 left-5 lg:left-8 font-display text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-white/40 max-w-xs">
          $0 Down Options May Be Available &bull; Subject to Approval
        </p>
      </div>
    </section>
  );
}
