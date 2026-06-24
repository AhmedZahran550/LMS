'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { courseApis } from '@/lib/courseApis';
import { PlayCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      return await courseApis.getMyCourse(courseId);
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  if (!course) return <div>Course not found or access denied.</div>;

  const videos = course.videos || [];
  const currentVideo = activeVideo || videos[0];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Link href="/my-courses" className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Video Player Area */}
        <div className="flex-1 flex flex-col bg-black rounded-xl overflow-hidden shadow-sm">
          {currentVideo ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              <video 
                key={currentVideo.id} // force re-render on video change
                controls 
                className="w-full h-full object-contain"
                poster={course.thumbnailUrl}
              >
                <source src={currentVideo.url} type={currentVideo.mimeType} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              No videos available for this course yet.
            </div>
          )}
          
          {currentVideo && (
            <div className="p-6 bg-white flex-1 border-t border-slate-200 overflow-y-auto">
              <h2 className="text-xl font-semibold text-slate-900">{currentVideo.title}</h2>
              <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-wrap">{currentVideo.description || 'No description provided.'}</p>
            </div>
          )}
        </div>

        {/* Playlist Sidebar */}
        <div className="w-full lg:w-80 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Course Content</h3>
            <p className="text-xs text-slate-500 mt-1">{videos.length} videos</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {videos.map((video: any, index: number) => {
              const isActive = currentVideo?.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`w-full text-left p-3 flex gap-3 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    <PlayCircle className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {index + 1}. {video.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{(video.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
