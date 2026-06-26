'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface LoginFormUIProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  serverError: { message: string; code?: string } | null;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onResendVerification: () => void;
  isResending: boolean;
  resendSuccess: string | null;
  resendError: string | null;
}

export function LoginFormUI({
  register,
  errors,
  serverError,
  isLoading,
  onSubmit,
  onResendVerification,
  isResending,
  resendSuccess,
  resendError,
}: LoginFormUIProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col gap-6">
      {/* Logo/Icon Space */}
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg">
          <GraduationCap className="w-8 h-8" />
        </div>
      </div>

      {/* Header Text */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Sign in to your account')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('Enter your credentials to access your account.')}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {serverError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg space-y-2 border border-red-200 dark:border-red-500/20">
            <div>{serverError.message}</div>
            {serverError.code === 'VERIFY_EMAIL' && (
              <div>
                <button
                  type="button"
                  onClick={onResendVerification}
                  disabled={isResending}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline disabled:opacity-50"
                >
                  {isResending ? t('Loading...') : t('Send OTP')}
                </button>
              </div>
            )}
          </div>
        )}
        
        {resendSuccess && (
          <div className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
            {resendSuccess}
          </div>
        )}
        
        {resendError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
            {resendError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5" htmlFor="email">
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
            <Mail className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              {t('Password')}
            </label>
            <Link href="#" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-all">
              {t('Forgot password?')}
            </Link>
          </div>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="pe-10 ps-10"
            />
            <Lock className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message?.toString()}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800"
          />
          <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            {t('Remember me on this device')}
          </label>
        </div>

        <Button type="submit" className="w-full h-11 text-base shadow-md" isLoading={isLoading}>
          {t('Sign in')}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink px-4 text-xs font-medium text-slate-400 dark:text-slate-500">
            {t('Or continue with')}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <p className="text-sm text-center text-slate-500 dark:text-slate-400 pt-2">
          {t("Don't have an account?")}{' '}
          <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('Sign up')}
          </Link>
        </p>
      </form>
    </div>
  );
}
