'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, BookOpen, Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UserRole } from '@lms/shared-types';

interface RegisterFormUIProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  serverError: string | null;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function RegisterFormUI({ register, errors, serverError, isLoading, onSubmit }: RegisterFormUIProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full bg-[var(--sv-bg-card)]/95 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-200 rounded-2xl p-8 flex flex-col gap-6">
      <div className="text-center space-y-2 mb-2">
        <h1 className="text-2xl font-bold text-slate-900">{t('Create an account')}</h1>
        <p className="text-sm text-slate-500">{t('Join our platform as a Learner or Instructor.')}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {serverError && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
            {serverError}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="firstName">{t('First name')}</label>
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
            <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="lastName">{t('Last name')}</label>
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
          <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="email">{t('Email address')}</label>
          <div className="relative group">
            <span className="absolute inset-y-0 start-3 my-auto h-5 w-5 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
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
          <label className="text-sm font-medium text-slate-700 block mb-1.5">{t('I want to join as:')}</label>
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
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50 text-slate-500 peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600"
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
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50 text-slate-500 peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600"
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
            <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="password">{t('Password')}</label>
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
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
            <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="confirmPassword">{t('Confirm Password')}</label>
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 start-3 my-auto text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
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

        <div className="pt-2 text-center">
          <p className="text-sm text-slate-500">
            {t('Already have an account?')}{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              {t('Sign in')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
