import type { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-route';
import { getApplicationToken } from '@/lib/application-route';
import { connectDB } from '@/lib/db';
import { getApplicationSession } from '@server/services/applicationService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = getApplicationToken(req);
    if (!token) return apiError('Application token required', 401);

    await connectDB();
    const session = await getApplicationSession(token);
    return apiSuccess(session);
  } catch (err) {
    console.error('[api/public/applications/session]', err);
    return apiError(err instanceof Error ? err.message : 'Session not found', 404);
  }
}
