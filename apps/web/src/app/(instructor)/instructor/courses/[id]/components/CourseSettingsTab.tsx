'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Save, Edit, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { courseApis } from '@/lib/courseApis';
import { CourseVisibility } from '@lms/shared-types';

function getUpdateCourseSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(3, t('Title must be at least 3 characters')),
    description: z.string().min(10, t('Description must be at least 10 characters')),
    visibility: z.nativeEnum(CourseVisibility),
  });
}
type UpdateCourseFormData = z.infer<ReturnType<typeof getUpdateCourseSchema>>;

export function CourseSettingsTab({ courseId, courseData }: { courseId: string, courseData: any }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const updateCourseSchema = React.useMemo(() => getUpdateCourseSchema(t), [t]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseFormData>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: '',
      description: '',
      visibility: CourseVisibility.PRIVATE,
    },
  });

  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    if (courseData) {
      reset({
        title: courseData.title || '',
        description: courseData.description || '',
        visibility: courseData.visibility || CourseVisibility.PRIVATE,
      });
      setServerError(null);
    }
  }, [courseData, reset]);

  const updateCourseMutation = useMutation({
    mutationFn: async (data: UpdateCourseFormData) => {
      return await courseApis.updateCourse(courseId, { 
        title: data.title,
        description: data.description,
        visibility: data.visibility 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
      setIsEditingSettings(false);
      setServerError(null);
      alert(t('Course settings updated successfully!'));
    },
    onError: (err: any) => {
      setServerError(err.response?.data?.message || t('Failed to update course settings'));
    }
  });

  const onSubmit = (data: UpdateCourseFormData) => {
    setServerError(null);
    updateCourseMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('Course Settings')}</CardTitle>
          <CardDescription>{t('Update the title, description, and visibility of your course.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
            {serverError && (
              <div className="flex items-center gap-2 text-sm text-[var(--sv-error)] bg-[var(--sv-error-50)] p-3 rounded-lg border border-[var(--sv-error)]/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--sv-text-primary)]">{t('Course Title')}</label>
              <Input 
                {...register('title')}
                placeholder={t('Course Title')}
                disabled={!isEditingSettings}
              />
              {errors.title && <p className="text-xs text-[var(--sv-error)] mt-1">{errors.title.message?.toString()}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--sv-text-primary)]">{t('Course Description')}</label>
              <textarea 
                {...register('description')}
                className={`w-full text-sm p-3 border rounded-md border-[var(--sv-border-input)] bg-[var(--sv-bg-input)] text-[var(--sv-text-primary)] placeholder:text-[var(--sv-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sv-ring-focus)] min-h-[100px] ${!isEditingSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder={t('Course Description...')} 
                disabled={!isEditingSettings}
              />
              {errors.description && <p className="text-xs text-[var(--sv-error)] mt-1">{errors.description.message?.toString()}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--sv-text-primary)]">{t('Visibility')}</label>
              <Select 
                {...register('visibility')}
                disabled={!isEditingSettings}
              >
                <option value={CourseVisibility.PRIVATE}>{t('Private (Only invited students)')}</option>
                <option value={CourseVisibility.PUBLIC}>{t('Public (Visible to all learners)')}</option>
              </Select>
              {errors.visibility && <p className="text-xs text-[var(--sv-error)] mt-1">{errors.visibility.message?.toString()}</p>}
            </div>
            
            <div className="pt-4 flex space-x-3">
              {!isEditingSettings ? (
                <Button 
                  type="button"
                  className="w-full md:w-auto"
                  onClick={() => setIsEditingSettings(true)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 me-2" />
                  {t('Edit Course')}
                </Button>
              ) : (
                <>
                  <Button 
                    type="submit"
                    className="w-full md:w-auto"
                    isLoading={updateCourseMutation.isPending}
                  >
                    <Save className="h-4 w-4 me-2" />
                    {t('Save Changes')}
                  </Button>
                  <Button 
                    type="button"
                    className="w-full md:w-auto"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingSettings(false);
                      setServerError(null);
                      if (courseData) {
                        reset({
                          title: courseData.title || '',
                          description: courseData.description || '',
                          visibility: courseData.visibility || CourseVisibility.PRIVATE,
                        });
                      }
                    }}
                    disabled={updateCourseMutation.isPending}
                  >
                    {t('Cancel')}
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
