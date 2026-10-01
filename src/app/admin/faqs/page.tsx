'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export default function AdminFaqsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-faqs'], queryFn: () => adminApi.getFaqs() as Promise<Array<Record<string, unknown>>> });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-6">FAQs</h1>
      <div className="space-y-3">
        {(data || []).map((faq) => (
          <div key={faq._id as string} className="bg-white border rounded-lg p-4">
            <p className="font-medium">{faq.question as string}</p>
            <div className="text-gray-600 text-sm mt-2" dangerouslySetInnerHTML={{ __html: faq.answer as string }} />
          </div>
        ))}
      </div>
    </div>
  );
}
