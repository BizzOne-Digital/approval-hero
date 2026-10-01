'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

const STATUSES = [
  'Started', 'Draft', 'Contact Pending', 'OTP Sent', 'Phone Verified', 'Email Verified', 'Submitted',
  'Under Review', 'Contacted', 'Documents Requested', 'Partner Matched',
  'Appointment Booked', 'Approved', 'Declined', 'Closed', 'Spam',
];

const TABS = ['Overview', 'Complete Answers', 'Contact', 'Timeline', 'Notes', 'Consent'] as const;

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<typeof TABS[number]>('Overview');
  const [note, setNote] = useState('');
  const [assignTo, setAssignTo] = useState('');

  const { data: app, isLoading } = useQuery({
    queryKey: ['admin-application', id],
    queryFn: () => adminApi.getApplication(id) as Promise<Record<string, unknown>>,
  });

  const { data: activity } = useQuery({
    queryKey: ['admin-application-activity', id],
    queryFn: () => adminApi.getApplicationActivity(id) as Promise<Array<Record<string, unknown>>>,
    enabled: tab === 'Timeline',
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateApplicationStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-application', id] }),
  });

  const noteMutation = useMutation({
    mutationFn: (text: string) => adminApi.addApplicationNote(id, text),
    onSuccess: () => { setNote(''); queryClient.invalidateQueries({ queryKey: ['admin-application', id] }); },
  });

  const assignMutation = useMutation({
    mutationFn: (assignedTo: string) => adminApi.assignApplication(id, assignedTo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-application', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteApplication(id),
    onSuccess: () => { window.location.href = '/admin/applications'; },
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;
  if (!app) return <p>Application not found</p>;

  const notes = (app.internalNotes as Array<{ text: string; author?: string; createdAt: string }>) || [];
  const consentRecords = (app.consentRecords as Array<Record<string, unknown>>) || [];

  return (
    <div>
      <Link href="/admin/applications" className="inline-flex items-center gap-1 text-sm text-electric mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Applications
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-midnight">
            {String(app.referenceNumber || 'Draft Application')}
          </h1>
          <p className="text-gray-500">{String(app.firstName || '')} {String(app.lastName || '')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={String(app.status)}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => { if (confirm('Archive this application?')) deleteMutation.mutate(); }} className="btn-outline !py-2 !px-3 text-sm text-red-600 flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Archive
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-6 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${tab === t ? 'border-electric text-electric' : 'border-transparent text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        {tab === 'Overview' && (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Item label="Status" value={String(app.status)} />
            <Item label="Email Verified" value={(app.emailVerified || app.phoneVerified) ? 'Yes' : 'No'} />
            <Item label="Vehicle Type" value={String(app.vehicleType || '—')} />
            <Item label="Credit" value={String(app.creditCategory || '—')} />
            <Item label="Employment" value={String(app.employmentStatus || '—')} />
            <Item label="Income Range" value={String(app.monthlyIncomeRange || '—')} />
            <Item label="Purchase Timeline" value={String(app.purchaseTimeline || '—')} />
            <Item label="Assigned To" value={String(app.assignedTo || '—')} />
            <Item label="Source" value={String(app.source || '—')} />
            <Item label="Submitted" value={app.submittedAt ? new Date(String(app.submittedAt)).toLocaleString() : '—'} />
          </dl>
        )}

        {tab === 'Complete Answers' && (
          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-[60vh]">{JSON.stringify(app, null, 2)}</pre>
        )}

        {tab === 'Contact' && (
          <dl className="space-y-3 text-sm">
            <Item label="Name" value={`${app.firstName || ''} ${app.lastName || ''}`} />
            <Item label="Email" value={String(app.encryptedEmail || '—')} />
            <Item label="Phone" value={String(app.encryptedPhone || '—')} />
            <Item label="Preferred Contact" value={String(app.preferredContactMethod || '—')} />
            <Item label="Best Time" value={String(app.bestTimeToContact || '—')} />
            {app.address ? (
              <Item label="Address" value={`${(app.address as Record<string, string>).street}, ${(app.address as Record<string, string>).city}, ${(app.address as Record<string, string>).province}`} />
            ) : null}
          </dl>
        )}

        {tab === 'Timeline' && (
          <ul className="space-y-3">
            {(activity || []).map((a) => (
              <li key={String(a._id)} className="text-sm border-l-2 border-electric pl-4 py-1">
                <p className="font-medium">{String(a.action)}</p>
                <p className="text-gray-500">{String(a.description)}</p>
                <p className="text-xs text-gray-400">{new Date(String(a.createdAt)).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'Notes' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Add internal note..." value={note} onChange={(e) => setNote(e.target.value)} />
              <button onClick={() => note && noteMutation.mutate(note)} className="btn-primary !py-2 !px-4 text-sm">Add</button>
            </div>
            <div className="flex gap-2">
              <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Assign to..." value={assignTo} onChange={(e) => setAssignTo(e.target.value)} />
              <button onClick={() => assignTo && assignMutation.mutate(assignTo)} className="btn-outline !py-2 !px-4 text-sm">Assign</button>
            </div>
            <ul className="space-y-2">
              {notes.map((n, i) => (
                <li key={i} className="bg-gray-50 p-3 rounded text-sm">
                  <p>{n.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.author} · {new Date(n.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'Consent' && (
          <ul className="space-y-2 text-sm">
            {consentRecords.map((c, i) => (
              <li key={i} className="flex justify-between bg-gray-50 p-3 rounded">
                <span className="capitalize">{String(c.type)}</span>
                <span className="text-gray-500">v{String(c.version)} · {new Date(String(c.acceptedAt)).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
