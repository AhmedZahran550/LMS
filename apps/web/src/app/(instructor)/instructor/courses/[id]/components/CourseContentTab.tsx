'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/Table';
import { Upload, X, PlayCircle, FileText, Image as ImageIcon, Presentation, Trash2, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { ContentType } from '@lms/shared-types';

export function CourseContentTab({ courseId, contents }: { courseId: string, contents: any[] }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentDesc, setContentDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeContent, setActiveContent] = useState<any>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('title', contentTitle);
      formData.append('description', contentDesc);
      formData.append('file', selectedFile);
      
      return await courseApis.uploadContent(courseId, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
      setContentTitle('');
      setContentDesc('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await courseApis.deleteContent(courseId, contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
      if (activeContent) setActiveContent(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  });

  const renderContentIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.VIDEO: return <PlayCircle className="h-4 w-4 mr-2" />;
      case ContentType.PDF: return <FileText className="h-4 w-4 mr-2" />;
      case ContentType.IMAGE: return <ImageIcon className="h-4 w-4 mr-2" />;
      case ContentType.PRESENTATION: return <Presentation className="h-4 w-4 mr-2" />;
      default: return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  const renderActiveContent = () => {
    if (!activeContent) return null;

    return (
      <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-50 flex items-center justify-center p-4">
        {activeContent.contentType === ContentType.VIDEO ? (
          <video key={activeContent.id} controls className="w-full max-h-[400px] object-contain bg-black rounded-md">
            <source src={activeContent.url} type={activeContent.mimeType} />
            Your browser does not support the video tag.
          </video>
        ) : activeContent.contentType === ContentType.IMAGE ? (
          <img src={activeContent.url} alt={activeContent.title} className="max-h-[400px] object-contain rounded-md shadow-sm" />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {renderContentIcon(activeContent.contentType)}
            <p className="mt-4 font-medium">{activeContent.title}</p>
            <p className="text-sm text-slate-500 mt-2 mb-4">Preview not available inline for this file type.</p>
            <a href={activeContent.url} target="_blank" rel="noopener noreferrer">
              <Button>Download / View File</Button>
            </a>
          </div>
        )}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-sm"
          onClick={() => setActiveContent(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Upload Content</CardTitle>
            <CardDescription>Add videos, PDFs, images, or presentations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input placeholder="e.g. Introduction Lecture" value={contentTitle} onChange={e => setContentTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">File</label>
              <Input 
                type="file" 
                accept="video/*,application/pdf,image/*,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                ref={fileInputRef} 
                onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
              />
              <p className="text-xs text-slate-500 mt-1">Supported: Video, PDF, Image, PPTX</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea 
                className="w-full text-sm p-3 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Content description..." 
                rows={3} 
                value={contentDesc} 
                onChange={e => setContentDesc(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => uploadMutation.mutate()} 
              disabled={!selectedFile || !contentTitle}
              isLoading={uploadMutation.isPending}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Content
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>Manage and organize uploaded files.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderActiveContent()}

            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No content uploaded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contents.map((content: any, i: number) => (
                      <TableRow key={content.id} className={activeContent?.id === content.id ? 'bg-slate-50' : ''}>
                        <TableCell className="font-medium text-slate-500">{i + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{content.title}</div>
                          {content.description && <div className="text-xs text-slate-500 line-clamp-1">{content.description}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={content.contentType as any} className="capitalize">
                            {content.contentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {(content.size / (1024*1024)).toFixed(2)} MB
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setActiveContent(content)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this content?')) {
                                  deleteMutation.mutate(content.id);
                                }
                              }}
                              isLoading={deleteMutation.isPending && deleteMutation.variables === content.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
