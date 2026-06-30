'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, BookOpen, Brain, ArrowLeft, ArrowRight, GraduationCap, Users, Globe, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserRole } from '@lms/shared-types';
import { SocialLoginWithPopup } from '@/components/auth/SocialLoginWithPopup';

interface RegisterFormUIProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  serverError: { message: string; code?: string } | null;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
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

export function RegisterFormUI({ register, errors, serverError, isLoading, onSubmit }: RegisterFormUIProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full lg:max-w-5xl mx-auto bg-[var(--sv-bg-card)]/95 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-col relative bg-gradient-to-br from-[#3e32d3] via-[#2115b0] to-[#0a0045] p-8 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -end-20 w-72 h-72 bg-[#818cf8]/20 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-20 -start-20 w-72 h-72 bg-[#22d3ee]/20 blur-[80px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-8">
            <GraduationCap className="w-7 h-7" />
            <span className="text-lg font-bold">{t('app.name')}</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold leading-tight mb-2">{t('Create an account')}</h2>
            <p className="text-[#c3c0ff] text-sm leading-relaxed">
              {t('Join our platform as a Learner or Instructor.')}
            </p>
          </div>

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
          <h1 className="text-2xl font-bold text-[var(--sv-text-primary)]">{t('Create an account')}</h1>
          <p className="text-sm text-[var(--sv-text-secondary)] mt-1">{t('Fill in your details to get started.')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {serverError && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
              <div>{serverError.message}</div>
              {serverError.code === 'EMAIL_EXISTS' && (
                <div className="mt-1">
                  <Link href="/login" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline">
                    {t('Sign in instead')}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="firstName">{t('First name')}</label>
              <Input
                id="firstName"
                placeholder={t('Enter your name')}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName.message?.toString()}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="lastName">{t('Last name')}</label>
              <Input
                id="lastName"
                placeholder={t('Enter your surname')}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName.message?.toString()}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="email">{t('Email address')}</label>
            <div className="relative group">
              <span className="absolute inset-y-0 start-3 my-auto h-5 w-5 flex items-center text-[var(--sv-text-muted)] group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                {...register('email')}
                className="ps-10"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sv-text-primary)] block">{t('I want to join as:')}</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  id="role-student"
                  type="radio"
                  value={UserRole.LEARNER}
                  {...register('role')}
                  className="peer hidden"
                />
                <label
                  htmlFor="role-student"
                  className="flex flex-col items-center justify-center p-4 border border-[var(--sv-border)] rounded-xl cursor-pointer transition-all text-[var(--sv-text-muted)] peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600 hover:bg-[var(--sv-surface-container-high)]"
                >
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">{t('Student')}</span>
                </label>
              </div>
              <div className="flex-1">
                <input
                  id="role-instructor"
                  type="radio"
                  value={UserRole.INSTRUCTOR}
                  {...register('role')}
                  className="peer hidden"
                />
                <label
                  htmlFor="role-instructor"
                  className="flex flex-col items-center justify-center p-4 border border-[var(--sv-border)] rounded-xl cursor-pointer transition-all text-[var(--sv-text-muted)] peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600 hover:bg-[var(--sv-surface-container-high)]"
                >
                  <Brain className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">{t('Instructor')}</span>
                </label>
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="password">{t('Password')}</label>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 start-3 my-auto text-[var(--sv-text-muted)] hover:text-[var(--sv-text-secondary)] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="ps-10"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sv-text-primary)] block" htmlFor="confirmPassword">{t('Confirm Password')}</label>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 start-3 my-auto text-[var(--sv-text-muted)] hover:text-[var(--sv-text-secondary)] focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="ps-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message?.toString()}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base shadow-md flex items-center justify-center gap-2" isLoading={isLoading}>
            {t('Create account')}
            <ArrowLeft className="w-5 h-5 hidden rtl:block" />
            <ArrowRight className="w-5 h-5 hidden ltr:block" />
          </Button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[var(--sv-border)]"></div>
            <span className="flex-shrink px-4 text-xs font-medium text-[var(--sv-text-muted)]">
              {t('Or continue with')}
            </span>
            <div className="flex-grow border-t border-[var(--sv-border)]"></div>
          </div>

          <SocialLoginWithPopup />

          <p className="text-sm text-center text-[var(--sv-text-secondary)] pt-1">
            {t('Already have an account?')}{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              {t('Sign in')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
