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

    const type = (body.submissionType as string) || 'contact';
    const result = await createLeadFromBody(body, type === 'lead' ? 'lead' : 'contact');
    return apiSuccess({ id: result.id }, 200);
  } catch (err) {
    console.error('[api/public/contact]', err);
    return apiError(err instanceof Error ? err.message : 'Failed to submit contact form', 500);
  }
}
