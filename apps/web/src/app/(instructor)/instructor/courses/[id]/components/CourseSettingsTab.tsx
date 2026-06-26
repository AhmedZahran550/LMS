'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Edit } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { CourseVisibility } from '@lms/shared-types';

export function CourseSettingsTab({ courseId, courseData }: { courseId: string, courseData: any }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<CourseVisibility>(CourseVisibility.PRIVATE);

  useEffect(() => {
    if (courseData) {
      setEditTitle(courseData.title);
      setEditDesc(courseData.description);
      setEditVisibility(courseData.visibility);
    }
  }, [courseData]);

  const updateCourseMutation = useMutation({
    mutationFn: async () => {
      return await courseApis.updateCourse(courseId, { 
        title: editTitle,
        description: editDesc,
        visibility: editVisibility 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
      setIsEditingSettings(false);
      alert('Course settings updated successfully!');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('Course Settings')}</CardTitle>
          <CardDescription>{t('Update the title, description, and visibility of your course.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Course Title')}</label>
              <Input 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                placeholder={t('Course Title')}
                disabled={!isEditingSettings}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Course Description')}</label>
              <textarea 
                className={`w-full text-sm p-3 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] ${!isEditingSettings ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                placeholder={t('Course Description...')} 
                value={editDesc} 
                onChange={e => setEditDesc(e.target.value)}
                disabled={!isEditingSettings}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Visibility')}</label>
              <select 
                className={`w-full text-sm p-2.5 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingSettings ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value as CourseVisibility)}
                disabled={!isEditingSettings}
              >
                <option value={CourseVisibility.PRIVATE}>{t('Private (Only invited students)')}</option>
                <option value={CourseVisibility.PUBLIC}>{t('Public (Visible to all learners)')}</option>
              </select>
            </div>
            
            <div className="pt-4 flex space-x-3">
              {!isEditingSettings ? (
                <Button 
                  className="w-full md:w-auto"
                  onClick={() => setIsEditingSettings(true)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('Edit Course')}
                </Button>
              ) : (
                <>
                  <Button 
                    className="w-full md:w-auto"
                    onClick={() => updateCourseMutation.mutate()}
                    isLoading={updateCourseMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t('Save Changes')}
                  </Button>
                  <Button 
                    className="w-full md:w-auto"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingSettings(false);
                      if (courseData) {
                        setEditTitle(courseData.title);
                        setEditDesc(courseData.description);
                        setEditVisibility(courseData.visibility);
                      }
                    }}
                    disabled={updateCourseMutation.isPending}
                  >
                    {t('Cancel')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
