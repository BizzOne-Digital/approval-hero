import { connectDB } from '@/lib/db';
import type { Service } from '@/lib/types';
import { Service as ServiceModel } from '@server/models/Service';

export async function getPublishedServiceBySlug(slug: string): Promise<Service | null> {
  try {
    await connectDB();
    const service = await ServiceModel.findOne({ slug, status: 'published' }).lean();
    return service ? (service as unknown as Service) : null;
  } catch (err) {
    console.error('[cms/getPublishedServiceBySlug]', slug, err);
    return null;
  }
}
