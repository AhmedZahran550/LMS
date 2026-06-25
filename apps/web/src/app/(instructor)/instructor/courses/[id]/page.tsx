'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { courseApis } from '@/lib/courseApis';
import { CourseVisibility } from '@lms/shared-types';
import { Users, Settings, Video as VideoIcon } from 'lucide-react';
import { CourseContentTab } from './components/CourseContentTab';
import { CourseStudentsTab } from './components/CourseStudentsTab';
import { CourseSettingsTab } from './components/CourseSettingsTab';

type TabType = 'content' | 'students' | 'settings';

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('content');

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['instructor-course', courseId],
    queryFn: async () => {
      return await courseApis.getCourse(courseId);
    },
  });

  const { data: enrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      return await courseApis.getCourseEnrollments(courseId);
    },
  });

  if (courseLoading || enrollLoading) return <div>Loading...</div>;

  const course = courseData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
          <p className="text-slate-500 mt-1">{course.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${course.visibility === CourseVisibility.PUBLIC ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
            {course.visibility === CourseVisibility.PUBLIC ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button 
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          onClick={() => setActiveTab('content')}
        >
          <VideoIcon className="w-4 h-4 mr-2" />
          Course Content
        </button>
        <button 
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          onClick={() => setActiveTab('students')}
        >
          <Users className="w-4 h-4 mr-2" />
          Students & Enrollments
        </button>
        <button 
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'content' && <CourseContentTab courseId={courseId} />}
        {activeTab === 'students' && <CourseStudentsTab courseId={courseId} enrollments={enrollments || []} />}
        {activeTab === 'settings' && <CourseSettingsTab courseId={courseId} courseData={course} />}
      </div>
    </div>
  );
}
