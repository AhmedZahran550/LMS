'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForgotPasswordMutation } from '@/hooks/useAuthMutations';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const mutation = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const schema = z.object({
    email: z.string().min(1, t('Email is required')).email(t('Invalid email address')),
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await mutation.mutateAsync(data.email);
      setSubmittedEmail(data.email);
      setSent(true);
    } catch {}
  };

  const handleResend = async () => {
    const email = getValues('email');
    if (!email) return;
    try {
      await mutation.mutateAsync(email);
    } catch {}
  };

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--sv-bg-card)] rounded-2xl shadow-xl border border-[var(--sv-border)] p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--sv-text-primary)]">
                  {t('Forgot your password?')}
                </h1>
                <p className="text-sm text-[var(--sv-text-secondary)] mt-2">
                  {t("Enter your email address and we'll send you a link to reset your password.")}
                </p>
              </div>

              {mutation.isError && (
                <div className="flex items-center gap-2 text-sm text-[var(--sv-error)] bg-[var(--sv-error-50)] p-3 rounded-lg border border-[var(--sv-error)]/20 mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{(mutation.error as any)?.response?.data?.message || t('Something went wrong')}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="email">
                    {t('Email address')}
                  </label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('you@example.com')}
                      {...register('email')}
                      className="pe-10"
                    />
                    <Mail className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-[var(--sv-text-muted)] group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-[var(--sv-error)] mt-1">{errors.email.message?.toString()}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 text-base shadow-md" isLoading={mutation.isPending}>
                  {t('Send reset link')}
                </Button>
              </form>

              <p className="text-sm text-center text-[var(--sv-text-secondary)] mt-6">
                <Link href="/login" className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium">
                  <ArrowLeft className="h-4 w-4" />
                  {t('Back to login')}
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--sv-text-primary)]">
                  {t('Check your email')}
                </h1>
                <p className="text-sm text-[var(--sv-text-secondary)] mt-2">
                  {t("We've sent a password reset link to")}
                </p>
                <p className="text-sm font-semibold text-[var(--sv-text-primary)] mt-1">{submittedEmail}</p>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs text-[var(--sv-text-muted)]">
                  {t("Didn't receive the email?")}{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={mutation.isPending}
                    className="text-indigo-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin inline" />
                    ) : (
                      t('Send again')
                    )}
                  </button>
                </p>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('Back to login')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
