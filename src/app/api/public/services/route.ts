import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { Service } from '@server/models/Service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ status: 'published' }).sort('order').lean();
    return apiSuccess(services);
  } catch (err) {
    console.error('[api/public/services]', err);
    return apiSuccess([]);
  }
}
