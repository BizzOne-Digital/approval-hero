import { apiError, apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { BlogPost } from '@server/models/Blog';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug: params.slug, status: 'published' })
      .populate('categoryId', 'name slug')
      .lean();
    if (!post) return apiError('Blog post not found', 404);

    const related = await BlogPost.find({
      status: 'published',
      categoryId: post.categoryId,
      _id: { $ne: post._id },
    }).limit(3).lean();

    return apiSuccess({ post, related });
  } catch (err) {
    console.error('[api/public/blogs/slug]', err);
    return apiError('Failed to load blog', 500);
  }
}
