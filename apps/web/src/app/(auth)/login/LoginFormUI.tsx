'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, GraduationCap, BookOpen, Users, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SocialLoginWithPopup } from '@/components/auth/SocialLoginWithPopup';
import { UserRole } from '@lms/shared-types';

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
  resetSuccess?: string | null;
}

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
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
  resetSuccess,
}: LoginFormUIProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full lg:max-w-5xl mx-auto bg-[var(--sv-bg-card)]/95 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-col relative bg-gradient-to-br from-[#3e32d3] via-[#2115b0] to-[#0a0045] p-8 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -end-20 w-72 h-72 bg-[#818cf8]/20 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-20 -start-20 w-72 h-72 bg-[#22d3ee]/20 blur-[80px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-8">
            <GraduationCap className="w-7 h-7" />
            <span className="text-lg font-bold">{t('app.name')}</span>
          </div>

          {/* Welcome */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold leading-tight mb-2">{t('Welcome back')}</h2>
            <p className="text-[#c3c0ff] text-sm leading-relaxed">
              {t('Sign in to continue your learning journey and track your progress.')}
            </p>
          </div>

          {/* Social provider badges */}
          <div className="flex items-center gap-3 mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center ring-2 ring-[#5b57d9]">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center ring-2 ring-[#5b57d9]">
                <FacebookIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-[#e2dfff] font-medium">
              {t('Sign in with Google or Facebook')}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-auto">
            {[
              { icon: BookOpen, text: t('Interactive Courses') },
              { icon: Users, text: t('Expert Instructors') },
              { icon: Globe, text: t('Learn Anywhere') },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#a5b4fc] shrink-0" />
                <span className="text-sm text-[#e2dfff]">{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-xs text-[#c3c0ff]">
              {t('Join over')} <span className="font-bold text-white">10,000+</span> {t('active learners')}
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="p-8 flex flex-col justify-center">
        <div className="flex justify-center mb-4 lg:hidden">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center lg:text-start mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('Sign in to your account')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('Enter your credentials to access your account.')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {resetSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {serverError && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg space-y-2 border border-red-200">
              <div>{serverError.message}</div>
              {serverError.code === 'VERIFY_EMAIL' && (
                <div>
                  <button
                    type="button"
                    onClick={onResendVerification}
                    disabled={isResending}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline disabled:opacity-50"
                  >
                    {isResending ? t('Loading...') : t('Send OTP')}
                  </button>
                </div>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              {resendSuccess}
            </div>
          )}

          {resendError && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
              {resendError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block" htmlFor="email">
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
              <Mail className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                {t('Password')}
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:underline transition-all">
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
              <Lock className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
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
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-transparent"
            />
            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
              {t('Remember me on this device')}
            </label>
          </div>

          <Button type="submit" className="w-full h-11 text-base shadow-md" isLoading={isLoading}>
            {t('Sign in')}
          </Button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink px-4 text-xs font-medium text-slate-400">
              {t('Or continue with')}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <SocialLoginWithPopup role={UserRole.INSTRUCTOR} />

          <p className="text-sm text-center text-slate-500 pt-1">
            {t("Don't have an account?")}{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              {t('Sign up')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
