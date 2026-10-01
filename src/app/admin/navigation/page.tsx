'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function AdminNavigationPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-nav'], queryFn: () => adminApi.getNavigation() as Promise<Record<string, unknown>> });
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const nav = form || data;

  const mutation = useMutation({
    mutationFn: (d: unknown) => adminApi.updateNavigation(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-nav'] }); alert('Navigation saved'); },
  });

  if (isLoading || !nav) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  const items = (nav.headerItems as Array<Record<string, unknown>>) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Header & Footer</h1>
        <button onClick={() => mutation.mutate(form || data)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
      </div>
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Header Navigation</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-4">
              <input value={(item.label as string) || ''} onChange={(e) => {
                const updated = [...items]; updated[i] = { ...item, label: e.target.value };
                setForm({ ...nav, headerItems: updated });
              }} className="input-field" placeholder="Label" />
              <input value={(item.href as string) || ''} onChange={(e) => {
                const updated = [...items]; updated[i] = { ...item, href: e.target.value };
                setForm({ ...nav, headerItems: updated });
              }} className="input-field" placeholder="URL" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!item.isVisible} onChange={(e) => {
                const updated = [...items]; updated[i] = { ...item, isVisible: e.target.checked };
                setForm({ ...nav, headerItems: updated });
              }} /><span className="text-sm">Visible</span></label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
