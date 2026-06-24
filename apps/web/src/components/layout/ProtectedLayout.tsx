'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!user && !pathname.includes('/login') && !pathname.includes('/register')) {
      router.push('/login');
    }
  }, [user, router, pathname]);

  if (!user) return null;

  return <>{children}</>;
}
