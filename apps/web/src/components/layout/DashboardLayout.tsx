'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedLayout>
      <div className="bg-background text-on-background min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-background">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto w-full">
              {children}
            </div>
            {/* Background Decorative Shader/Effect */}
            <div className="fixed bottom-0 ltr:right-0 rtl:left-0 w-[500px] h-[500px] opacity-10 pointer-events-none z-0 ltr:translate-x-1/4 rtl:-translate-x-1/4 translate-y-1/4">
              <div className="w-full h-full bg-gradient-to-tr from-[var(--sv-primary)] to-[var(--sv-secondary-container)] rounded-full blur-[120px]"></div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
