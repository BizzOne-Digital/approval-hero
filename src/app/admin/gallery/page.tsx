'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export default function AdminGalleryPage() {
  const { data: categories } = useQuery({ queryKey: ['admin-gallery-cats'], queryFn: () => adminApi.getGalleryCategories() as Promise<Array<Record<string, unknown>>> });
  const { data: images, isLoading } = useQuery({ queryKey: ['admin-gallery-images'], queryFn: () => adminApi.getGalleryImages() as Promise<Array<Record<string, unknown>>> });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-6">Gallery</h1>
      <div className="mb-6 flex gap-2 flex-wrap">
        {(categories || []).map((c) => (
          <span key={c._id as string} className="px-3 py-1 bg-electric/10 text-electric rounded text-sm">{c.name as string}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(images || []).map((img) => (
          <div key={img._id as string} className="bg-white border rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(img.image as {url:string})?.url} alt={img.alt as string} className="w-full h-full object-cover" />
            </div>
            <div className="p-2"><p className="text-xs truncate">{img.alt as string}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
