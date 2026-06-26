'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RegisterFormUI } from './RegisterFormUI';
import { useRegisterMutation } from '@/hooks/useAuthMutations';
import { UserRole } from '@lms/shared-types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

function getRegisterSchema(t: (key: string) => string) {
  return z.object({
    firstName: z.string().min(1, t('First name is required')),
    lastName: z.string().min(1, t('Last name is required')),
    email: z.string().email(t('Invalid email address')),
    password: z
      .string()
      .min(8, t('Password must be at least 8 characters long'))
      .max(50, t('Password must be at most 50 characters long'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        t('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character')
      ),
    confirmPassword: z.string().min(1, t('Please confirm your password')),
    role: z.nativeEnum(UserRole),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("Passwords don't match"),
    path: ['confirmPassword'],
  });
}

type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>;

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const registerSchema = useMemo(() => getRegisterSchema(t), [t]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isSuccess) return;

    if (countdown <= 0) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.LEARNER,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const { confirmPassword, ...apiData } = data;
      const response = await registerMutation.mutateAsync(apiData);
      setSuccessMessage(response.message || t('Registration successful. Please check your email to verify your account.'));
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.response?.data?.message || t('Registration failed. Please try again later.'));
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">{t('Registration Successful')}</CardTitle>
          <CardDescription className="text-center">
            {successMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-slate-500">
            {t('Redirecting to login in')}{' '}
            <span className="font-semibold text-slate-700">{countdown}</span> {t('seconds...')}
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            {t('Sign in now')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <RegisterFormUI
      register={register}
      errors={errors}
      serverError={serverError}
      isLoading={registerMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
