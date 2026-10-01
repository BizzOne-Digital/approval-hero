import type { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-route';
import { getApplicationToken, getClientIp } from '@/lib/application-route';
import { connectDB } from '@/lib/db';
import { requestOtp } from '@server/services/applicationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = getApplicationToken(req, body);
    if (!token) return apiError('Application token required', 401);

    await connectDB();
    const result = await requestOtp(token, getClientIp(req));
    const payload: Record<string, unknown> = { sent: result.sent };
    if (result.cooldownSeconds) payload.cooldownSeconds = result.cooldownSeconds;
    if (result.mockCode && process.env.NODE_ENV !== 'production') {
      payload.mockCode = result.mockCode;
    }
    return apiSuccess(payload);
  } catch (err) {
    console.error('[api/public/applications/session/send-otp]', err);
    return apiError(err instanceof Error ? err.message : 'Failed to send OTP', 400);
  }
}
