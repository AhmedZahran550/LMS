'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Brain, AlertCircle, Loader2 } from 'lucide-react';
import { UserRole } from '@lms/shared-types';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export default function ChooseRolePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const tempToken = useAuthStore((state) => state.tempToken);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearTempToken = useAuthStore((state) => state.clearTempToken);
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_hasHydrated && !tempToken) {
      router.replace('/login');
    }
  }, [tempToken, router, _hasHydrated]);

  const handleContinue = async () => {
    if (!selected || !tempToken) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/complete-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, role: selected }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Registration failed');
      }

      const data = await res.json();
      clearTempToken();
      setAuth(data.user, data.accessToken, data.refreshToken);

      const target = data.user.role === UserRole.INSTRUCTOR ? '/instructor' : '/my-courses';
      setTimeout(() => {
        window.location.href = target;
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (!_hasHydrated || !tempToken) {
    return null;
  }

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--sv-bg-card)] rounded-2xl shadow-xl border border-[var(--sv-border)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--sv-text-primary)]">
              {t('Choose Your Role')}
            </h1>
            <p className="text-sm text-[var(--sv-text-secondary)] mt-2">
              {t('Select how you want to use the platform')}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-[var(--sv-error)] bg-[var(--sv-error-50)] p-3 rounded-lg border border-[var(--sv-error)]/20 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelected(UserRole.LEARNER)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selected === UserRole.LEARNER
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-[var(--sv-border)] text-[var(--sv-text-muted)] hover:bg-[var(--sv-surface-container-high)]'
              }`}
            >
              <GraduationCap className="w-6 h-6 shrink-0" />
              <div className="text-start">
                <p className="text-sm font-semibold">{t('Learner')}</p>
                <p className="text-xs opacity-70">{t('Browse and enroll in courses')}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelected(UserRole.INSTRUCTOR)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selected === UserRole.INSTRUCTOR
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-[var(--sv-border)] text-[var(--sv-text-muted)] hover:bg-[var(--sv-surface-container-high)]'
              }`}
            >
              <Brain className="w-6 h-6 shrink-0" />
              <div className="text-start">
                <p className="text-sm font-semibold">{t('Instructor')}</p>
                <p className="text-xs opacity-70">{t('Create and manage courses')}</p>
              </div>
            </button>
          </div>

          <Button
            type="button"
            className="w-full h-11 text-base shadow-md"
            onClick={handleContinue}
            disabled={!selected || loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t('Continue')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
