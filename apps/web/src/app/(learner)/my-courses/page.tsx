'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { Button } from '@/components/ui/Button';
import { BookOpen, Clock, CheckCircle2, XCircle, Plus, User, ArrowRight, PlayCircle, HelpCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { EnrollmentStatus } from '@lms/shared-types';

export default function MyCoursesPage() {
  const { t } = useTranslation();
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      return await courseApis.getMyCourses();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <>
      {/* Welcome Section */}
      <section className="mb-6 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[var(--sv-on-surface)]">{t('My Learning')}</h2>
          <p className="text-base sm:text-lg text-[var(--sv-on-surface-variant)] mt-1">{t('Courses you are enrolled in or requested to join.')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses">
            <Button className="px-6 py-2 bg-[var(--sv-primary)] text-[var(--sv-on-primary)] rounded-lg font-medium hover:brightness-90 transition-all flex items-center gap-2 shadow-md">
              <Plus className="h-5 w-5" />
              {t('Browse Courses')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Enrolled Course (Large Card) or list of enrollments */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {(!enrollments || enrollments.length === 0) ? (
            <div className="text-center py-12 text-[var(--sv-on-surface-variant)] bg-[var(--sv-surface-container-lowest)] rounded-xl border border-[var(--sv-outline-variant)]/30">
              {t("You haven't requested to join any courses yet.")}
            </div>
          ) : (
            enrollments.map((enrollment: any) => {
              const course = enrollment.course;
              const isApproved = enrollment.status === EnrollmentStatus.APPROVED;
              const isPending = enrollment.status === EnrollmentStatus.PENDING;
              const isRejected = enrollment.status === EnrollmentStatus.REJECTED;

              return (
                <div key={enrollment.id} className="bg-[var(--sv-surface-container-lowest)] backdrop-blur-md rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-sm border border-[var(--sv-primary)]/10">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                        isApproved ? 'bg-[var(--sv-secondary-fixed)] text-[var(--sv-on-secondary-fixed)]' : 
                        isPending ? 'bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface-variant)]' : 'bg-[var(--sv-error-container)] text-[var(--sv-error)]'
                      }`}>
                        {isApproved && <CheckCircle2 className="h-4 w-4"/>}
                        {isPending && <Clock className="h-4 w-4"/>}
                        {isRejected && <XCircle className="h-4 w-4"/>}
                        {isApproved ? t('Approved') : isPending ? t('Pending') : t('Rejected')}
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--sv-on-surface)] mb-2">{course.title}</h3>
                      <p className="text-base text-[var(--sv-on-surface-variant)] line-clamp-2 mb-6">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--sv-on-surface-variant)] mb-8">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-[var(--sv-primary)]" />
                          <span>{t('Instructor:')} {course.instructor?.firstName} {course.instructor?.lastName}</span>
                        </div>
                      </div>
                    </div>

                    {isApproved ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-[var(--sv-primary)]">{t('Progress')}</span>
                          <span className="text-[var(--sv-on-surface)]">0%</span>
                        </div>
                        <div className="w-full bg-[var(--sv-surface-container-high)] h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[var(--sv-primary)] h-full rounded-full transition-all duration-1000" style={{width: '0%'}}></div>
                        </div>
                        <Link href={`/my-courses/${course.id}`} className="block">
                          <button className="w-full md:w-auto px-8 py-3 bg-[var(--sv-primary)] text-[var(--sv-on-primary)] rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--sv-primary)]/20">
                            {t('Continue Learning')}
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button className="w-full md:w-auto px-8 py-3 bg-[var(--sv-surface-container-highest)] text-[var(--sv-on-surface-variant)] rounded-lg font-bold cursor-not-allowed opacity-70">
                          {isPending ? t('Waiting for approval') : t('Access Denied')}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-64 h-48 md:h-auto rounded-lg overflow-hidden shrink-0 relative group bg-[var(--sv-surface-container-high)]">
                     <div className="absolute inset-0 bg-[var(--sv-primary)]/10 group-hover:bg-transparent transition-colors z-10 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-[var(--sv-primary)]/30 group-hover:scale-110 transition-transform duration-500" />
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Side Activity (Tonal Card) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[var(--sv-surface-container-low)] rounded-xl p-6 shadow-sm border border-[var(--sv-outline-variant)]/30 h-full">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-[var(--sv-on-surface)]">{t('Recent Activity')}</h4>
              <Clock className="h-5 w-5 text-[var(--sv-on-surface-variant)]" />
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--sv-primary-container)]/20 flex items-center justify-center shrink-0">
                  <PlayCircle className="h-5 w-5 text-[var(--sv-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--sv-on-surface)]">{t('Enrolled')}</p>
                  <p className="text-xs text-[var(--sv-on-surface-variant)]">{t('Just now')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--sv-tertiary-fixed)]/20 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-[var(--sv-tertiary)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--sv-on-surface)]">{t('Completed profile setup')}</p>
                  <p className="text-xs text-[var(--sv-on-surface-variant)]">{t('Welcome aboard')}</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 py-2 text-[var(--sv-primary)] font-bold text-sm hover:underline transition-all">
              {t('View Full History')}
            </button>
          </div>
        </div>

        {/* Course Discovery */}
        <div className="col-span-12 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[var(--sv-on-surface)]">{t('Recommended for You')}</h3>
            <Link href="/courses" className="text-[var(--sv-primary)] font-bold hover:underline flex items-center gap-1">
              {t('See all')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[var(--sv-surface-container-lowest)] rounded-xl overflow-hidden border border-[var(--sv-outline-variant)]/30 shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="h-40 relative overflow-hidden bg-[var(--sv-surface-container-high)] flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[var(--sv-on-surface-variant)]/30 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 ltr:right-2 rtl:left-2 px-3 py-1 bg-[var(--sv-surface-container-lowest)]/90 backdrop-blur-md text-[var(--sv-primary)] font-bold text-xs rounded-full">
                    {t('New')}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-sm font-bold text-[var(--sv-on-surface)] group-hover:text-[var(--sv-primary)] transition-colors line-clamp-1 mb-1">
                    {t('Coming Soon: Course ' + i)}
                  </h4>
                  <p className="text-xs text-[var(--sv-on-surface-variant)] mb-4 flex-1">
                    {t('Stay tuned for amazing new educational content.')}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[var(--sv-primary)] font-bold text-sm">{t('Free')}</span>
                    <div className="flex items-center text-xs text-[var(--sv-on-surface-variant)]">
                      <Star className="h-3 w-3 text-[var(--sv-tertiary)] me-1 fill-current" />
                      5.0
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
