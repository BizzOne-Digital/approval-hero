'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export default function AdminOffersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-offers'], queryFn: () => adminApi.getOffers() as Promise<Array<Record<string, unknown>>> });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-6">Offers / Pricing</h1>
      <div className="space-y-4">
        {(data || []).map((o) => (
          <div key={o._id as string} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{o.name as string}</h3>
                <p className="text-gray-600 text-sm mt-1">{o.description as string}</p>
                {typeof o.disclaimer === 'string' && o.disclaimer && <p className="text-gray-400 text-xs mt-2">{o.disclaimer}</p>}
              </div>
              <span className={`px-2 py-1 rounded text-xs ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{o.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
