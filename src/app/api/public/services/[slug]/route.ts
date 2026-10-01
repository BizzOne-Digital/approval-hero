import { apiError, apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { Service } from '@server/models/Service';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectDB();
    const service = await Service.findOne({ slug: params.slug, status: 'published' }).lean();
    if (!service) return apiError('Service not found', 404);
    return apiSuccess(service);
  } catch (err) {
    console.error('[api/public/services/slug]', err);
    return apiError('Failed to load service', 500);
  }
}
