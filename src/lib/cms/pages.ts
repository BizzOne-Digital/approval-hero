import { connectDB } from '@/lib/db';
import { Page } from '@server/models/Page';
import type { Page as PageType } from '@/lib/types';

export async function getPublishedPageBySlug(slug: string): Promise<PageType | null> {
  try {
    await connectDB();
    const page = await Page.findOne({ slug, status: 'published' }).lean();
    return page ? (page as unknown as PageType) : null;
  } catch (err) {
    console.error('[cms/getPublishedPageBySlug]', slug, err);
    return null;
  }
}
