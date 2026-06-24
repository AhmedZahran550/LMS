'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { courseApis } from '@/lib/courseApis';
import { enrollmentApis } from '@/lib/enrollmentApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CourseVisibility, EnrollmentStatus } from '@lms/shared-types';
import { Upload, Users, Check, X, Mail } from 'lucide-react';

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

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

  const updateCourseMutation = useMutation({
    mutationFn: async (visibility: CourseVisibility) => {
      return await courseApis.updateCourse(courseId, { visibility });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] })
  });

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

  const respondEnrollmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: EnrollmentStatus }) => {
      await enrollmentApis.respondEnrollment(id, status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] })
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      await courseApis.inviteInstructor(courseId, inviteEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] });
      setInviteEmail('');
      alert('Invitation sent successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to invite user');
    }
  });

  if (courseLoading || enrollLoading) return <div>Loading...</div>;

  const course = courseData;
  const videos = course?.videos || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
          <p className="text-slate-500 mt-1">{course.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600">Visibility:</span>
          <select 
            className="border-slate-300 rounded-md text-sm"
            value={course.visibility}
            onChange={(e) => updateCourseMutation.mutate(e.target.value as CourseVisibility)}
          >
            <option value={CourseVisibility.PRIVATE}>Private</option>
            <option value={CourseVisibility.PUBLIC}>Public</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>Upload and manage videos for this course.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-sm font-semibold">Upload New Video</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
                  <Input type="file" accept="video/*" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <textarea 
                  className="w-full text-sm p-2 border rounded border-slate-300" 
                  placeholder="Video Description..." 
                  rows={2} 
                  value={videoDesc} 
                  onChange={e => setVideoDesc(e.target.value)}
                />
                <Button 
                  onClick={() => uploadVideoMutation.mutate()} 
                  disabled={!selectedFile || !videoTitle}
                  isLoading={uploadVideoMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>

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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Students & Enrollments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invite by Email</label>
                <div className="flex space-x-2">
                  <Input placeholder="learner@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <Button onClick={() => inviteMutation.mutate()} isLoading={inviteMutation.isPending}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold border-b pb-2">Pending Requests</h3>
                {enrollments?.filter((e: any) => e.status === EnrollmentStatus.PENDING).map((e: any) => (
                  <div key={e.id} className="flex justify-between items-center p-2 border rounded-md bg-yellow-50/30">
                    <div className="text-sm">
                      <p className="font-medium">{e.learner?.firstName} {e.learner?.lastName}</p>
                      <p className="text-xs text-slate-500">{e.learner?.email}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.APPROVED })}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.REJECTED })}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold border-b pb-2">Enrolled Students</h3>
                {enrollments?.filter((e: any) => e.status === EnrollmentStatus.APPROVED).map((e: any) => (
                  <div key={e.id} className="flex items-center p-2 border rounded-md">
                    <Users className="h-4 w-4 text-slate-400 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium">{e.learner?.firstName} {e.learner?.lastName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
