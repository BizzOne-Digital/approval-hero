'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { Edit } from 'lucide-react';

export default function AdminBlogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-blogs'], queryFn: () => adminApi.getBlogs() as Promise<Array<Record<string, unknown>>> });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-6">Blog Posts</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="text-left p-4">Title</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th></tr></thead>
          <tbody>
            {(data || []).map((b) => (
              <tr key={b._id as string} className="border-b">
                <td className="p-4 font-medium">{b.title as string}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${b.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status as string}</span></td>
                <td className="p-4 text-right"><Link href={`/admin/blog/${b._id}`} className="p-2 inline-block"><Edit className="w-4 h-4 text-electric" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
