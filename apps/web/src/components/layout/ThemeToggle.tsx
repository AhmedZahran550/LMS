'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full p-2 text-[var(--sv-text-muted)] hover:bg-[var(--sv-surface-container-high)] hover:text-[var(--sv-text-primary)] transition-colors focus:outline-none text-sm"
      title={theme === 'light' ? t('Dark mode') : t('Light mode')}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
