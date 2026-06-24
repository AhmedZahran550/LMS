'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Compass, Users, Search } from 'lucide-react';
import { CourseDto } from '@lms/shared-types';

export default function CourseCatalogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['public-courses', search],
    queryFn: async () => {
      return await courseApis.getCourses({ search: search || undefined });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await courseApis.enrollInCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      alert('Enrollment requested successfully! Waiting for instructor approval.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to request enrollment');
    }
  });

  const courses: CourseDto[] = coursesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Browse Courses</h1>
          <p className="text-slate-500 mt-1">Discover new skills and knowledge.</p>
        </div>
        <Compass className="h-8 w-8 text-slate-300" />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            className="pl-9" 
            placeholder="Search courses..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No public courses available right now.
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
                    <Users className="mr-2 h-4 w-4" />
                    Instructor: {course.instructor?.firstName} {course.instructor?.lastName}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => enrollMutation.mutate(course.id)}
                    isLoading={enrollMutation.isPending}
                  >
                    Request to Join
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
