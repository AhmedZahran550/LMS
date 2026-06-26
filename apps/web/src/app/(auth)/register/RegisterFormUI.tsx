'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
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
    <Card>
      <CardHeader>
        <CardTitle>{t('Create an account')}</CardTitle>
        <CardDescription>{t('Join our platform as a Learner or Instructor.')}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {serverError && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{serverError}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="firstName">{t('First name')}</label>
              <Input
                id="firstName"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message?.toString()}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="lastName">{t('Last name')}</label>
              <Input
                id="lastName"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName.message?.toString()}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">{t('Email address')}</label>
            <Input
              id="email"
              type="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message?.toString()}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">{t('Password')}</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">{t('Confirm Password')}</label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('I want to join as:')}</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  value={UserRole.LEARNER}
                  {...register('role')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">{t('Student')}</span>
              </label>
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  value={UserRole.INSTRUCTOR}
                  {...register('role')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">{t('Instructor')}</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message?.toString()}</p>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('Create account')}
          </Button>
          <p className="text-sm text-center text-slate-500">
            {t('Already have an account?')}{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              {t('Sign in')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
