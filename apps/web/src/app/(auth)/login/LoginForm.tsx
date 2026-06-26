'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  });
}

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginMutation = useLoginMutation();
  const sendOtpMutation = useSendOtpMutation();
  const [serverError, setServerError] = useState<{ message: string; code?: string } | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const loginSchema = useMemo(() => getLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setResendSuccess(null);
    setResendError(null);
    try {
      const response = await loginMutation.mutateAsync(data);
      const { user, accessToken, refreshToken } = response;
      
      setAuth(user, accessToken, refreshToken);
      
      if (user.role === UserRole.INSTRUCTOR) {
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
          message: data?.message || t('Login failed. Please check your credentials.'),
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
    />
  );
}
