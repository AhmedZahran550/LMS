'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Edit } from 'lucide-react';
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

  const updateCourseSchema = React.useMemo(() => getUpdateCourseSchema(t), [t]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseFormData>({
    resolver: zodResolver(updateCourseSchema),
  });

  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    if (courseData) {
      reset({
        title: courseData.title,
        description: courseData.description,
        visibility: courseData.visibility,
      });
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
      alert(t('Course settings updated successfully!'));
    }
  });

  const onSubmit = (data: UpdateCourseFormData) => {
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
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Course Title')}</label>
              <Input 
                {...register('title')}
                placeholder={t('Course Title')}
                disabled={!isEditingSettings}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message?.toString()}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Course Description')}</label>
              <textarea 
                {...register('description')}
                className={`w-full text-sm p-3 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] ${!isEditingSettings ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                placeholder={t('Course Description...')} 
                disabled={!isEditingSettings}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message?.toString()}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Visibility')}</label>
              <select 
                {...register('visibility')}
                className={`w-full text-sm p-2.5 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingSettings ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                disabled={!isEditingSettings}
              >
                <option value={CourseVisibility.PRIVATE}>{t('Private (Only invited students)')}</option>
                <option value={CourseVisibility.PUBLIC}>{t('Public (Visible to all learners)')}</option>
              </select>
              {errors.visibility && <p className="text-xs text-red-500 mt-1">{errors.visibility.message?.toString()}</p>}
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
                      if (courseData) {
                        reset({
                          title: courseData.title,
                          description: courseData.description,
                          visibility: courseData.visibility,
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
