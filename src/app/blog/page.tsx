import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { publicApi } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { Metadata } from 'next';

async function getSiteData() {
  try {
    const [settings, navData] = await Promise.all([publicApi.getSettings(), publicApi.getNavigation()]);
    return { settings, navItems: navData.navigation?.headerItems || [], footerColumns: navData.navigation?.footerColumns || [] };
  } catch {
    return { settings: undefined, navItems: [], footerColumns: [] };
  }
}

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Vehicle financing resources and guides from Approval Hero.',
};

export default async function BlogPage() {
  const [blogData, siteData] = await Promise.all([
    publicApi.getBlogs().catch(() => ({ posts: [], categories: [], featured: null })),
    getSiteData(),
  ]);

  const { posts, featured } = blogData;
  const gridPosts = featured ? posts.filter((post) => post.slug !== featured.slug) : posts;

  return (
    <>
      <Header settings={siteData.settings} navItems={siteData.navItems} />
      <main id="main-content">
        <section className="pt-32 pb-16 bg-midnight">
          <div className="container-custom">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">Resources & Insights</h1>
            <p className="text-ice-blue text-lg">Vehicle financing guides and helpful information.</p>
          </div>
        </section>

        {featured && (
          <section className="section-padding bg-soft">
            <div className="container-custom">
              <Link
                href={`/blog/${featured.slug}`}
                className="grid lg:grid-cols-2 gap-8 items-center group touch-manipulation cursor-pointer relative z-10"
              >
                {featured.coverImage?.url && (
                  <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(featured.coverImage.url)}
                      alt={featured.coverImage.alt || featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div>
                  <span className="text-electric font-display uppercase tracking-widest text-sm">Featured</span>
                  <h2 className="font-display text-3xl font-bold text-midnight mt-2 mb-4 group-hover:text-electric transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{featured.excerpt}</p>
                  <span className="inline-flex items-center text-electric font-display text-sm uppercase tracking-wider underline underline-offset-4">
                    Read Article →
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post, i) => (
                <BlogPostCard key={post._id} post={post} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
