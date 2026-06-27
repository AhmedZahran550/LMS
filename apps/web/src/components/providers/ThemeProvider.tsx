'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuthStore();
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    setTheme(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const userTheme = user?.preferences?.mode as Theme | undefined;
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initial = userTheme || stored || (osDark ? 'dark' : 'light');
    applyTheme(initial);
    localStorage.setItem('theme', initial);
    setMounted(true);
  }, [user?.preferences?.mode, applyTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme') && !user?.preferences?.mode) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [applyTheme, user?.preferences?.mode]);

  const toggle = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
    sessionStorage.setItem('theme_changed_locally', 'true');

    if (user) {
      api.patch('/profile/me/preferences', { mode: next }).then(() => {
        updateUser({ preferences: { ...user.preferences, mode: next } as any });
      }).catch(() => {});
    }
  }, [theme, user, applyTheme, updateUser]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
