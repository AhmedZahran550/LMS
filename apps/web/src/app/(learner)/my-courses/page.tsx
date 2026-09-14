'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/useAuthStore';
import coursesData from '@/data/courses.json';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  PlayCircle,
  Flame,
  Sparkles,
  Compass,
  GraduationCap,
  Star,
  Target,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { EnrollmentStatus } from '@lms/shared-types';

function getGreetingTime(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('Good morning');
  if (hour < 18) return t('Good afternoon');
  return t('Good evening');
}

export default function MyCoursesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const greeting = getGreetingTime(t);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      return await courseApis.getMyCourses();
    },
  });

  const recommendedCourses = React.useMemo(() => {
    return coursesData.slice(0, 4);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">{t('Loading your learning space...')}</p>
      </div>
    );
  }

  const activeEnrollmentsCount = enrollments?.filter((e: any) => e.status === EnrollmentStatus.APPROVED).length || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Humanized Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 end-0 w-80 h-80 bg-indigo-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 start-0 w-60 h-60 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t('Continuous Learning')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              {greeting}, {user?.firstName || t('Student')}! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
              {activeEnrollmentsCount > 0
                ? t('You are currently making progress in {{count}} courses. Keep your learning momentum going!', { count: activeEnrollmentsCount })
                : t('Every great achievement starts with the decision to try. Explore our courses and launch your learning path today.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Encouraging streak counter badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium">{t('Learning Streak')}</p>
                <p className="text-sm font-bold text-white">3 {t('Days in a row')} 🔥</p>
              </div>
            </div>

            <Link href="/courses">
              <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 gap-2 font-bold">
                <Compass className="w-4 h-4" />
                <span>{t('Browse Paths')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Enrolled Courses & Side Activity */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Active Enrollments */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>{t('My Enrolled Courses')}</span>
            </h2>
            {enrollments && enrollments.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {enrollments.length} {t('total')}
              </span>
            )}
          </div>

          {!enrollments || enrollments.length === 0 ? (
            /* Warm, empathetic empty state */
            <div className="text-center py-16 px-6 bg-[var(--sv-bg-card)] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t('Your learning journey starts here! 🌱')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
                {t("You haven't enrolled in any courses yet. Discover our certified learning paths, connect with expert instructors, and begin building new superpowers.")}
              </p>
              <Link href="/courses">
                <Button className="font-bold px-6 py-3 rounded-xl gap-2 shadow-md shadow-indigo-600/20">
                  <Compass className="w-4 h-4" />
                  <span>{t('Discover Courses Now')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          ) : (
            enrollments.map((enrollment: any) => {
              const course = enrollment.course;
              const isApproved = enrollment.status === EnrollmentStatus.APPROVED;
              const isPending = enrollment.status === EnrollmentStatus.PENDING;
              const isRejected = enrollment.status === EnrollmentStatus.REJECTED;

              return (
                <div
                  key={enrollment.id}
                  className="bg-[var(--sv-bg-card)] rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800/80 transition-all group"
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Status badge */}
                      <div className="mb-3">
                        {isApproved && (
                          <Badge variant="success" showDot pulseDot={false}>
                            {t('Active Learning')}
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="warning" showDot pulseDot={true}>
                            {t('Awaiting Instructor Approval')}
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" showDot>
                            {t('Access Denied')}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                      
                      {/* Instructor attribution */}
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                        <Avatar
                          src={course.instructor?.profileImageUrl}
                          firstName={course.instructor?.firstName}
                          lastName={course.instructor?.lastName}
                          size="xs"
                        />
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {course.instructor?.firstName} {course.instructor?.lastName}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {isApproved ? (
                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-indigo-600 dark:text-indigo-400">{t('Course Progress')}</span>
                          <span className="text-slate-700 dark:text-slate-300">0%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: '0%' }}></div>
                        </div>
                        <div className="pt-2">
                          <Link href={`/my-courses/${course.id}`}>
                            <Button className="w-full md:w-auto font-bold gap-2">
                              <PlayCircle className="w-4 h-4" />
                              <span>{t('Continue Learning')}</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <Button variant="outline" disabled className="w-full md:w-auto text-xs opacity-70">
                          {isPending ? t('Waiting for approval') : t('Access Denied')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Course visual card banner */}
                  <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden shrink-0 relative bg-slate-900">
                    <img
                      src={course.thumbnailUrl || '/images/courses/web-dev.jpg'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Motivation & Activity */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Weekly Goal Progress Card */}
          <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>{t('Weekly Study Goal')}</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                3/5 {t('hours')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              {t("You're 60% of the way to reaching this week's learning target! Keep going!")}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          {/* Quick Learning Tips & Highlights */}
          <div className="bg-[var(--sv-bg-card)] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{t('Recent Achievements')}</span>
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t('Joined Manara Academy')}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('Welcome aboard')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t('Started 3-day learning streak')}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('Today')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Courses Carousel / Grid (using real dummy courses) */}
        <div className="col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('Recommended Learning Paths')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('Curated by mentors based on market demands')}</p>
            </div>
            <Link href="/courses" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1">
              <span>{t('Browse all')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((c) => (
              <div
                key={c.id}
                className="bg-[var(--sv-bg-card)] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-900">
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 start-2.5 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                    {t(c.category)}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-1">
                    {c.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">${c.price}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{c.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
