'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoginFormUI } from './LoginFormUI';
import { useLoginMutation, useResendVerificationMutation } from '@/hooks/useAuthMutations';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@lms/shared-types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginMutation = useLoginMutation();
  const resendMutation = useResendVerificationMutation();
  const [serverError, setServerError] = useState<{ message: string; code?: string } | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

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
      setServerError({
        message: data?.message || 'Login failed. Please check your credentials.',
        code: data?.errorCode,
      });
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      setResendError('Please enter your email first.');
      return;
    }
    setResendError(null);
    setResendSuccess(null);
    try {
      const response = await resendMutation.mutateAsync(email);
      setResendSuccess(response.message || 'Verification email resent successfully.');
    } catch (err: any) {
      setResendError(err.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <LoginFormUI
      register={register}
      errors={errors}
      serverError={serverError}
      isLoading={loginMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onResendVerification={handleResendVerification}
      isResending={resendMutation.isPending}
      resendSuccess={resendSuccess}
      resendError={resendError}
    />
  );
}
