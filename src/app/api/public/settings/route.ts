import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { SiteSettings } from '@server/models/SiteSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    if (!settings) return apiSuccess({});
    return apiSuccess(settings);
  } catch (err) {
    console.error('[api/public/settings]', err);
    return apiSuccess({});
  }
}
