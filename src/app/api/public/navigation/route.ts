import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { Navigation } from '@server/models/Navigation';
import { Service } from '@server/models/Service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const [nav, services] = await Promise.all([
      Navigation.findOne().lean(),
      Service.find({ status: 'published' }).select('title slug order').sort('order').lean(),
    ]);
    return apiSuccess({ navigation: nav, services });
  } catch (err) {
    console.error('[api/public/navigation]', err);
    return apiSuccess({ navigation: null, services: [] });
  }
}
