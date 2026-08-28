import type { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-route';
import { getApplicationToken } from '@/lib/application-route';
import { connectDB } from '@/lib/db';
import { getApplicationSettings } from '@server/services/applicationSettingsService';
import { sanitizeApplicationForClient, saveApplicationStep } from '@server/services/applicationService';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = getApplicationToken(req, body);
    if (!token) return apiError('Application token required', 401);

    const { stepId, data } = body;
    if (!stepId) return apiError('Step ID required', 400);

    await connectDB();
    const app = await saveApplicationStep(token, String(stepId), data || {});
    const settings = await getApplicationSettings();
    return apiSuccess(sanitizeApplicationForClient(app, settings));
  } catch (err) {
    console.error('[api/public/applications/session/step]', err);
    return apiError(err instanceof Error ? err.message : 'Failed to save step', 400);
  }
}
