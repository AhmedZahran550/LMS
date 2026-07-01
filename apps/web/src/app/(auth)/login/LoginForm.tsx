'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoginFormUI } from './LoginFormUI';
import { useLoginMutation, useSendOtpMutation } from '@/hooks/useAuthMutations';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@lms/shared-types';

type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;

function getLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().min(1, t('Email is required')).email(t('Invalid email address')),
    password: z.string().min(1, t('Password is required')),
    role: z.nativeEnum(UserRole),
  });
}

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'true' ? t('Password reset successfully! Sign in with your new password.') : null;
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginMutation = useLoginMutation();
  const sendOtpMutation = useSendOtpMutation();
  const [serverError, setServerError] = useState<{ message: string; code?: string } | null>(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'students_use_mobile') {
      return { message: t('Students must use the mobile app to log in.') };
    }
    return null;
  });
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const loginSchema = useMemo(() => getLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: UserRole.INSTRUCTOR,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setResendSuccess(null);
    setResendError(null);
    
    if (data.role === UserRole.LEARNER) {
      setServerError({ message: t('Students must use the mobile app to log in.') });
      return;
    }

    try {
      const response = await loginMutation.mutateAsync(data);
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
      
      if (user.role === UserRole.INSTRUCTOR && !user.subscription?.status) {
        router.push('/choose-plan');
      } else if (user.role === UserRole.INSTRUCTOR) {
        router.push('/instructor');
      } else if (user.role === UserRole.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/my-courses');
      }
    } catch (err: any) {
      const data = err.response?.data;
      
      if (data?.errorCode === 'VERIFY_EMAIL') {
        setServerError(null);
        const email = getValues('email');
        try {
          await sendOtpMutation.mutateAsync(email);
          setResendSuccess(t('OTP sent! Redirecting to verification...'));
          setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 1000);
        } catch (sendErr: any) {
          setServerError({
            message: sendErr.response?.data?.message || t('Failed to send OTP'),
            code: 'SEND_OTP_FAILED',
          });
        }
      } else {
        setServerError({
          message: data?.message === 'error.students_use_mobile' 
            ? t('Students must use the mobile app to log in.') 
            : data?.message || t('Login failed. Please check your credentials.'),
          code: data?.errorCode,
        });
      }
    }
  };

  const handleSendOtp = async () => {
    const email = getValues('email');
    if (!email) {
      setResendError(t('Please enter your email first.'));
      return;
    }
    setResendError(null);
    setResendSuccess(null);
    try {
      await sendOtpMutation.mutateAsync(email);
      setResendSuccess(t('OTP sent! Redirecting to verification...'));
      setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 1000);
    } catch (err: any) {
      setResendError(err.response?.data?.message || t('Failed to send OTP'));
    }
  };

  return (
    <LoginFormUI
      register={register}
      errors={errors}
      serverError={serverError}
      isLoading={loginMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onResendVerification={handleSendOtp}
      isResending={sendOtpMutation.isPending}
      resendSuccess={resendSuccess}
      resendError={resendError}
      resetSuccess={resetSuccess}
      selectedRole={selectedRole}
    />
  );
}
