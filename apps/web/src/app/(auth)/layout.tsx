'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const shapes = document.querySelectorAll('.floating-shape');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      shapes.forEach((shape, idx) => {
        const speed = (idx + 1) * 20;
        (shape as HTMLElement).style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex min-h-screen flex-col selection:bg-indigo-100 selection:text-indigo-900 bg-[var(--sv-bg-page)] transition-colors">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape absolute -z-10 blur-[60px] opacity-40 rounded-full bg-indigo-600 w-[500px] h-[500px] -top-64 -end-32 transition-transform duration-300 ease-out"></div>
        <div className="floating-shape absolute -z-10 blur-[60px] opacity-40 rounded-full bg-cyan-600 w-[400px] h-[400px] -bottom-32 -start-32 transition-transform duration-300 ease-out"></div>
      </div>

      <header className="flex justify-between items-center px-6 py-4 w-full max-w-[1200px] mx-auto relative z-10">
        <div className="text-2xl font-bold text-indigo-600">
          <Link href="/">{t('LMS Platform')}</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full">
          {children}
        </div>
      </main>

      <footer className="w-full bg-[var(--sv-bg-card)]/50 backdrop-blur-md border-t border-slate-200 px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 mt-auto">
        <div className="text-lg font-bold text-indigo-600">{t('LMS Platform')}</div>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline">{t('Privacy')}</Link>
          <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline">{t('Terms')}</Link>
          <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline">{t('Contact Us')}</Link>
        </div>
        <div className="text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} {t('LMS Platform')}. {t('All rights reserved.')}
        </div>
      </footer>
    </div>
  );
}
