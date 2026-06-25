'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { courseApis } from '@/lib/courseApis';
import { PlayCircle, ChevronLeft, Search, FileText, Image as ImageIcon, Presentation } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { ContentPlayerModal } from '@/components/ui/ContentPlayerModal';
import { ContentType } from '@lms/shared-types';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeContent, setActiveContent] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      return await courseApis.getMyCourse(courseId);
    },
  });

  const { data: paginatedContent, isLoading: contentLoading } = useQuery({
    queryKey: ['learner-course-contents', courseId, page, searchQuery, filterType],
    queryFn: async () => {
      const queryOptions: any = { page, limit: 12 };
      if (searchQuery) queryOptions.search = searchQuery;
      if (filterType) queryOptions['filter.contentType'] = `$eq:${filterType}`;
      return await courseApis.getLearnerCourseContents(courseId, queryOptions);
    },
  });

  if (courseLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  if (!course) return <div>Course not found or access denied.</div>;

  const contents = paginatedContent?.data || [];
  const meta = paginatedContent?.meta;

  const contentTypes = [
    { value: '', label: 'All Types' },
    { value: ContentType.VIDEO, label: 'Video' },
    { value: ContentType.PDF, label: 'PDF' },
    { value: ContentType.IMAGE, label: 'Image' },
    { value: ContentType.PRESENTATION, label: 'Presentation' },
  ];

  const renderContentIcon = (type: ContentType, className: string = "h-5 w-5") => {
    switch (type) {
      case ContentType.VIDEO: return <PlayCircle className={className} />;
      case ContentType.PDF: return <FileText className={className} />;
      case ContentType.IMAGE: return <ImageIcon className={className} />;
      case ContentType.PRESENTATION: return <Presentation className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/my-courses" className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{course.title}</h1>
          <p className="text-slate-500 mt-1">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Course Content</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  placeholder="Search content..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-0">
          {contentLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-lg text-slate-500 mb-2">No content available.</p>
              <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contents.map((content: any, index: number) => (
                <button
                  key={content.id}
                  onClick={() => setActiveContent(content)}
                  className="w-full text-left p-6 flex gap-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-shrink-0 mt-1 h-12 w-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                    {renderContentIcon(content.contentType, "h-6 w-6")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {((page - 1) * (meta?.itemsPerPage || 12)) + index + 1}. {content.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded capitalize">
                        {content.contentType}
                      </span>
                    </div>
                    {content.description && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {content.description}
                      </p>
                    )}
                    <div className="text-xs text-slate-400 mt-3 font-medium">
                      {(content.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-6 border-t border-slate-200">
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ContentPlayerModal 
        content={activeContent} 
        onClose={() => setActiveContent(null)} 
      />
    </div>
  );
}
