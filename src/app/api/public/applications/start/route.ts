import { apiError, apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { startApplicationSession } from '@server/services/applicationService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const result = await startApplicationSession({
      source: body.source,
      referrer: body.referrer,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      deviceCategory: body.deviceCategory,
    });
    return apiSuccess(result);
  } catch (err) {
    console.error('[api/public/applications/start]', err);
    return apiError(err instanceof Error ? err.message : 'Failed to start application', 500);
  }
}
