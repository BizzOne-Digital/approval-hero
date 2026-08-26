import { apiSuccess } from '@/lib/api-route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return apiSuccess({ message: 'Approval Hero API is running' });
}
