'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings() as Promise<Record<string, Record<string, unknown>>>,
  });

  const [form, setForm] = useState<Record<string, Record<string, unknown>> | null>(null);
  const data = form || settings;
  const [tab, setTab] = useState('general');

  const mutation = useMutation({
    mutationFn: (d: unknown) => adminApi.updateSettings(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      alert('Settings saved');
    },
  });

  if (isLoading || !data) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  const updateGeneral = (field: string, value: string) => {
    setForm({ ...data, general: { ...data.general, [field]: value } });
  };

  const tabs = ['general', 'branding', 'seo', 'contact', 'animation', 'footer', 'header'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Settings</h1>
        <button onClick={() => mutation.mutate(form || settings)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded text-sm capitalize ${tab === t ? 'bg-electric text-white' : 'bg-white border'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        {tab === 'general' && (
          <>
            {['businessName', 'tagline', 'email', 'phone', 'serviceArea', 'businessHours'].map((field) => (
              <div key={field}>
                <label className="label-field capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input value={(data.general?.[field] as string) || ''} onChange={(e) => updateGeneral(field, e.target.value)} className="input-field" />
              </div>
            ))}
          </>
        )}
        {tab === 'branding' && (
          <>
            {['primaryColor', 'secondaryColor', 'accentColor', 'headingFont', 'bodyFont'].map((field) => (
              <div key={field}>
                <label className="label-field capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input value={(data.branding?.[field] as string) || ''} onChange={(e) => setForm({ ...data, branding: { ...data.branding, [field]: e.target.value } })} className="input-field" />
              </div>
            ))}
          </>
        )}
        {tab === 'footer' && (
          <>
            {['description', 'disclaimer', 'copyright', 'ctaLabel', 'ctaLink'].map((field) => (
              <div key={field}>
                <label className="label-field capitalize">{field}</label>
                <textarea value={(data.footer?.[field] as string) || ''} onChange={(e) => setForm({ ...data, footer: { ...data.footer, [field]: e.target.value } })} className="input-field" rows={field === 'disclaimer' ? 4 : 2} />
              </div>
            ))}
          </>
        )}
        {tab === 'animation' && (
          <>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.animation?.introEnabled} onChange={(e) => setForm({ ...data, animation: { ...data.animation, introEnabled: e.target.checked } })} /><span className="text-sm">Intro Enabled</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.animation?.smoothScrolling} onChange={(e) => setForm({ ...data, animation: { ...data.animation, smoothScrolling: e.target.checked } })} /><span className="text-sm">Smooth Scrolling</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.animation?.pageTransitions} onChange={(e) => setForm({ ...data, animation: { ...data.animation, pageTransitions: e.target.checked } })} /><span className="text-sm">Page Transitions</span></label>
          </>
        )}
        {tab === 'contact' && (
          <>
            <div><label className="label-field">Notification Email</label><input value={(data.contact?.notificationEmail as string) || ''} onChange={(e) => setForm({ ...data, contact: { ...data.contact, notificationEmail: e.target.value } })} className="input-field" /></div>
            <div><label className="label-field">Consent Text</label><textarea value={(data.contact?.consentText as string) || ''} onChange={(e) => setForm({ ...data, contact: { ...data.contact, consentText: e.target.value } })} className="input-field" rows={3} /></div>
          </>
        )}
        {tab === 'seo' && (
          <>
            <div><label className="label-field">Default Title</label><input value={(data.seo?.defaultTitle as string) || ''} onChange={(e) => setForm({ ...data, seo: { ...data.seo, defaultTitle: e.target.value } })} className="input-field" /></div>
            <div><label className="label-field">Default Description</label><textarea value={(data.seo?.defaultDescription as string) || ''} onChange={(e) => setForm({ ...data, seo: { ...data.seo, defaultDescription: e.target.value } })} className="input-field" rows={3} /></div>
          </>
        )}
        {tab === 'header' && (
          <>
            <div><label className="label-field">CTA Label</label><input value={(data.header?.ctaLabel as string) || ''} onChange={(e) => setForm({ ...data, header: { ...data.header, ctaLabel: e.target.value } })} className="input-field" /></div>
            <div><label className="label-field">CTA Link</label><input value={(data.header?.ctaLink as string) || ''} onChange={(e) => setForm({ ...data, header: { ...data.header, ctaLink: e.target.value } })} className="input-field" /></div>
            <div><label className="label-field">Phone</label><input value={(data.header?.phone as string) || ''} onChange={(e) => setForm({ ...data, header: { ...data.header, phone: e.target.value } })} className="input-field" /></div>
          </>
        )}
      </div>
    </div>
  );
}
