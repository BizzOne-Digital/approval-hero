'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Download, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

const statuses = ['New', 'Contacted', 'Qualified', 'Follow-Up', 'Converted', 'Closed', 'Spam'];

interface LeadRow {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  submissionType: string;
  status: string;
  province?: string;
  city?: string;
  vehicleType?: string;
  creditSituation?: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  sourcePage?: string;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<LeadRow | null>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => adminApi.getLeads() as Promise<LeadRow[]>,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateLead(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-midnight">Leads & Applications</h1>
        <a href={`${process.env.NEXT_PUBLIC_API_URL}/admin/leads/export/csv`} className="btn-outline !py-2 !px-4 text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Applicant</th>
                <th className="text-left p-4">Vehicle</th>
                <th className="text-left p-4">Credit</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(leads || []).map((lead) => (
                <tr key={lead._id} className={`border-b hover:bg-gray-50 cursor-pointer ${selected?._id === lead._id ? 'bg-electric/5' : ''}`} onClick={() => setSelected(lead)}>
                  <td className="p-4">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-gray-500 text-xs">{lead.phone}</p>
                  </td>
                  <td className="p-4 capitalize text-gray-600">{lead.vehicleType || '-'}</td>
                  <td className="p-4 text-gray-500 text-xs">{lead.creditSituation || '-'}</td>
                  <td className="p-4 text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select value={lead.status} onChange={(e) => updateMutation.mutate({ id: lead._id, status: e.target.value })} className="text-xs border rounded px-2 py-1">
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelected(lead)} className="p-2 hover:bg-gray-100 rounded inline-block"><Eye className="w-4 h-4 text-electric" /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(lead._id); }} className="p-2 hover:bg-red-50 rounded inline-block"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {selected ? (
            <>
              <h3 className="font-semibold text-midnight mb-4">Application Details</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{selected.name}</dd></div>
                <div><dt className="text-gray-500">Email</dt><dd>{selected.email}</dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd>{selected.phone}</dd></div>
                <div><dt className="text-gray-500">Vehicle</dt><dd className="capitalize">{selected.vehicleType || '-'}</dd></div>
                <div><dt className="text-gray-500">Location</dt><dd>{selected.city ? `${selected.city}, ${selected.province}` : '-'}</dd></div>
                <div><dt className="text-gray-500">Employment</dt><dd className="capitalize">{selected.employmentStatus || '-'}</dd></div>
                <div><dt className="text-gray-500">Income</dt><dd>{selected.monthlyIncome ? `$${selected.monthlyIncome}/mo` : '-'}</dd></div>
                <div><dt className="text-gray-500">Credit</dt><dd className="capitalize">{selected.creditSituation || '-'}</dd></div>
                <div><dt className="text-gray-500">Source</dt><dd>{selected.sourcePage || '-'}</dd></div>
                <div><dt className="text-gray-500">Submitted</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div>
              </dl>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Select an application to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
