import Image from 'next/image';

type SectionSideImageProps = {
  src: string;
  alt: string;
  className?: string;
};

/** Full-bleed width, natural height — avoids cropping portrait CMS photos. */
export function SectionSideImage({ src, alt, className }: SectionSideImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={960}
      height={1280}
      className={
        className ??
        'w-full h-auto rounded-2xl shadow-2xl ring-1 ring-black/5 bg-soft'
      }
      sizes="(max-width: 1024px) 100vw, 50vw"
    />
  );
}
