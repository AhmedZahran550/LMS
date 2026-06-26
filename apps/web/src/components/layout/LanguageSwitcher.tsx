'use client';

import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none text-sm"
      title={i18n.language === 'ar' ? 'English' : 'عربى'}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline text-xs font-medium">
        {i18n.language === 'ar' ? 'English' : 'عربى'}
      </span>
    </button>
  );
}
