import type { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-route';
import { getApplicationToken } from '@/lib/application-route';
import { connectDB } from '@/lib/db';
import { submitApplication } from '@server/services/applicationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = getApplicationToken(req, body);
    if (!token) return apiError('Application token required', 401);

    await connectDB();
    const result = await submitApplication(token, body.consents || {});
    return apiSuccess(result);
  } catch (err) {
    console.error('[api/public/applications/session/submit]', err);
    return apiError(err instanceof Error ? err.message : 'Submission failed', 400);
  }
}
