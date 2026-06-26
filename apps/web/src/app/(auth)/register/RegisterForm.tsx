'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RegisterFormUI } from './RegisterFormUI';
import { useRegisterMutation } from '@/hooks/useAuthMutations';
import { UserRole } from '@lms/shared-types';

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
      await registerMutation.mutateAsync(apiData);
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setServerError(err.response?.data?.message || t('Registration failed. Please try again later.'));
    }
  };

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
