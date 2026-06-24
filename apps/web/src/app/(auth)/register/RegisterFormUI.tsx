import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { UserRole } from '@lms/shared-types';

interface RegisterFormUIProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  serverError: string | null;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function RegisterFormUI({ register, errors, watch, setValue, serverError, isLoading, onSubmit }: RegisterFormUIProps) {
  const role = watch('role');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Join our platform as a Learner or Instructor.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {serverError && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{serverError}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="firstName">First name</label>
              <Input
                id="firstName"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message?.toString()}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
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
            <label className="text-sm font-medium" htmlFor="email">Email address</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">I want to join as:</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value={UserRole.LEARNER}
                  checked={role === UserRole.LEARNER}
                  onChange={() => setValue('role', UserRole.LEARNER, { shouldValidate: true })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">Student</span>
              </label>
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value={UserRole.INSTRUCTOR}
                  checked={role === UserRole.INSTRUCTOR}
                  onChange={() => setValue('role', UserRole.INSTRUCTOR, { shouldValidate: true })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">Instructor</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message?.toString()}</p>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
          <p className="text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
