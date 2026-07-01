'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { courseApis } from '@/lib/courseApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { CourseVisibility } from '@lms/shared-types';
import Link from 'next/link';
import { Search, ChevronDown, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubscriptionGuard } from '@/components/subscription/useSubscriptionGuard';

function getCreateCourseSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(3, t('Title must be at least 3 characters')),
    description: z.string().min(10, t('Description must be at least 10 characters')),
    visibility: z.nativeEnum(CourseVisibility),
  });
}
type CreateCourseFormData = z.infer<ReturnType<typeof getCreateCourseSchema>>;

export default function InstructorCoursesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { updateSubscription } = useAuthStore();
  const { checkCanCreateCourse } = useSubscriptionGuard();
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  const createCourseSchema = React.useMemo(() => getCreateCourseSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { visibility: CourseVisibility.PUBLIC },
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['instructor-courses', search, visibilityFilter, currentPage],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit,
      };
      if (search) params.search = search;
      if (visibilityFilter !== 'ALL') params['filter.visibility'] = `$eq:${visibilityFilter}`;
      return await courseApis.getCourses(params);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCourseFormData) => {
      const { allowed, reason } = checkCanCreateCourse();
      if (!allowed) throw new Error(reason || 'Subscription limit reached');
      return await courseApis.createCourse({
        title: data.title,
        description: data.description,
        visibility: data.visibility,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      setIsCreating(false);
      reset();
    },
    onError: (err: any) => {
      alert(err.message || err.response?.data?.message || t('Failed to create course'));
    }
  });

  const onSubmit = (data: CreateCourseFormData) => {
    createMutation.mutate(data);
  };

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ courseId, visibility }: { courseId: string; visibility: CourseVisibility }) => {
      setUpdatingCourseId(courseId);
      return await courseApis.updateCourse(courseId, { visibility });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to update visibility'));
    },
    onSettled: () => {
      setUpdatingCourseId(null);
    }
  });

  const courses = coursesData?.data || [];
  const meta = coursesData?.meta;

  // Reset pagination when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, visibilityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--sv-text-primary)]">{t('Manage Courses')}</h1>
          <p className="text-[var(--sv-text-secondary)] mt-1">{t('Create and manage your educational content.')}</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? t('Cancel') : t('Create New Course')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-3 h-4 w-4 text-[var(--sv-text-muted)]" />
          <Input 
            className="ps-9" 
            placeholder={t('Search your courses...')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
          >
            <option value="ALL">{t('All Visibility')}</option>
            <option value={CourseVisibility.PUBLIC}>{t('Public')}</option>
            <option value={CourseVisibility.PRIVATE}>{t('Private')}</option>
          </Select>
        </div>
      </div>

      {isCreating && (
        <Card className="border-[var(--sv-primary-200)] bg-[var(--sv-primary-50)]/50">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{t('Create a new course')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('Course Title')}</label>
                <Input {...register('title')} placeholder={t('e.g. Advanced TypeScript')} />
                {errors.title && <p className="text-xs text-[var(--sv-error)] mt-1">{errors.title.message?.toString()}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('Description')}</label>
                <textarea 
                  {...register('description')}
                  className="flex w-full rounded-md border border-[var(--sv-border-input)] bg-transparent px-3 py-2 text-sm text-[var(--sv-text-primary)] placeholder:text-[var(--sv-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sv-ring-focus)] focus:border-transparent" 
                  rows={3}
                />
                {errors.description && <p className="text-xs text-[var(--sv-error)] mt-1">{errors.description.message?.toString()}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('Visibility')}</label>
                <Select {...register('visibility')}>
                  <option value={CourseVisibility.PUBLIC}>{t('Public')}</option>
                  <option value={CourseVisibility.PRIVATE}>{t('Private')}</option>
                </Select>
                <p className="text-xs text-[var(--sv-text-muted)] mt-1">{t('Public courses appear in search results. Private courses require an invitation link.')}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" isLoading={createMutation.isPending}>{t('Save Course')}</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sv-primary)]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-[var(--sv-bg-card)] rounded-lg border border-[var(--sv-border)]">
              <p className="text-[var(--sv-text-secondary)]">{t('No courses found.')}</p>
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
                          className={`appearance-none rounded-full ps-2 pe-6 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer transition-colors ${
                            course.visibility === CourseVisibility.PUBLIC 
                              ? 'bg-[var(--sv-success-100)] text-[var(--sv-success-800)] ring-[var(--sv-success-600)]/30 hover:bg-[var(--sv-success-50)]' 
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
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-6">
                    <Link href={`/instructor/courses/${course.id}`} className="w-full">
                      <Button variant="outline" className="w-full">{t('Manage Content')}</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
