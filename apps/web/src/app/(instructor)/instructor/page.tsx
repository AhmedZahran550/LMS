'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { subscriptionApis } from '@/lib/subscriptionApis';
import { Video, Users, BookOpen, HardDrive, Calendar, Plus, UserPlus, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function formatBytes(bytes: number, t: any): string {
  if (bytes === 0) return `0 ${t('B')}`;
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${t(sizes[i])}`;
}

function getGreetingTime(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('Good morning');
  if (hour < 18) return t('Good afternoon');
  return t('Good evening');
}

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const greeting = getGreetingTime(t);

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

  const totalCapacityBytes = (usage?.baseStorageBytes || 0) + (usage?.totalAddonStorageBytes || 0);
  const remainingBytes = Math.max(0, totalCapacityBytes - (usage?.totalStorageBytes || 0));
  const storagePercentage = totalCapacityBytes > 0 
    ? Math.min(((usage?.totalStorageBytes || 0) / totalCapacityBytes) * 100, 100) 
    : 0;

  const nearestAddon = usage?.storageAddons?.length > 0 
    ? [...usage.storageAddons].sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0]
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Mentor Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 end-0 w-80 h-80 bg-indigo-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 start-0 w-60 h-60 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t('Instructor Command Center')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              {greeting}, {user?.firstName ? `${user.firstName}` : t('Professor')}! 👨‍🏫
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              {t('Your dedication shapes the leaders of tomorrow. Here is the overview of your courses, active students, and teaching impact today.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/instructor/courses">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold gap-2">
                <Plus className="w-4 h-4" />
                <span>{t('Create New Course')}</span>
              </Button>
            </Link>
            <Link href="/instructor/students">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold gap-2">
                <UserPlus className="w-4 h-4" />
                <span>{t('Invite Student')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Courses */}
        <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800/80 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Active Courses')}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats?.totalCourses || 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Published & managed by you')}
          </p>
        </div>
        
        {/* Total Students */}
        <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800/80 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Students Empowered')}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {usage?.totalStudents || 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {usage?.plan?.maxTotalStudents > 0 
              ? t('{{current}} / {{max}} allowed on current plan', { current: usage.totalStudents, max: usage.plan.maxTotalStudents })
              : t('Unlimited students capacity')}
          </p>
        </div>

        {/* Total Videos */}
        <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800/80 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Video Lessons')}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Video className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats?.totalVideos || 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Total lecture content uploaded')}
          </p>
        </div>

        {/* Remaining Storage */}
        <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800/80 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Cloud Storage')}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {formatBytes(remainingBytes, t)} {t('free')}
          </div>
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${storagePercentage}%`,
                  backgroundColor: storagePercentage > 85 ? '#ef4444' : '#4f46e5'
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
              <span>{storagePercentage.toFixed(0)}% {t('used')}</span>
              <Link href="/instructor/subscription" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                {t('Expand')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Subscription & Quick Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('Teaching Workspace Shortcuts')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('Quick access to your core teaching tools')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/instructor/courses"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {t('Manage Courses & Content')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Upload videos, handouts, and syllabus')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all rtl:rotate-180" />
            </Link>

            <Link
              href="/instructor/students"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                  {t('Student Roster & Requests')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Review enrollment requests & assign')}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Subscription & Expiration Status */}
        <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('Plan & Validity')}</h3>
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{t('Current Plan')}</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {usage?.plan?.type || t('Pro')}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {usage?.subscriptionEndDate 
                  ? t('Valid until {{date}}', { date: new Date(usage.subscriptionEndDate).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }) })
                  : t('Active Subscription')}
              </p>
            </div>

            {nearestAddon && (
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('Next Storage Add-on renewal: {{date}} (+{{bytes}})', {
                  date: new Date(nearestAddon.endDate).toLocaleDateString(i18n.language),
                  bytes: formatBytes(parseInt(nearestAddon.additionalBytes, 10), t)
                })}
              </p>
            )}
          </div>

          <Link href="/instructor/subscription" className="mt-6 block">
            <Button variant="outline" className="w-full text-xs font-bold">
              {t('Manage Subscription & Limits')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
