'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { Save } from 'lucide-react';

export default function AdminServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [tab, setTab] = useState<'card' | 'detail' | 'seo'>('card');

  const { data: service, isLoading } = useQuery({
    queryKey: ['admin-service', id],
    queryFn: () => adminApi.getService(id!) as Promise<Record<string, unknown>>,
    enabled: !isNew,
  });

  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const data = form || service;

  const mutation = useMutation({
    mutationFn: (d: unknown) => isNew ? adminApi.createService(d) : adminApi.updateService(id!, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      alert('Service saved');
    },
  });

  if (!isNew && (isLoading || !data)) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  const update = (field: string, value: unknown) => setForm({ ...(form || service || {}), [field]: value });
  const updateDetail = (field: string, value: unknown) => {
    const detailPage = (form?.detailPage || service?.detailPage || {}) as Record<string, unknown>;
    setForm({ ...(form || service || {}), detailPage: { ...detailPage, [field]: value } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">{isNew ? 'New Service' : (data?.title as string)}</h1>
        <button onClick={() => mutation.mutate(form || service)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['card', 'detail', 'seo'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded text-sm font-medium ${tab === t ? 'bg-electric text-white' : 'bg-white border text-gray-600'}`}>
            {t === 'card' ? 'Card Info' : t === 'detail' ? 'Detail Page' : 'SEO'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        {tab === 'card' && (
          <>
            <div><label className="label-field">Title</label><input value={(data?.title as string) || ''} onChange={(e) => update('title', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Slug</label><input value={(data?.slug as string) || ''} onChange={(e) => update('slug', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Short Description</label><textarea value={(data?.shortDescription as string) || ''} onChange={(e) => update('shortDescription', e.target.value)} className="input-field" rows={3} /></div>
            <div><label className="label-field">Card Image URL</label><input value={((data?.cardImage as {url?:string})?.url) || ''} onChange={(e) => update('cardImage', { url: e.target.value })} className="input-field" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Status</label><select value={(data?.status as string) || 'draft'} onChange={(e) => update('status', e.target.value)} className="input-field"><option value="published">Published</option><option value="draft">Draft</option></select></div>
              <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" checked={!!data?.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} /><span className="text-sm">Featured</span></label></div>
            </div>
          </>
        )}
        {tab === 'detail' && (
          <>
            <div><label className="label-field">Hero Title</label><input value={((data?.detailPage as Record<string,string>)?.heroTitle) || ''} onChange={(e) => updateDetail('heroTitle', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Hero Subtitle</label><textarea value={((data?.detailPage as Record<string,string>)?.heroSubtitle) || ''} onChange={(e) => updateDetail('heroSubtitle', e.target.value)} className="input-field" rows={2} /></div>
            <div><label className="label-field">Introduction (HTML)</label><textarea value={((data?.detailPage as Record<string,string>)?.introduction) || ''} onChange={(e) => updateDetail('introduction', e.target.value)} className="input-field font-mono text-sm" rows={6} /></div>
            <div><label className="label-field">Who Is For (HTML)</label><textarea value={((data?.detailPage as Record<string,string>)?.whoIsFor) || ''} onChange={(e) => updateDetail('whoIsFor', e.target.value)} className="input-field font-mono text-sm" rows={4} /></div>
            <div><label className="label-field">Hero Background Image URL</label><input value={((data?.detailPage as {heroBackgroundImage?:{url?:string}})?.heroBackgroundImage?.url) || ''} onChange={(e) => updateDetail('heroBackgroundImage', { url: e.target.value })} className="input-field" /></div>
          </>
        )}
        {tab === 'seo' && (
          <>
            <div><label className="label-field">SEO Title</label><input value={(data?.seoTitle as string) || ''} onChange={(e) => update('seoTitle', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">SEO Description</label><textarea value={(data?.seoDescription as string) || ''} onChange={(e) => update('seoDescription', e.target.value)} className="input-field" rows={3} /></div>
          </>
        )}
      </div>
    </div>
  );
}
