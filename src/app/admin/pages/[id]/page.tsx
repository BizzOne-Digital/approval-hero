'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';
import type { PageSection } from '@/lib/types';

export default function AdminPageEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const { data: page, isLoading } = useQuery({
    queryKey: ['admin-page', id],
    queryFn: () => adminApi.getPage(id!) as Promise<{ _id: string; title: string; slug: string; status: string; sections: PageSection[]; seoTitle?: string; seoDescription?: string }>,
  });

  const [form, setForm] = useState<typeof page | null>(null);

  const pageData = form || page;

  const mutation = useMutation({
    mutationFn: (data: unknown) => adminApi.updatePage(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-page', id] });
      alert('Page saved successfully');
    },
  });

  if (isLoading || !pageData) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  const updateSection = (index: number, field: string, value: unknown) => {
    const sections = [...(form?.sections || page!.sections)];
    sections[index] = { ...sections[index], [field]: value };
    setForm({ ...(form || page!), sections });
  };

  const handleSave = () => {
    mutation.mutate(form || page);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-midnight">{pageData.title}</h1>
          <p className="text-gray-500 text-sm">/{pageData.slug}</p>
        </div>
        <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <label className="label-field">Status</label>
          <select
            value={pageData.status}
            onChange={(e) => setForm({ ...(form || page!), status: e.target.value })}
            className="input-field"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <label className="label-field">SEO Title</label>
          <input
            value={pageData.seoTitle || ''}
            onChange={(e) => setForm({ ...(form || page!), seoTitle: e.target.value })}
            className="input-field"
          />
        </div>
        <div className="bg-white rounded-lg border p-4">
          <label className="label-field">SEO Description</label>
          <input
            value={pageData.seoDescription || ''}
            onChange={(e) => setForm({ ...(form || page!), seoDescription: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <h2 className="font-semibold text-midnight mb-4">Sections ({pageData.sections.length})</h2>
      <div className="space-y-4">
        {pageData.sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg border overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{section.sectionType}</span>
                <span className="font-medium">{section.name}</span>
                {!section.isVisible && <span className="text-xs text-yellow-600">Hidden</span>}
              </div>
              {expandedSection === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedSection === index && (
              <div className="p-4 border-t grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Eyebrow</label>
                  <input value={section.eyebrow || ''} onChange={(e) => updateSection(index, 'eyebrow', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Heading</label>
                  <input value={section.heading || ''} onChange={(e) => updateSection(index, 'heading', e.target.value)} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">Subheading</label>
                  <textarea value={section.subheading || ''} onChange={(e) => updateSection(index, 'subheading', e.target.value)} className="input-field" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">Body (HTML)</label>
                  <textarea value={section.body || ''} onChange={(e) => updateSection(index, 'body', e.target.value)} className="input-field font-mono text-sm" rows={4} />
                </div>
                <div>
                  <label className="label-field">CTA Label</label>
                  <input value={section.ctaLabel || ''} onChange={(e) => updateSection(index, 'ctaLabel', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">CTA Link</label>
                  <input value={section.ctaLink || ''} onChange={(e) => updateSection(index, 'ctaLink', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Background Image URL</label>
                  <input value={section.backgroundImage?.url || ''} onChange={(e) => updateSection(index, 'backgroundImage', { ...section.backgroundImage, url: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Primary Image URL</label>
                  <input value={section.primaryImage?.url || ''} onChange={(e) => updateSection(index, 'primaryImage', { ...section.primaryImage, url: e.target.value })} className="input-field" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={section.isVisible} onChange={(e) => updateSection(index, 'isVisible', e.target.checked)} />
                    <span className="text-sm">Visible</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
