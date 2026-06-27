'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserRole, UserProfile } from '@lms/shared-types';
import { useAuthStore } from '@/store/useAuthStore';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function SocialLoginWithPopup() {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.LEARNER);

  const handleOAuthMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type !== 'OAUTH_SUCCESS') return;
      const { user, accessToken, refreshToken } = event.data as {
        user: UserProfile;
        accessToken: string;
        refreshToken: string;
      };
      setAuth(user, accessToken, refreshToken);
      if (user.role === UserRole.INSTRUCTOR) {
        router.replace('/instructor');
      } else if (user.role === UserRole.ADMIN) {
        router.replace('/admin');
      } else {
        router.replace('/my-courses');
      }
    },
    [setAuth, router],
  );

  useEffect(() => {
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [handleOAuthMessage]);

  const handleGoogle = () => {
    setPendingUrl(`${API_URL}/auth/google?role=`);
    setRole(UserRole.LEARNER);
    setShowPopup(true);
  };

  const handleFacebook = () => {
    setPendingUrl(`${API_URL}/auth/facebook?role=`);
    setRole(UserRole.LEARNER);
    setShowPopup(true);
  };

  const handleContinue = () => {
    window.open(`${pendingUrl}${role}`, 'oauth-popup', 'width=600,height=700,popup=1');
    setShowPopup(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleGoogle}
          className="flex items-center justify-center gap-3 w-full h-11 px-4 rounded-lg border border-[var(--sv-border)] bg-[var(--sv-bg-card)] text-[var(--sv-text-primary)] text-sm font-medium hover:bg-[var(--sv-surface-container-high)] transition-colors shadow-sm"
        >
          <GoogleIcon />
          {t('Continue with Google')}
        </button>
        <button
          type="button"
          onClick={handleFacebook}
          className="flex items-center justify-center gap-3 w-full h-11 px-4 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm"
        >
          <FacebookIcon />
          {t('Continue with Facebook')}
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--sv-bg-card)] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 relative border border-[var(--sv-border)]">
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-3 end-3 text-[var(--sv-text-muted)] hover:text-[var(--sv-text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-[var(--sv-text-primary)]">{t('Join as')}</h3>
              <p className="text-sm text-[var(--sv-text-secondary)] mt-1">{t('Choose your role to continue')}</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole(UserRole.LEARNER)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === UserRole.LEARNER
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
                onClick={() => setRole(UserRole.INSTRUCTOR)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === UserRole.INSTRUCTOR
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
            >
              {t('Continue')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
