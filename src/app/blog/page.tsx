import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimateOnScroll } from '@/components/animations/AnimateOnScroll';
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
              <Link href={`/blog/${featured.slug}`} className="grid lg:grid-cols-2 gap-8 items-center group">
                {featured.coverImage?.url && (
                  <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                    <Image src={getImageUrl(featured.coverImage.url)} alt={featured.coverImage.alt || featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <div>
                  <span className="text-electric font-display uppercase tracking-widest text-sm">Featured</span>
                  <h2 className="font-display text-3xl font-bold text-midnight mt-2 mb-4 group-hover:text-electric transition-colors">{featured.title}</h2>
                  <p className="text-gray-600 mb-4">{featured.excerpt}</p>
                  <span className="text-electric font-display text-sm uppercase">Read Article</span>
                </div>
              </Link>
            </div>
          </section>
        )}

        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <AnimateOnScroll key={post._id} delay={i * 0.05}>
                  <Link href={`/blog/${post.slug}`} className="card-premium group block">
                    {post.coverImage?.url && (
                      <div className="relative h-48 overflow-hidden">
                        <Image src={getImageUrl(post.coverImage.url)} alt={post.coverImage.alt || post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="p-6">
                      {post.categoryId && (
                        <span className="text-electric text-xs font-display uppercase tracking-wider">{post.categoryId.name}</span>
                      )}
                      <h3 className="font-display text-xl font-bold text-midnight mt-1 mb-2 group-hover:text-electric transition-colors">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
