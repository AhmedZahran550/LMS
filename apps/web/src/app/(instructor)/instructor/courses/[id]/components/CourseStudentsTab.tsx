'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Check, X, Mail, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { enrollmentApis } from '@/lib/enrollmentApis';
import { EnrollmentStatus } from '@lms/shared-types';

export function CourseStudentsTab({ courseId, enrollments }: { courseId: string, enrollments: any[] }) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');

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

  const removeStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      await enrollmentApis.removeStudent(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] }),
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invite Students</CardTitle>
            <CardDescription>Send an email invitation to enroll a new student.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite by Email</label>
              <div className="flex space-x-2">
                <Input placeholder="learner@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <Button onClick={() => inviteMutation.mutate()} isLoading={inviteMutation.isPending}>
                  <Mail className="h-4 w-4 mr-2" /> Invite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Manage enrollment requests from learners.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments?.filter((e: any) => e.status === EnrollmentStatus.PENDING).length === 0 && (
                <p className="text-sm text-slate-500">No pending enrollment requests.</p>
              )}
              {enrollments?.filter((e: any) => e.status === EnrollmentStatus.PENDING).map((e: any) => (
                <div key={e.id} className="flex justify-between items-center p-3 border rounded-md bg-yellow-50/30">
                  <div className="text-sm">
                    <p className="font-medium">{e.learner?.firstName} {e.learner?.lastName}</p>
                    <p className="text-xs text-slate-500">{e.learner?.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.APPROVED })}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.REJECTED })}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>View and manage students currently enrolled in the course.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments?.filter((e: any) => e.status === EnrollmentStatus.APPROVED).length === 0 && (
                <p className="text-sm text-slate-500">No students enrolled yet.</p>
              )}
              <div className="flex flex-col space-y-3">
                {enrollments?.filter((e: any) => e.status === EnrollmentStatus.APPROVED).map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-slate-400 mr-3" />
                      <div className="text-sm">
                        <p className="font-medium">{e.learner?.firstName} {e.learner?.lastName}</p>
                        <p className="text-xs text-slate-500">{e.learner?.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this student from the course?')) {
                          removeStudentMutation.mutate(e.id);
                        }
                      }}
                      isLoading={removeStudentMutation.isPending && removeStudentMutation.variables === e.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
