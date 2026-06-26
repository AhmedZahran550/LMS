'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { courseApis } from '@/lib/courseApis';
import { instructorApis } from '@/lib/instructorApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Compass, Users, Search, GraduationCap } from 'lucide-react';
import { CourseDto, EnrollmentStatus } from '@lms/shared-types';
import { useSnackbar } from '@/components/ui/Snackbar';
import Link from 'next/link';

export default function CourseCatalogPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'instructors'>('courses');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);
  
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['public-courses', search, currentPage],
    queryFn: async () => {
      const params: any = { page: currentPage, limit };
      if (search) params.search = search;
      return await courseApis.getCourses(params);
    },
    enabled: activeTab === 'courses'
  });

  const { data: instructorsData, isLoading: isInstructorsLoading } = useQuery({
    queryKey: ['instructors', search, currentPage],
    queryFn: async () => {
      const params: any = { page: currentPage, limit };
      if (search) params.search = search;
      return await instructorApis.getInstructors(params);
    },
    enabled: activeTab === 'instructors'
  });

  const { showSnackbar } = useSnackbar();

  const { data: myEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      return await courseApis.getMyCourses();
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await courseApis.enrollInCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      showSnackbar(t('Enrollment requested successfully! Waiting for instructor approval.'), 'success');
    },
    onError: (err: any) => {
      showSnackbar(err.response?.data?.message || t('Failed to request enrollment'), 'error');
    }
  });

  const pendingCourseIds = new Set(
    (myEnrollments || [])
      .filter((e: any) => e.status === EnrollmentStatus.PENDING)
      .map((e: any) => e.courseId)
  );

  const courses: CourseDto[] = coursesData?.data || [];
  const coursesMeta = coursesData?.meta;
  
  const instructors: any[] = instructorsData?.data || [];
  const instructorsMeta = instructorsData?.meta;
  
  const isLoading = activeTab === 'courses' ? isCoursesLoading : isInstructorsLoading;
  const currentMeta = activeTab === 'courses' ? coursesMeta : instructorsMeta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('Browse Courses')}</h1>
          <p className="text-slate-500 mt-1">{t('Discover new skills and knowledge.')}</p>
        </div>
        <Compass className="h-8 w-8 text-slate-300" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            className="ps-9" 
            placeholder={activeTab === 'courses' ? t('Search courses...') : t('Search instructors...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'courses' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('Courses')}
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'instructors' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('Instructors')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : activeTab === 'courses' ? (
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t('No public courses available right now.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                  {course.thumbnailUrl && (
                    <div className="h-40 w-full bg-slate-100 rounded-t-lg overflow-hidden">
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="me-2 h-4 w-4" />
                      {t('Instructor: {{name}}', { name: `${course.instructor?.firstName} ${course.instructor?.lastName}` })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {pendingCourseIds.has(course.id) ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled
                      >
                        {t('Waiting for instructor accept')}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => enrollMutation.mutate(course.id)}
                        isLoading={enrollMutation.isPending}
                      >
                        {t('Request to Join')}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {instructors.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t('No instructors found.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor) => (
                <Card key={instructor.id} className="flex flex-col text-center">
                  <CardHeader className="items-center pb-4">
                    <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 overflow-hidden">
                      {instructor.profileImageUrl ? (
                        <img src={instructor.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <GraduationCap className="h-10 w-10" />
                      )}
                    </div>
                    <CardTitle>{instructor.firstName} {instructor.lastName}</CardTitle>
                    <CardDescription>{instructor.email}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-4 border-t border-slate-100">
                    <Link href={`/instructors/${instructor.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        {t('View Profile & Courses')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!isLoading && currentMeta && currentMeta.totalPages > 1 && (
        <Pagination
          currentPage={currentMeta.currentPage}
          totalPages={currentMeta.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
