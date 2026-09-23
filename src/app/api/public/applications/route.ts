import { apiError, apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { createLeadFromBody } from '@/lib/public-lead';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    if (!body.consent) return apiError('Consent is required', 400);
    if (!body.email || !body.phone) return apiError('Email and phone are required', 400);
    if (!body.name && !(body.firstName && body.lastName)) {
      return apiError('Name is required', 400);
    }

    const result = await createLeadFromBody(body, 'application');
    return apiSuccess({ id: result.id });
  } catch (err) {
    console.error('[api/public/applications]', err);
    return apiError(err instanceof Error ? err.message : 'Failed to submit application', 500);
  }
}
