'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { FileText, Wrench, Image, MessageSquare, HelpCircle, BookOpen, Users, HardDrive } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;

  const stats = (data as { stats?: Record<string, number> })?.stats || {};
  const recentLeads = (data as { recentLeads?: Array<{ name: string; email: string; status: string; createdAt: string }> })?.recentLeads || [];
  const storageMB = (data as { storageUsageMB?: string })?.storageUsageMB || '0';

  const cards = [
    { label: 'Pages', value: stats.pages, icon: FileText, href: '/admin/pages', color: 'text-blue-600' },
    { label: 'Services', value: stats.services, icon: Wrench, href: '/admin/services', color: 'text-purple-600' },
    { label: 'Gallery', value: stats.galleryImages, icon: Image, href: '/admin/gallery', color: 'text-green-600' },
    { label: 'Testimonials', value: stats.testimonials, icon: MessageSquare, href: '/admin/testimonials', color: 'text-yellow-600' },
    { label: 'FAQs', value: stats.faqs, icon: HelpCircle, href: '/admin/faqs', color: 'text-orange-600' },
    { label: 'Blog Posts', value: stats.blogs, icon: BookOpen, href: '/admin/blog', color: 'text-pink-600' },
    { label: 'New Leads', value: stats.newLeads, icon: Users, href: '/admin/leads', color: 'text-red-600' },
    { label: 'Storage', value: `${storageMB} MB`, icon: HardDrive, href: '/admin/media', color: 'text-gray-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-midnight mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-midnight">{card.value ?? 0}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold text-midnight mb-4">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-gray-400 text-sm">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.slice(0, 5).map((lead, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.email}</p>
                  </div>
                  <span className="text-xs bg-electric/10 text-electric px-2 py-1 rounded">{lead.status}</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/admin/leads" className="text-electric text-sm mt-4 inline-block">View all leads</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold text-midnight mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/pages" className="p-3 bg-gray-50 rounded text-sm text-center hover:bg-electric/10 hover:text-electric transition-colors">Edit Pages</Link>
            <Link href="/admin/services" className="p-3 bg-gray-50 rounded text-sm text-center hover:bg-electric/10 hover:text-electric transition-colors">Manage Services</Link>
            <Link href="/admin/leads" className="p-3 bg-gray-50 rounded text-sm text-center hover:bg-electric/10 hover:text-electric transition-colors">View Leads</Link>
            <Link href="/admin/settings" className="p-3 bg-gray-50 rounded text-sm text-center hover:bg-electric/10 hover:text-electric transition-colors">Site Settings</Link>
            <Link href="/" target="_blank" className="p-3 bg-gray-50 rounded text-sm text-center hover:bg-electric/10 hover:text-electric transition-colors">View Site</Link>
            <Link href="/admin/media" className="p-3 bg-gray-50 rounded text-sm text-center hover:bg-electric/10 hover:text-electric transition-colors">Media Library</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
