'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { Video, Users, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { data: stats } = useQuery({
    queryKey: ['instructor-dashboard-stats'],
    queryFn: async () => {
      return await courseApis.getDashboardStats();
    },
  });

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
          <div className="text-4xl font-black text-[var(--sv-on-surface)]">{stats?.totalStudents || 0}</div>
        </div>
      </div>
    </div>
  );
}
