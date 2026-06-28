'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useResetPasswordMutation } from '@/hooks/useAuthMutations';

function ResetPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const mutation = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const schema = z
    .object({
      newPassword: z
        .string()
        .min(8, t('Password must be at least 8 characters'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
          t('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'),
        ),
      confirmPassword: z.string().min(1, t('Passwords must match')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('Passwords must match'),
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ newPassword: string; confirmPassword: string }>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[var(--sv-bg-card)] rounded-2xl shadow-xl border border-[var(--sv-border)] p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--sv-text-primary)] mb-2">
              {t('Invalid or expired reset link')}
            </h1>
            <p className="text-sm text-[var(--sv-text-secondary)] mb-6">
              {t('This link is invalid or has expired. Please request a new one.')}
            </p>
            <Button
              type="button"
              className="w-full h-11 text-base shadow-md"
              onClick={() => router.push('/forgot-password')}
            >
              {t('Request a new reset link')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: { newPassword: string }) => {
    try {
      await mutation.mutateAsync({ token, newPassword: data.newPassword });
      router.push('/login?reset=true');
    } catch {}
  };

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--sv-bg-card)] rounded-2xl shadow-xl border border-[var(--sv-border)] p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--sv-text-primary)]">
              {t('Set new password')}
            </h1>
            <p className="text-sm text-[var(--sv-text-secondary)] mt-2">
              {t('Enter your new password below.')}
            </p>
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 text-sm text-[var(--sv-error)] bg-[var(--sv-error-50)] p-3 rounded-lg border border-[var(--sv-error)]/20 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{(mutation.error as any)?.response?.data?.message || t('Something went wrong')}</span>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 mb-4">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{t('Password reset successfully')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="newPassword">
                {t('New password')}
              </label>
              <div className="relative group">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('newPassword')}
                  className="pe-10 ps-10"
                />
                <Lock className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-[var(--sv-text-muted)] group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 start-3 my-auto text-[var(--sv-text-muted)] hover:text-[var(--sv-text-primary)] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-[var(--sv-error)] mt-1">{errors.newPassword.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="confirmPassword">
                {t('Confirm new password')}
              </label>
              <div className="relative group">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="pe-10 ps-10"
                />
                <Lock className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-[var(--sv-text-muted)] group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 start-3 my-auto text-[var(--sv-text-muted)] hover:text-[var(--sv-text-primary)] focus:outline-none transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-[var(--sv-error)] mt-1">{errors.confirmPassword.message?.toString()}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base shadow-md" isLoading={mutation.isPending}>
              {t('Set new password')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
