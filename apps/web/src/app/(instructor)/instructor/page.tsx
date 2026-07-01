'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { subscriptionApis } from '@/lib/subscriptionApis';
import { Video, Users, BookOpen, HardDrive, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlanType } from '@lms/shared-types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { data: stats } = useQuery({
    queryKey: ['instructor-dashboard-stats'],
    queryFn: async () => {
      return await courseApis.getDashboardStats();
    },
  });

  const { data: usage } = useQuery({
    queryKey: ['instructor-subscription-usage'],
    queryFn: async () => {
      return await subscriptionApis.getMySubscription();
    },
  });

  const storagePercentage = usage && (usage.baseStorageBytes + usage.totalAddonStorageBytes) > 0 
    ? Math.min((usage.totalStorageBytes / (usage.baseStorageBytes + usage.totalAddonStorageBytes)) * 100, 100) 
    : 0;

  const nearestAddon = usage?.storageAddons?.length > 0 
    ? [...usage.storageAddons].sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0]
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-[var(--sv-on-surface)]">{t('Welcome, {{name}}', { name: user?.firstName })}</h2>
          <p className="text-lg text-[var(--sv-on-surface-variant)] mt-1">{t('Here is an overview of your teaching activity.')}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--sv-surface-container-low)] rounded-xl p-6 shadow-sm border border-[var(--sv-outline-variant)]/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[var(--sv-on-surface-variant)]">{t('Total Courses')}</h4>
            <div className="w-12 h-12 rounded-full bg-[var(--sv-primary-container)]/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-[var(--sv-primary)]" />
            </div>
          </div>
          <div className="text-4xl font-black text-[var(--sv-on-surface)]">{stats?.totalCourses || 0}</div>
        </div>
        
        <div className="bg-[var(--sv-surface-container-low)] rounded-xl p-6 shadow-sm border border-[var(--sv-outline-variant)]/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[var(--sv-on-surface-variant)]">{t('Total Videos')}</h4>
            <div className="w-12 h-12 rounded-full bg-[var(--sv-secondary-fixed)]/20 flex items-center justify-center">
              <Video className="h-6 w-6 text-[var(--sv-secondary)]" />
            </div>
          </div>
          <div className="text-4xl font-black text-[var(--sv-on-surface)]">{stats?.totalVideos || 0}</div>
        </div>

        <div className="bg-[var(--sv-surface-container-low)] rounded-xl p-6 shadow-sm border border-[var(--sv-outline-variant)]/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[var(--sv-on-surface-variant)]">{t('Total Students')}</h4>
            <div className="w-12 h-12 rounded-full bg-[var(--sv-accent-500)]/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-[var(--sv-accent-500)]" />
            </div>
          </div>
          <div className="text-4xl font-black text-[var(--sv-on-surface)]">{usage?.totalStudents || 0}</div>
          <p className="text-sm text-[var(--sv-on-surface-variant)] mt-2">
            {usage?.plan?.maxTotalStudents > 0 
              ? `${usage.totalStudents} / ${usage.plan.maxTotalStudents} ${t('allowed')}` 
              : t('Unlimited')}
          </p>
        </div>

        <div className="bg-[var(--sv-surface-container-low)] rounded-xl p-6 shadow-sm border border-[var(--sv-outline-variant)]/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[var(--sv-on-surface-variant)]">{t('Remaining Storage')}</h4>
            <div className="w-12 h-12 rounded-full bg-[var(--sv-primary-container)]/20 flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-[var(--sv-primary)]" />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--sv-on-surface)]">
            {formatBytes(Math.max(0, (usage?.baseStorageBytes || 0) + (usage?.totalAddonStorageBytes || 0) - (usage?.totalStorageBytes || 0)))}
          </div>
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-[var(--sv-surface-container-high)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${storagePercentage}%`,
                  backgroundColor: storagePercentage > 90 ? 'var(--sv-error)' : 'var(--sv-primary)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--sv-surface-container-low)] rounded-xl p-6 shadow-sm border border-[var(--sv-outline-variant)]/30 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[var(--sv-on-surface-variant)]">{t('Expirations')}</h4>
            <div className="w-12 h-12 rounded-full bg-[var(--sv-secondary-fixed)]/20 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-[var(--sv-secondary)]" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[var(--sv-on-surface)]">{t('Subscription')}</p>
              <p className="text-sm text-[var(--sv-on-surface-variant)]">
                {usage?.subscriptionEndDate 
                  ? new Date(usage.subscriptionEndDate).toLocaleDateString() 
                  : t('N/A')}
              </p>
            </div>
            {nearestAddon && (
              <div>
                <p className="text-sm font-medium text-[var(--sv-on-surface)]">{t('Next Add-on Expiry')}</p>
                <p className="text-sm text-[var(--sv-on-surface-variant)]">
                  {new Date(nearestAddon.endDate).toLocaleDateString()}
                  <span className="ml-2 text-xs font-bold text-[var(--sv-primary)]">
                    (+{formatBytes(parseInt(nearestAddon.additionalBytes, 10))})
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
