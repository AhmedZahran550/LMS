'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RegisterFormUI } from './RegisterFormUI';
import { useRegisterMutation } from '@/hooks/useAuthMutations';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@lms/shared-types';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(50, 'Password must be at most 50 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    ),
  role: z.nativeEnum(UserRole),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const registerMutation = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      const response = await registerMutation.mutateAsync(data);
      const { user, accessToken, refreshToken } = response;
      
      setAuth(user, accessToken, refreshToken);
      
      if (user.role === UserRole.INSTRUCTOR) {
        router.push('/instructor');
      } else {
        router.push('/courses');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again later.');
    }
  };

  return (
    <RegisterFormUI
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
      serverError={serverError}
      isLoading={registerMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
