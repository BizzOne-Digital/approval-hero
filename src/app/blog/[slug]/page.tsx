import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { post } = await publicApi.getBlog(params.slug);
    return { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt };
  } catch {
    return { title: 'Article' };
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [blogData, siteData] = await Promise.all([
    publicApi.getBlog(params.slug).catch(() => null),
    getSiteData(),
  ]);

  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight text-white">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">Article Not Found</h1>
          <Link href="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const { post, related } = blogData;

  return (
    <>
      <Header settings={siteData.settings} navItems={siteData.navItems} />
      <main id="main-content">
        <article>
          <section className="relative pt-32 pb-16 bg-midnight overflow-hidden">
            {post.coverImage?.url && (
              <>
                <Image src={getImageUrl(post.coverImage.url)} alt="" fill className="object-cover opacity-30" />
                <div className="absolute inset-0 bg-midnight/80" />
              </>
            )}
            <div className="container-custom relative z-10 max-w-4xl">
              {post.categoryId && (
                <span className="text-electric font-display uppercase tracking-widest text-sm">{post.categoryId.name}</span>
              )}
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2 mb-4">{post.title}</h1>
              <p className="text-ice-blue">{post.author} &middot; {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</p>
            </div>
          </section>

          <section className="section-padding">
            <div className="container-custom max-w-3xl">
              <div className="prose prose-lg max-w-none prose-a:text-electric prose-a:font-medium prose-a:underline hover:prose-a:text-bright-blue" dangerouslySetInnerHTML={{ __html: post.content }} />
              <p className="text-gray-400 text-sm mt-12 border-t pt-6">
                This article is for informational purposes only and does not constitute personalized financial advice.
              </p>
            </div>
          </section>

          {related.length > 0 && (
            <section className="section-padding bg-soft">
              <div className="container-custom">
                <h2 className="font-display text-2xl font-bold text-midnight mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {related.map((r) => (
                    <Link key={r._id} href={`/blog/${r.slug}`} className="card-premium p-6 group block touch-manipulation cursor-pointer">
                      <h3 className="font-display text-lg font-bold text-midnight group-hover:text-electric transition-colors">{r.title}</h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{r.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer settings={siteData.settings} footerColumns={siteData.footerColumns as never[]} />
    </>
  );
}
