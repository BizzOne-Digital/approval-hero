import { apiSuccess } from '@/lib/api-route';
import { connectDB } from '@/lib/db';
import { GalleryCategory, GalleryImage } from '@server/models/Gallery';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const [categories, images] = await Promise.all([
      GalleryCategory.find().sort('order').lean(),
      GalleryImage.find({ status: 'published' }).populate('categoryId', 'name slug').sort('order').lean(),
    ]);
    return apiSuccess({ categories, images });
  } catch (err) {
    console.error('[api/public/gallery]', err);
    return apiSuccess({ categories: [], images: [] });
  }
}
