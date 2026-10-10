import { connectDB } from '@/lib/db';
import type { BlogPost } from '@/lib/types';
import { BlogCategory, BlogPost as BlogPostModel } from '@server/models/Blog';

export type BlogListing = {
  posts: BlogPost[];
  categories: unknown[];
  featured: BlogPost | null;
};

export async function getPublishedBlogListing(limit = 50): Promise<BlogListing> {
  try {
    await connectDB();
    const filter = { status: 'published' as const };
    const [posts, categories, featured] = await Promise.all([
      BlogPostModel.find(filter)
        .populate('categoryId', 'name slug')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean(),
      BlogCategory.find().lean(),
      BlogPostModel.findOne({ ...filter, isFeatured: true })
        .populate('categoryId', 'name slug')
        .lean(),
    ]);
    return {
      posts: posts as unknown as BlogPost[],
      categories,
      featured: featured ? (featured as unknown as BlogPost) : null,
    };
  } catch (err) {
    console.error('[cms/getPublishedBlogListing]', err);
    return { posts: [], categories: [], featured: null };
  }
}

export async function getPublishedBlogBySlug(
  slug: string,
): Promise<{ post: BlogPost; related: BlogPost[] } | null> {
  try {
    await connectDB();
    const post = await BlogPostModel.findOne({ slug, status: 'published' })
      .populate('categoryId', 'name slug')
      .lean();
    if (!post) return null;

    const related = await BlogPostModel.find({
      status: 'published',
      categoryId: post.categoryId,
      _id: { $ne: post._id },
    })
      .limit(3)
      .lean();

    return {
      post: post as unknown as BlogPost,
      related: related as unknown as BlogPost[],
    };
  } catch (err) {
    console.error('[cms/getPublishedBlogBySlug]', slug, err);
    return null;
  }
}
