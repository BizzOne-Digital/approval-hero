'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Upload, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export default function AdminMediaPage() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['admin-media'], queryFn: () => adminApi.getMedia() as Promise<Array<Record<string, unknown>>> });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'pages');
    try {
      await adminApi.uploadMedia(fd);
      qc.invalidateQueries({ queryKey: ['admin-media'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    await adminApi.deleteMedia(id);
    qc.invalidateQueries({ queryKey: ['admin-media'] });
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Media Library</h1>
        <label className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(data || []).map((asset) => (
          <div key={asset._id as string} className="bg-white border rounded-lg overflow-hidden group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getImageUrl((asset.thumbnailUrl || asset.url) as string)} alt={asset.alt as string} className="w-full aspect-square object-cover" />
            <div className="p-2">
              <p className="text-xs truncate">{asset.originalName as string}</p>
              <p className="text-xs text-gray-400">{((asset.size as number) / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => handleDelete(asset._id as string)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
