'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { Plus, Edit } from 'lucide-react';

export default function AdminServicesPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminApi.getServices() as Promise<Array<{ _id: string; title: string; slug: string; status: string; isFeatured: boolean; order: number }>>,
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Services</h1>
        <Link href="/admin/services/new" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Featured</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(services || []).map((s) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{s.title}</td>
                <td className="p-4 text-gray-500">/services/{s.slug}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${s.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                </td>
                <td className="p-4">{s.isFeatured ? 'Yes' : 'No'}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/services/${s._id}`} className="p-2 hover:bg-gray-100 rounded inline-block">
                    <Edit className="w-4 h-4 text-electric" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
