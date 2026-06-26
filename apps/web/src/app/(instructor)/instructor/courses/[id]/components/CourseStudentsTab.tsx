'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/Table';
import { Users, Check, X, Mail, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApis } from '@/lib/courseApis';
import { enrollmentApis } from '@/lib/enrollmentApis';
import { EnrollmentStatus } from '@lms/shared-types';

export function CourseStudentsTab({ courseId, enrollments }: { courseId: string, enrollments: any[] }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Pagination state for students list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const approvedStudents = enrollments?.filter((e: any) => e.status === EnrollmentStatus.APPROVED) || [];
  const pendingRequests = enrollments?.filter((e: any) => e.status === EnrollmentStatus.PENDING) || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(approvedStudents.length / itemsPerPage);
  const paginatedStudents = approvedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Invite Students')}</CardTitle>
            <CardDescription>{t('Send an email invitation to enroll a new student.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Invite by Email')}</label>
              <div className="flex space-x-2">
                <Input placeholder="learner@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <Button onClick={() => inviteMutation.mutate()} isLoading={inviteMutation.isPending}>
                  <Mail className="h-4 w-4 mr-2" /> {t('Invite')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Pending Requests')}</CardTitle>
            <CardDescription>{t('Manage enrollment requests from learners.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">{t('No pending enrollment requests.')}</p>
              )}
              {pendingRequests.map((e: any) => (
                <div key={e.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-md bg-yellow-50/30 gap-3">
                  <div className="text-sm">
                    <p className="font-medium">{e.learner?.firstName} {e.learner?.lastName}</p>
                    <p className="text-xs text-slate-500">{e.learner?.email}</p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.APPROVED })}>
                      <Check className="h-4 w-4 mr-1" /> {t('Approve')}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.REJECTED })}>
                      <X className="h-4 w-4 mr-1" /> {t('Reject')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t('Enrolled Students')}</CardTitle>
            <CardDescription>{t('View and manage students currently enrolled in the course.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Student')}</TableHead>
                    <TableHead>{t('Enrolled Date')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                        {t('No students enrolled yet.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 shrink-0">
                              <Users className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{e.learner?.firstName} {e.learner?.lastName}</p>
                              <p className="text-xs text-slate-500">{e.learner?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                            onClick={() => {
                              if (confirm(t('Are you sure you want to remove this student from the course?'))) {
                                removeStudentMutation.mutate(e.id);
                              }
                            }}
                            isLoading={removeStudentMutation.isPending && removeStudentMutation.variables === e.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> {t('Remove')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
