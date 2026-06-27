'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@lms/shared-types';
import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTokens = useAuthStore((state) => state.setTokens);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setStatus('error');
      return;
    }

    setTokens(accessToken, refreshToken);

    axios
      .get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        const user = res.data;
        setAuth(user, accessToken, refreshToken);

        const role = user.role;
        if (role === UserRole.INSTRUCTOR) {
          router.replace('/instructor');
        } else if (role === UserRole.ADMIN) {
          router.replace('/admin');
        } else {
          router.replace('/my-courses');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [router, setAuth, setTokens]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500 text-sm">Authentication failed. Please try again.</p>
        <button
          onClick={() => router.replace('/login')}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm text-slate-500">Completing sign in...</p>
    </div>
  );
}
