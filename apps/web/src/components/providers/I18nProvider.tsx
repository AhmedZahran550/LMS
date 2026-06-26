'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

function normalizeLang(lng: string) {
  const base = lng.substring(0, 2);
  return base === 'en' ? 'en' : 'ar';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lang = normalizeLang(i18n.language);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    document.title = i18n.t('LMS Platform');

    const handleLanguageChanged = (lng: string) => {
      const normalized = normalizeLang(lng);
      document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = normalized;
      document.title = i18n.t('LMS Platform');
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
