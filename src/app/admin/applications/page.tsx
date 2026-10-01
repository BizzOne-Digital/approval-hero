'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Download, Search, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';

const STATUSES = [
  'Started', 'Draft', 'Contact Pending', 'OTP Sent', 'Phone Verified', 'Email Verified', 'Submitted',
  'Under Review', 'Contacted', 'Documents Requested', 'Partner Matched',
  'Appointment Booked', 'Approved', 'Declined', 'Closed', 'Spam',
];

interface AppRow {
  _id: string;
  referenceNumber?: string;
  applicantName: string;
  phone: string;
  email: string;
  vehicleType?: string;
  preferredVehicle?: string;
  creditCategory?: string;
  employmentStatus?: string;
  monthlyIncomeRange?: string;
  purchaseTimeline?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  status: string;
  assignedTo?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', search, status, page],
    queryFn: () => adminApi.getApplications({
      search,
      status,
      page: String(page),
      limit: '20',
    }) as Promise<{ items: AppRow[]; total: number; page: number; limit: number }>,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / (data?.limit || 20));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-midnight">Applications</h1>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/admin/applications/export`}
          className="btn-outline !py-2 !px-4 text-sm flex items-center gap-2 w-fit"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            placeholder="Search by name, reference, vehicle..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Reference</th>
                <th className="text-left p-3">Applicant</th>
                <th className="text-left p-3">Vehicle</th>
                <th className="text-left p-3">Credit</th>
                <th className="text-left p-3">Timeline</th>
                <th className="text-left p-3">Verified</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((app) => (
                <tr key={app._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{app.referenceNumber || '—'}</td>
                  <td className="p-3">
                    <p className="font-medium">{app.applicantName}</p>
                    <p className="text-gray-400 text-xs">{app.phone}</p>
                  </td>
                  <td className="p-3 capitalize">{app.vehicleType || '—'}</td>
                  <td className="p-3 text-xs">{app.creditCategory || '—'}</td>
                  <td className="p-3 text-xs">{app.purchaseTimeline || '—'}</td>
                  <td className="p-3">{(app.emailVerified || app.phoneVerified) ? '✓' : '—'}</td>
                  <td className="p-3"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{app.status}</span></td>
                  <td className="p-3 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/applications/${app._id}`} className="p-2 hover:bg-gray-100 rounded inline-block">
                      <Eye className="w-4 h-4 text-electric" />
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No applications found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline !py-1 !px-3 text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-gray-500 py-2">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline !py-1 !px-3 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
