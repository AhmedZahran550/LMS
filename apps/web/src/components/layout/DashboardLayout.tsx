import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
