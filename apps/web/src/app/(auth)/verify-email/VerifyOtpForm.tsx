'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useVerifyOtpMutation, useSendOtpMutation } from '@/hooks/useAuthMutations';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@lms/shared-types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const OTP_EXPIRY_SECONDS = 600;

export function VerifyOtpForm({ email }: { email: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [expiry, setExpiry] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  const verifyMutation = useVerifyOtpMutation();
  const sendOtpMutation = useSendOtpMutation();
  const expiryRef = useRef(OTP_EXPIRY_SECONDS);

  useEffect(() => {
    expiryRef.current = OTP_EXPIRY_SECONDS;
    setIsExpired(false);

    const timer = setInterval(() => {
      expiryRef.current -= 1;
      if (expiryRef.current <= 0) {
        setIsExpired(true);
        setExpiry(0);
        clearInterval(timer);
      } else {
        setExpiry(expiryRef.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setServerError(null);
    try {
      const response = await verifyMutation.mutateAsync({ email, otp });
      const { user, accessToken, refreshToken } = response;
      const themeChanged = sessionStorage.getItem('theme_changed_locally') === 'true';
      const langChanged = sessionStorage.getItem('lang_changed_locally') === 'true';
      if (themeChanged || langChanged) {
        const payload: any = {};
        if (themeChanged) payload.mode = localStorage.getItem('theme');
        if (langChanged) payload.lang = require('i18next').default?.language || window.localStorage.getItem('i18next') || 'ar';

        try {
          const { api } = require('@/lib/api');
          await api.patch('/profile/me/preferences', payload, { headers: { Authorization: `Bearer ${accessToken}` } });
          if (!user.preferences) user.preferences = { lang: 'ar', mode: 'light' };
          if (payload.mode) user.preferences.mode = payload.mode;
          if (payload.lang) user.preferences.lang = payload.lang;
        } catch (e) {}
      }

      sessionStorage.removeItem('theme_changed_locally');
      sessionStorage.removeItem('lang_changed_locally');

      setAuth(user, accessToken, refreshToken);

      if (user.role === UserRole.INSTRUCTOR) {
        router.push('/instructor');
      } else if (user.role === UserRole.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/my-courses');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Verification failed';
      setServerError(message);
    }
  };

  const handleResendOtp = async () => {
    setServerError(null);
    try {
      await sendOtpMutation.mutateAsync(email);
      expiryRef.current = OTP_EXPIRY_SECONDS;
      setExpiry(OTP_EXPIRY_SECONDS);
      setIsExpired(false);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-md mx-auto bg-[var(--sv-bg-card)]/95 backdrop-blur-md shadow-lg border border-[var(--sv-border)] rounded-2xl p-8 text-center">
        <Mail className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[var(--sv-text-primary)] mb-2">{t('Verification')}</h3>
        <p className="text-sm text-[var(--sv-text-secondary)] mb-6">{t('No email provided. Please register first.')}</p>
        <Link href="/register">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 me-2" />
            {t('Sign up')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--sv-bg-card)]/95 backdrop-blur-md shadow-lg border border-[var(--sv-border)] rounded-2xl p-8">
      <div className="flex justify-center mb-4">
        <Mail className="h-12 w-12 text-indigo-600" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--sv-text-primary)]">{t('Verify your email')}</h1>
        <p className="text-sm text-[var(--sv-text-secondary)] mt-1">
          {t('Enter the 6-digit code sent to')}
          <br />
          <span className="font-semibold text-[var(--sv-text-primary)]">{email}</span>
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-200 text-center mb-4">
        For development, use OTP: <span className="font-bold text-base tracking-widest">999999</span>
      </div>

      {!isExpired ? (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--sv-text-secondary)] mb-4">
          <Clock className="h-4 w-4" />
          {t('OTP expires in')} <span className="font-semibold text-[var(--sv-text-primary)]">{formatTime(expiry)}</span>
        </div>
      ) : (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center mb-4">
          {t('OTP has expired. Request a new one.')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--sv-text-primary)]">{t('OTP Code')}</label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-2xl tracking-[8px] font-mono h-14"
            autoFocus
          />
        </div>

        {serverError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded text-center">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={otp.length !== 6 || isExpired}
          isLoading={verifyMutation.isPending}
        >
          {t('Verify Email')}
        </Button>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={sendOtpMutation.isPending}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline disabled:opacity-50"
        >
          {sendOtpMutation.isPending ? t('Sending...') : t('Resend OTP')}
        </button>
      </div>

      <p className="text-xs text-center text-[var(--sv-text-muted)] mt-4">
        <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
          {t('Back to login')}
        </Link>
      </p>
    </div>
  );
}
