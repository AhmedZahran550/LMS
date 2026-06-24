import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </ProtectedLayout>
  );
}
