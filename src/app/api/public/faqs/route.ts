import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { FAQCategory, FAQ } from '@server/models/FAQ';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const [categories, faqs] = await Promise.all([
      FAQCategory.find().sort('order').lean(),
      FAQ.find({ status: 'published' }).populate('categoryId', 'name slug').sort('order').lean(),
    ]);
    return apiSuccess({ categories, faqs });
  } catch (err) {
    console.error('[api/public/faqs]', err);
    return apiSuccess({ categories: [], faqs: [] });
  }
}
