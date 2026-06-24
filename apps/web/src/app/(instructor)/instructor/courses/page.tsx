'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CourseVisibility } from '@lms/shared-types';
import Link from 'next/link';

export default function InstructorCoursesPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      return await courseApis.getCourses();
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

  if (isLoading) return <div>Loading...</div>;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  course.visibility === CourseVisibility.PUBLIC 
                    ? 'bg-green-50 text-green-700 ring-green-600/20' 
                    : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                }`}>
                  {course.visibility}
                </span>
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
    </div>
  );
}
