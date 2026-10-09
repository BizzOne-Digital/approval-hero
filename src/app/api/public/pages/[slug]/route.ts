import { apiError, apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { Page } from '@server/models/Page';

export const dynamic = 'force-dynamic';

import { resolveRouteSlug, type SlugRouteParams } from '@/lib/api/routeParams';

export async function GET(_req: Request, context: SlugRouteParams) {
  try {
    const slug = await resolveRouteSlug(context.params);
    await connectDB();
    const page = await Page.findOne({ slug, status: 'published' }).lean();
    if (!page) return apiError('Page not found', 404);
    return apiSuccess(page);
  } catch (err) {
    console.error('[api/public/pages]', err);
    return apiError('Failed to load page', 500);
  }
}
