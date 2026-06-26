'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            {t('LMS Platform')}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
