'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Camera, Mail, Shield, Sparkles } from 'lucide-react';

interface ProfileFormUIProps {
  profile: any;
  register: UseFormRegister<{ firstName: string; lastName: string }>;
  handleSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<{ firstName: string; lastName: string }>;
  isDirty: boolean;
  isUpdating: boolean;
  isUploading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileFormUI({
  profile,
  register,
  handleSubmit,
  errors,
  isDirty,
  isUpdating,
  isUploading,
  onAvatarChange,
}: ProfileFormUIProps) {
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            {t('My Profile')} <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
          </h1>
          <p className="text-slate-500 mt-1">{t('Manage your account information and avatar.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar Management Card */}
        <Card className="md:col-span-1 shadow-sm border-slate-100 flex flex-col items-center p-6 text-center bg-white rounded-2xl">
          <CardHeader className="w-full pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">{t('Profile Picture')}</CardTitle>
            <CardDescription className="text-xs text-slate-400">{t('JPG, PNG, or GIF up to 5MB')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center w-full py-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                src={profile?.profileImageUrl}
                firstName={profile?.firstName}
                lastName={profile?.lastName}
                size="xl"
                className="shadow-md border-4 border-slate-50 group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-8 w-8 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={onAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <Button
              variant="outline"
              size="sm"
              className="mt-6 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {t('Change Photo')}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Account Info Form Card */}
        <Card className="md:col-span-2 shadow-sm border-slate-100 bg-white rounded-2xl">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xl font-bold text-slate-800">{t('Account Information')}</CardTitle>
              <CardDescription>{t('Update your personal details below.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">{t('First Name')}</label>
                  <Input
                    {...register('firstName')}
                    placeholder={t('John')}
                    className={errors.firstName ? 'border-red-300 focus:ring-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-xs font-medium text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">{t('Last Name')}</label>
                  <Input
                    {...register('lastName')}
                    placeholder={t('Doe')}
                    className={errors.lastName ? 'border-red-300 focus:ring-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-xs font-medium text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-600">{t('Email Address')}</label>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    <Shield className="h-3 w-3 text-slate-400" /> {t('Read-Only')}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={profile?.email || ''}
                    disabled
                    className="bg-slate-50 border-slate-200 text-slate-500 ps-10 cursor-not-allowed select-all"
                  />
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">{t('For security reasons, your email address cannot be changed.')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 font-medium">{t('Role')}</label>
                <div className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                  {profile?.role}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-slate-50 py-4 px-6 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <Button
                type="submit"
                disabled={!isDirty || isUpdating}
                isLoading={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                {t('Save Changes')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
