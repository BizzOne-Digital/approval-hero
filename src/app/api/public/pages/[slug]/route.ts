import { apiError, apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { Page } from '@server/models/Page';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectDB();
    const page = await Page.findOne({ slug: params.slug, status: 'published' }).lean();
    if (!page) return apiError('Page not found', 404);
    return apiSuccess(page);
  } catch (err) {
    console.error('[api/public/pages]', err);
    return apiError('Failed to load page', 500);
  }
}
