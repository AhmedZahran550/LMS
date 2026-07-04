'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { courseApis } from '@/lib/courseApis';
import { CourseVisibility } from '@lms/shared-types';
import { Users, Settings, Video as VideoIcon, ChevronDown } from 'lucide-react';
import { CourseContentTab } from './components/CourseContentTab';
import { CourseStudentsTab } from './components/CourseStudentsTab';
import { CourseSettingsTab } from './components/CourseSettingsTab';

type TabType = 'content' | 'students' | 'settings';

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<TabType>('content');

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['instructor-course', courseId],
    queryFn: async () => {
      return await courseApis.getCourse(courseId);
    },
  });

  const { data: enrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      return await courseApis.getCourseEnrollments(courseId);
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async (visibility: CourseVisibility) => {
      return await courseApis.updateCourse(courseId, { visibility });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to update visibility'));
    },
  });

  if (courseLoading || enrollLoading) return <div>{t('Loading...')}</div>;

  const course = courseData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-[var(--sv-border)] pb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--sv-text-primary)] truncate">{course.title}</h1>
          <p className="text-[var(--sv-text-secondary)] mt-1 line-clamp-1">{course.description}</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0 ms-4">
          <div className="relative">
            <select
              value={course.visibility}
              onChange={(e) => updateVisibilityMutation.mutate(e.target.value as CourseVisibility)}
              disabled={updateVisibilityMutation.isPending}
              className={`appearance-none rounded-full ps-2.5 pe-7 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer transition-colors ${
                course.visibility === CourseVisibility.PUBLIC 
                  ? 'bg-[var(--sv-success-100)] text-[var(--sv-success-800)] ring-[var(--sv-success)]/30 hover:bg-[var(--sv-success-50)]' 
                  : 'bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface-variant)] ring-[var(--sv-outline)]/20 hover:bg-[var(--sv-surface-container)]'
              }`}
            >
              <option value={CourseVisibility.PUBLIC}>{t('Public')}</option>
              <option value={CourseVisibility.PRIVATE}>{t('Private')}</option>
            </select>
            <ChevronDown className={`absolute end-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none ${
              course.visibility === CourseVisibility.PUBLIC ? 'text-[var(--sv-success-600)]' : 'text-[var(--sv-text-muted)]'
            }`} />
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[var(--sv-border)] mb-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
        <button 
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'content' ? 'border-[var(--sv-primary)] text-[var(--sv-primary)]' : 'border-transparent text-[var(--sv-text-muted)] hover:text-[var(--sv-text-primary)] hover:border-[var(--sv-border)]'}`}
          onClick={() => setActiveTab('content')}
        >
          <VideoIcon className="w-4 h-4 me-2" />
          {t('Course Content')}
        </button>
        <button 
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'students' ? 'border-[var(--sv-primary)] text-[var(--sv-primary)]' : 'border-transparent text-[var(--sv-text-muted)] hover:text-[var(--sv-text-primary)] hover:border-[var(--sv-border)]'}`}
          onClick={() => setActiveTab('students')}
        >
          <Users className="w-4 h-4 me-2" />
          {t('Students & Enrollments')}
        </button>
        <button 
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings' ? 'border-[var(--sv-primary)] text-[var(--sv-primary)]' : 'border-transparent text-[var(--sv-text-muted)] hover:text-[var(--sv-text-primary)] hover:border-[var(--sv-border)]'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-4 h-4 me-2" />
          {t('Settings')}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'content' && <CourseContentTab courseId={courseId} />}
        {activeTab === 'students' && <CourseStudentsTab courseId={courseId} enrollments={enrollments || []} />}
        {activeTab === 'settings' && <CourseSettingsTab courseId={courseId} courseData={course} />}
      </div>
    </div>
  );
}
