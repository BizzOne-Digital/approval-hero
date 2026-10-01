import type { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-route';
import { getApplicationToken } from '@/lib/application-route';
import { connectDB } from '@/lib/db';
import { confirmOtp, getApplicationSession } from '@server/services/applicationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = getApplicationToken(req, body);
    const { code } = body;
    if (!token || !code) return apiError('Token and code required', 400);

    await connectDB();
    await confirmOtp(token, String(code));
    const session = await getApplicationSession(token);
    return apiSuccess(session);
  } catch (err) {
    console.error('[api/public/applications/session/verify-otp]', err);
    return apiError(err instanceof Error ? err.message : 'Verification failed', 400);
  }
}
