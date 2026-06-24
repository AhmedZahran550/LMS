'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { courseApis } from '@/lib/courseApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { EnrollmentStatus } from '@lms/shared-types';

export default function MyCoursesPage() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      return await courseApis.getMyCourses();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Learning</h1>
          <p className="text-slate-500 mt-1">Courses you are enrolled in or requested to join.</p>
        </div>
        <BookOpen className="h-8 w-8 text-slate-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!enrollments || enrollments.length === 0) ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            You haven't requested to join any courses yet.
          </div>
        ) : (
          enrollments.map((enrollment: any) => {
            const course = enrollment.course;
            const isApproved = enrollment.status === EnrollmentStatus.APPROVED;
            const isPending = enrollment.status === EnrollmentStatus.PENDING;
            const isRejected = enrollment.status === EnrollmentStatus.REJECTED;

            return (
              <Card key={enrollment.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    {isApproved && <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle2 className="mr-1 h-3 w-3"/> Approved</span>}
                    {isPending && <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><Clock className="mr-1 h-3 w-3"/> Pending</span>}
                    {isRejected && <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="mr-1 h-3 w-3"/> Rejected</span>}
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-xs text-slate-500">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p>
                </CardContent>
                <CardFooter>
                  {isApproved ? (
                    <Link href={`/my-courses/${course.id}`} className="w-full">
                      <Button className="w-full">Continue Learning</Button>
                    </Link>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      {isPending ? 'Waiting for approval' : 'Access Denied'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
