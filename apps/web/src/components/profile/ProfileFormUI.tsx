'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Camera, Mail, Shield, Sparkles, Eye, Phone, CheckCircle2 } from 'lucide-react';
import { ProfileFormValues } from './ProfileForm';

interface ProfileFormUIProps {
  profile: any;
  register: UseFormRegister<ProfileFormValues>;
  handleSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ProfileFormValues>;
  isDirty: boolean;
  isUpdating: boolean;
  isUploading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewFullImage: () => void;
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
  onViewFullImage,
}: ProfileFormUIProps) {
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasCustomAvatar = Boolean(profile?.profileImageUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            {t('My Profile')} <Sparkles className="h-6 w-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('Manage your personal account details, contact information, and avatar.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Avatar Management Card */}
        <Card className="md:col-span-1 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col items-center p-6 text-center bg-white dark:bg-slate-900/90 rounded-3xl transition-colors">
          <CardHeader className="w-full pb-3 text-center">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              {t('Profile Picture')}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              {t('JPG, PNG, or WebP up to 5MB')}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center w-full py-4 space-y-6">
            {/* Avatar with Dual Hover Controls */}
            <div className="relative group">
              <Avatar
                src={profile?.profileImageUrl}
                firstName={profile?.firstName}
                lastName={profile?.lastName}
                size="xl"
                className="h-28 w-28 text-3xl shadow-md ring-4 ring-slate-100 dark:ring-slate-800 group-hover:scale-[1.02] transition-transform"
              />

              {/* Hover Quick Actions Overlay */}
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {hasCustomAvatar && (
                  <button
                    type="button"
                    onClick={onViewFullImage}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title={t('View Full Picture')}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg"
                  title={t('Change Photo')}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Uploading Spinner */}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onAvatarChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex flex-col w-full gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-xs gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{t('Change Photo')}</span>
              </Button>

              {hasCustomAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs gap-1.5"
                  onClick={onViewFullImage}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t('View Full Image')}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Account Info Form Card */}
        <Card className="md:col-span-2 shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 rounded-3xl overflow-hidden transition-colors">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 px-6 py-5">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('Account Information')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t('Update your personal and contact details below.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 p-6 flex-1">
              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('First Name')}
                  </label>
                  <Input
                    {...register('firstName')}
                    placeholder={t('John')}
                    className={`bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                      errors.firstName ? 'border-red-400 focus:ring-red-500/20' : ''
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-xs font-medium text-red-500 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('Last Name')}
                  </label>
                  <Input
                    {...register('lastName')}
                    placeholder={t('Doe')}
                    className={`bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                      errors.lastName ? 'border-red-400 focus:ring-red-500/20' : ''
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-xs font-medium text-red-500 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('Mobile Number')}
                </label>
                <div className="relative">
                  <Input
                    {...register('mobileNumber')}
                    placeholder="+201012345678"
                    className="bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ps-10"
                  />
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {t('Optional. Used for account recovery and notifications.')}
                </p>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('Email Address')}
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <Shield className="h-3 w-3 text-slate-400" /> {t('Read-Only')}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={profile?.email || ''}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 ps-10 cursor-not-allowed select-all"
                  />
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {t('For security reasons, your email address cannot be changed.')}
                </p>
              </div>

              {/* Role Display */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('Account Role')}
                </label>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {profile?.role}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-slate-100 dark:border-slate-800/80 py-4 px-6 flex justify-end gap-3 bg-slate-50/70 dark:bg-slate-900/60">
              <Button
                type="submit"
                disabled={!isDirty || isUpdating}
                isLoading={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-md hover:shadow-indigo-600/20 font-semibold px-6 transition-all"
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
