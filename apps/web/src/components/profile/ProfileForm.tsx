'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '@/hooks/useProfileMutations';
import { useSnackbar } from '@/components/ui/Snackbar';
import { ProfileFormUI } from './ProfileFormUI';
import { ImageCropperModal } from './ImageCropperModal';
import { ImageViewerModal } from './ImageViewerModal';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobileNumber: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: profile, isLoading } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  // Modal states
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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
      mobileNumber: '',
    },
  });

  // Reset form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        mobileNumber: profile.mobileNumber || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(
      {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        mobileNumber: data.mobileNumber?.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset(data);
          showSnackbar(t('Profile updated successfully!'), 'success');
        },
        onError: (err: any) => {
          showSnackbar(
            err.response?.data?.message || t('Failed to update profile'),
            'error'
          );
        },
      }
    );
  };

  // Triggered when file input picks a picture -> opens Cropper Modal
  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedRawFile(file);
      setIsCropperOpen(true);
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  // Triggered by Cropper Modal when user approves crop
  const handleCropComplete = (croppedFile: File) => {
    uploadAvatarMutation.mutate(croppedFile, {
      onSuccess: () => {
        setIsCropperOpen(false);
        setSelectedRawFile(null);
        showSnackbar(t('Avatar updated successfully!'), 'success');
      },
      onError: (err: any) => {
        showSnackbar(
          err.response?.data?.message || t('Failed to upload avatar'),
          'error'
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-indigo-600"></div>
        <p className="text-xs text-slate-400 font-medium">{t('Loading profile...')}</p>
      </div>
    );
  }

  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || t('User');

  return (
    <>
      <ProfileFormUI
        profile={profile}
        register={register}
        handleSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isDirty={isDirty}
        isUpdating={updateProfileMutation.isPending}
        isUploading={uploadAvatarMutation.isPending}
        onAvatarChange={handleAvatarFileSelected}
        onViewFullImage={() => setIsViewerOpen(true)}
      />

      {/* Image Cropper Modal */}
      <ImageCropperModal
        file={selectedRawFile}
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedRawFile(null);
        }}
        onCropComplete={handleCropComplete}
      />

      {/* High-Resolution Full Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={profile?.profileImageUrl}
        userName={fullName}
        userRole={profile?.role}
      />
    </>
  );
}
