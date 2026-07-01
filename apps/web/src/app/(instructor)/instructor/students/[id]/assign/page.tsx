'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApis } from '@/lib/instructorApis';
import { courseApis } from '@/lib/courseApis';
import Link from 'next/link';

export default function AssignCoursesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = params.id as string;

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const { data: coursesData } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: () => courseApis.getCourses({ limit: 100 }),
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ['student-assignments', studentId],
    queryFn: () => instructorApis.getAssignments(studentId),
  });

  const assignMutation = useMutation({
    mutationFn: (courseIds: string[]) => instructorApis.assignCourses(studentId, courseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-assignments', studentId] });
      router.push('/instructor/students');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to assign courses'));
    },
  });

  const courses = coursesData?.data || [];
  const assignedIds: string[] = assignmentsData?.courseIds || [];

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleAssignAll = () => {
    setSelectedCourseIds(courses.map((c: any) => c.id));
  };

  const handleClear = () => {
    setSelectedCourseIds([]);
  };

  const handleSave = () => {
    assignMutation.mutate(selectedCourseIds);
  };

  const handleRemoveAll = () => {
    if (confirm(t('Remove all course assignments for this student?'))) {
      assignMutation.mutate([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instructor/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 me-2" /> {t('Back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t('Assign Courses')}</h1>
          <p className="text-sm text-on-surface-variant">{t('Select courses to assign to this student.')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('Your Courses')}</CardTitle>
              <CardDescription>
                {t('Currently assigned:')} {assignedIds.length} | {t('Selected:')} {selectedCourseIds.length}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAssignAll}>
                {t('Select All')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                {t('Clear')}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRemoveAll}>
                {t('Remove All')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('No courses yet. Create a course first.')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course: any) => {
                const isAssigned = assignedIds.includes(course.id);
                const isSelected = selectedCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary-container/20'
                        : isAssigned
                          ? 'border-success-500/50 bg-success-50/20'
                          : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-outline-variant'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-on-primary" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-on-surface">{course.title}</p>
                      <p className="text-sm text-on-surface-variant truncate">
                        {course.description || t('No description')}
                      </p>
                    </div>
                    {isAssigned && !isSelected && (
                      <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                        {t('Assigned')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Link href="/instructor/students">
              <Button variant="outline">{t('Cancel')}</Button>
            </Link>
            <Button
              onClick={handleSave}
              isLoading={assignMutation.isPending}
              disabled={selectedCourseIds.length === 0 && assignedIds.length === 0}
            >
              {t('Save Assignments')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
