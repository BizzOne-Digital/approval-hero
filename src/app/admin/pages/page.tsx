'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { Eye, Edit } from 'lucide-react';

export default function AdminPagesPage() {
  const { data: pages, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => adminApi.getPages() as Promise<Array<{ _id: string; title: string; slug: string; status: string; sections: unknown[]; updatedAt: string }>>,
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-6">Pages</h1>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Page</th>
              <th className="text-left p-4 font-medium text-gray-600">Slug</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Sections</th>
              <th className="text-left p-4 font-medium text-gray-600">Updated</th>
              <th className="text-right p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(pages || []).map((page) => (
              <tr key={page._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{page.title}</td>
                <td className="p-4 text-gray-500">/{page.slug === 'home' ? '' : page.slug}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {page.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{page.sections?.length || 0}</td>
                <td className="p-4 text-gray-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
                    <Link href={`/admin/pages/${page._id}`} className="p-2 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-electric" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
