'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CourseVisibility } from '@lms/shared-types';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';

export default function InstructorCoursesPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['instructor-courses', search, visibilityFilter],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (visibilityFilter !== 'ALL') params['filter.visibility'] = `$eq:${visibilityFilter}`;
      return await courseApis.getCourses(params);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await courseApis.createCourse({
        title: newTitle,
        description: newDesc,
        visibility: CourseVisibility.PRIVATE, // default
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      setIsCreating(false);
      setNewTitle('');
      setNewDesc('');
    }
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ courseId, visibility }: { courseId: string; visibility: CourseVisibility }) => {
      setUpdatingCourseId(courseId);
      return await courseApis.updateCourse(courseId, { visibility });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update visibility');
    },
    onSettled: () => {
      setUpdatingCourseId(null);
    }
  });

  const courses = coursesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Courses</h1>
          <p className="text-slate-500 mt-1">Create and manage your educational content.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'Create New Course'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            className="pl-9" 
            placeholder="Search your courses..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border-slate-300 rounded-md text-sm sm:w-48"
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
        >
          <option value="ALL">All Visibility</option>
          <option value={CourseVisibility.PUBLIC}>Public</option>
          <option value={CourseVisibility.PRIVATE}>Private</option>
        </select>
      </div>

      {isCreating && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader>
            <CardTitle>Create a new course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course Title</label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Advanced TypeScript" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                rows={3}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Save Course</Button>
          </CardFooter>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="relative">
                    <select
                      value={course.visibility}
                      onChange={(e) => updateVisibilityMutation.mutate({ 
                        courseId: course.id, 
                        visibility: e.target.value as CourseVisibility 
                      })}
                      disabled={updatingCourseId === course.id}
                      className={`appearance-none rounded-full pl-2 pr-6 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer transition-colors ${
                        course.visibility === CourseVisibility.PUBLIC 
                          ? 'bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-100' 
                          : 'bg-slate-50 text-slate-600 ring-slate-500/10 hover:bg-slate-100'
                      }`}
                    >
                      <option value={CourseVisibility.PUBLIC}>Public</option>
                      <option value={CourseVisibility.PRIVATE}>Private</option>
                    </select>
                    <ChevronDown className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none ${
                      course.visibility === CourseVisibility.PUBLIC ? 'text-green-600' : 'text-slate-500'
                    }`} />
                  </div>
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-6">
                <Link href={`/instructor/courses/${course.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Manage Content</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
