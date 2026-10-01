'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Wrench, Image, MessageSquare,
  HelpCircle, BookOpen, Tag, Users, FolderOpen, Settings,
  Menu, LogOut, ChevronLeft, Navigation, ClipboardList, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { href: '/admin/application-settings', label: 'Application Settings', icon: SlidersHorizontal },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/offers', label: 'Offers / Pricing', icon: Tag },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: FolderOpen },
  { href: '/admin/navigation', label: 'Header & Footer', icon: Navigation },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await adminApi.logout();
    window.location.href = '/admin/login';
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-midnight text-white rounded"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-midnight text-white z-40 transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed && (
            <Link href="/admin" className="font-display font-bold text-lg tracking-wider">
              AH <span className="text-electric">ADMIN</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block p-1 hover:bg-white/10 rounded">
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  active ? 'bg-electric/20 text-electric border-r-2 border-electric' : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-white/60 hover:text-red-400 transition-colors text-sm w-full"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
