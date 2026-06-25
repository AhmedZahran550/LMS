'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, X, PlayCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';

export function CourseContentTab({ courseId, videos }: { courseId: string, videos: any[] }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const uploadVideoMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('description', videoDesc);
      formData.append('file', selectedFile);
      
      return await courseApis.uploadVideo(courseId, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] });
      setVideoTitle('');
      setVideoDesc('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
          <CardDescription>Add new content to your course.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
          <Input type="file" accept="video/*" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
          <textarea 
            className="w-full text-sm p-3 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Video Description..." 
            rows={4} 
            value={videoDesc} 
            onChange={e => setVideoDesc(e.target.value)}
          />
          <Button 
            onClick={() => uploadVideoMutation.mutate()} 
            disabled={!selectedFile || !videoTitle}
            isLoading={uploadVideoMutation.isPending}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Video
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>Manage uploaded videos.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeVideo && (
            <div className="mb-6 bg-black rounded-lg overflow-hidden aspect-video relative flex items-center justify-center">
              <video 
                key={activeVideo.id} 
                controls 
                className="w-full h-full object-contain"
              >
                <source src={activeVideo.url} type={activeVideo.mimeType} />
                Your browser does not support the video tag.
              </video>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 hover:text-white rounded-full h-8 w-8"
                onClick={() => setActiveVideo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {videos.length === 0 ? (
              <p className="text-sm text-slate-500">No videos uploaded yet.</p>
            ) : (
              videos.map((vid: any, i: number) => (
                <div key={vid.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{i + 1}. {vid.title}</span>
                    <span className="text-xs text-slate-500">{(vid.size / (1024*1024)).toFixed(2)} MB</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveVideo(vid)}
                    className={activeVideo?.id === vid.id ? 'bg-slate-100' : ''}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" /> Play
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
