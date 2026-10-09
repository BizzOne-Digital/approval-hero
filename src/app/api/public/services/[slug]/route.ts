import { apiError, apiSuccess } from '@/lib/api-route';
import { resolveRouteSlug, type SlugRouteParams } from '@/lib/api/routeParams';
import { connectDB } from '@/lib/db';
import { Service } from '@server/models/Service';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, context: SlugRouteParams) {
  try {
    const slug = await resolveRouteSlug(context.params);
    await connectDB();
    const service = await Service.findOne({ slug, status: 'published' }).lean();
    if (!service) return apiError('Service not found', 404);
    return apiSuccess(service);
  } catch (err) {
    console.error('[api/public/services/slug]', err);
    return apiError('Failed to load service', 500);
  }
}
