'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation } from '@/hooks/useProfileMutations';
import { ProfileFormUI } from './ProfileFormUI';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: profile, isLoading } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // Reset form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        alert('Profile updated successfully!');
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || 'Failed to update profile');
      },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file, {
        onSuccess: () => {
          alert('Avatar uploaded successfully!');
        },
        onError: (err: any) => {
          alert(err.response?.data?.message || 'Failed to upload avatar');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProfileFormUI
      profile={profile}
      register={register}
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      isDirty={isDirty}
      isUpdating={updateProfileMutation.isPending}
      isUploading={uploadAvatarMutation.isPending}
      onAvatarChange={handleAvatarChange}
    />
  );
}
