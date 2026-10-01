'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Trash2 } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => adminApi.getTestimonials() as Promise<Array<Record<string, unknown>>> });

  const del = useMutation({ mutationFn: (id: string) => adminApi.deleteTestimonial(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] }) });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-6">Testimonials</h1>
      <div className="grid gap-4">
        {(data || []).map((t) => (
          <div key={t._id as string} className="bg-white border rounded-lg p-4 flex justify-between items-start">
            <div>
              <p className="font-medium">{t.customerName as string}</p>
              <p className="text-gray-600 text-sm mt-1 italic">&ldquo;{t.quote as string}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-2">{t.location as string} &middot; {t.rating as number}/5</p>
            </div>
            <button onClick={() => { if (confirm('Delete?')) del.mutate(t._id as string); }} className="p-2 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
