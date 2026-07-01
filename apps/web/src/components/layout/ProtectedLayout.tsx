'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!_hasHydrated) return;
    if (!user && !pathname.includes('/login') && !pathname.includes('/register')) {
      router.push('/login');
    }
    if (user && user.role === 'learner') {
      router.replace('/login?error=students_use_mobile');
    }
    if (
      user &&
      user.role === 'instructor' &&
      !user.subscription?.status &&
      !pathname.includes('/choose-plan')
    ) {
      window.location.href = '/choose-plan';
    }
  }, [user, _hasHydrated, router, pathname]);

  if (!_hasHydrated || !user) return null;

  return <>{children}</>;
}

