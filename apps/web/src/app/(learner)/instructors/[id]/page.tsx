'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { courseApis } from '@/lib/courseApis';
import { instructorApis } from '@/lib/instructorApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Users, ChevronLeft, Mail } from 'lucide-react';
import { CourseDto, EnrollmentStatus } from '@lms/shared-types';
import { useSnackbar } from '@/components/ui/Snackbar';
import Link from 'next/link';

export default function InstructorProfilePage() {
  const { id } = useParams() as { id: string };
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: instructorData, isLoading: isInstructorLoading } = useQuery({
    queryKey: ['instructor', id],
    queryFn: async () => {
      return await instructorApis.getInstructor(id);
    },
  });

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['instructor-courses', id],
    queryFn: async () => {
      return await courseApis.getCourses({ 'filter.instructorId': `$eq:${id}` });
    },
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

  if (isInstructorLoading || isCoursesLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const instructor = instructorData;
  const courses: CourseDto[] = coursesData?.data || [];

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-900">{t('Instructor not found')}</h2>
        <Button className="mt-4" onClick={() => router.push('/courses')}>{t('Back to Catalog')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ChevronLeft className="me-1 h-4 w-4" />
          {t('Back to Catalog')}
        </Link>
        
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar
            src={instructor.profileImageUrl}
            firstName={instructor.firstName}
            lastName={instructor.lastName}
            size="xl"
            className="ring-4 ring-indigo-50 shrink-0"
          />
          <div className="text-center md:text-left pt-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {instructor.firstName} {instructor.lastName}
            </h1>
            <div className="flex items-center justify-center md:justify-start text-slate-500 mt-2 space-x-2">
              <Mail className="h-4 w-4" />
              <span>{instructor.email}</span>
            </div>
            <div className="mt-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
              {t('Instructor Profile')}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">{t('Courses by this Instructor')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              {t("This instructor hasn't published any public courses yet.")}
            </div>
          ) : (
            courses.map((course) => (
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
                    {t('Instructor: {{name}}', { name: `${instructor.firstName} ${instructor.lastName}` })}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
