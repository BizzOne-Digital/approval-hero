'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminApplicationSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['application-settings'],
    queryFn: () => adminApi.getApplicationSettings() as Promise<Record<string, unknown>>,
  });

  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const display = form || settings;

  const saveMutation = useMutation({
    mutationFn: (data: unknown) => adminApi.updateApplicationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-settings'] });
      setForm(null);
    },
  });

  if (isLoading || !display) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  const sm = display.successMessage as Record<string, string> || {};
  const cw = display.consentWording as Record<string, string> || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Application Settings</h1>
        <button
          onClick={() => saveMutation.mutate(display)}
          disabled={saveMutation.isPending}
          className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-midnight mb-4">Success Message</h2>
          <div className="space-y-3">
            <Field label="Heading" value={sm.heading || ''} onChange={(v) => updateNested(setForm, display, ['successMessage', 'heading'], v)} />
            <Field label="Body" value={sm.body || ''} onChange={(v) => updateNested(setForm, display, ['successMessage', 'body'], v)} multiline />
            <Field label="Expected Response Time" value={sm.expectedResponseTime || ''} onChange={(v) => updateNested(setForm, display, ['successMessage', 'expectedResponseTime'], v)} />
          </div>
        </section>

        <section className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-midnight mb-4">Down Payment Disclaimer</h2>
          <textarea
            className="w-full border rounded-lg p-3 text-sm"
            rows={3}
            value={String(display.downPaymentDisclaimer || '')}
            onChange={(e) => setForm({ ...display, downPaymentDisclaimer: e.target.value })}
          />
        </section>

        <section className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-midnight mb-4">Consent Wording</h2>
          <div className="space-y-3">
            {['accuracy', 'contact', 'privacy', 'partnerShare', 'marketing'].map((key) => (
              <Field
                key={key}
                label={key}
                value={cw[key] || ''}
                onChange={(v) => updateNested(setForm, display, ['consentWording', key], v)}
                multiline
              />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-midnight mb-4">Vehicle Type Images</h2>
          <p className="text-sm text-gray-500 mb-4">Edit image URLs for each vehicle type card in the application wizard.</p>
          <div className="space-y-3">
            {((display.vehicleTypes as Array<Record<string, string>>) || []).map((vt, i) => (
              <div key={vt.id} className="grid sm:grid-cols-3 gap-3 items-center">
                <span className="text-sm font-medium">{vt.label}</span>
                <input
                  className="sm:col-span-2 border rounded-lg px-3 py-2 text-sm"
                  value={vt.imageUrl || ''}
                  onChange={(e) => {
                    const types = [...((display.vehicleTypes as Array<Record<string, string>>) || [])];
                    types[i] = { ...types[i], imageUrl: e.target.value };
                    setForm({ ...display, vehicleTypes: types });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1 capitalize">{label}</label>
      {multiline ? (
        <textarea className="w-full border rounded-lg p-3 text-sm" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="w-full border rounded-lg px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function updateNested(
  setForm: (v: Record<string, unknown>) => void,
  display: Record<string, unknown>,
  path: string[],
  value: string,
) {
  const next = { ...display };
  let cur: Record<string, unknown> = next;
  for (let i = 0; i < path.length - 1; i++) {
    cur[path[i]] = { ...(cur[path[i]] as Record<string, unknown> || {}) };
    cur = cur[path[i]] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
  setForm(next);
}
