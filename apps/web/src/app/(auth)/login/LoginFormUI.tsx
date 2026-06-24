import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface LoginFormUIProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  serverError: string | null;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded space-y-2">
              <div>{serverError}</div>
              {serverError === 'Please verify your email before logging in' && (
                <div>
                  <button
                    type="button"
                    onClick={onResendVerification}
                    disabled={isResending}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline disabled:opacity-50"
                  >
                    {isResending ? 'Resending...' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          )}
          {resendSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
              {resendSuccess}
            </div>
          )}
          {resendError && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
              {resendError}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email address</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message?.toString()}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message?.toString()}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
          <p className="text-sm text-center text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register now
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
