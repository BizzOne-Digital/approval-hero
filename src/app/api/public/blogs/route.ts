import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { BlogPost, BlogCategory } from '@server/models/Blog';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const pageNum = parseInt(searchParams.get('page') || '1', 10);
    const limitNum = parseInt(searchParams.get('limit') || '9', 10);

    const filter: Record<string, unknown> = { status: 'published' };
    const total = await BlogPost.countDocuments(filter);
    const posts = await BlogPost.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    const categories = await BlogCategory.find().lean();
    const featured = await BlogPost.findOne({ status: 'published', isFeatured: true })
      .populate('categoryId', 'name slug')
      .lean();

    return apiSuccess({
      posts,
      categories,
      featured,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('[api/public/blogs]', err);
    return apiSuccess({ posts: [], categories: [], featured: null, pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } });
  }
}
