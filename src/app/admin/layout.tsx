'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:ml-64 p-6 pt-16 lg:pt-6 min-h-screen">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
