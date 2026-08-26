import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@server/models/Testimonial';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const testimonials = await Testimonial.find({ status: 'published' }).sort('order').lean();
    return apiSuccess(testimonials);
  } catch (err) {
    console.error('[api/public/testimonials]', err);
    return apiSuccess([]);
  }
}
