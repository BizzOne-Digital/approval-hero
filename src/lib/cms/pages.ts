import { connectDB } from '@/lib/db';
import { serializeDoc } from '@/lib/cms/serializeDoc';
import { getApiBaseUrl } from '@/lib/getApiUrl';
import { Page } from '@server/models/Page';
import type { Page as PageType } from '@/lib/types';

async function fetchPublishedPageFromApi(slug: string): Promise<PageType | null> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/public/pages/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; data?: PageType };
    return json.success && json.data ? serializeDoc(json.data) : null;
  } catch (err) {
    console.error('[cms/fetchPublishedPageFromApi]', slug, err);
    return null;
  }
}

export async function getPublishedPageBySlug(slug: string): Promise<PageType | null> {
  try {
    await connectDB();
    const page = await Page.findOne({ slug, status: 'published' }).lean();
    if (page) return serializeDoc(page as unknown as PageType);
  } catch (err) {
    console.error('[cms/getPublishedPageBySlug] db', slug, err);
  }

  return fetchPublishedPageFromApi(slug);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGO_URI || process.env.MONGODB_URI);
}
