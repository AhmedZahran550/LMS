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
import { useAuthStore } from '@/store/useAuthStore';

export function CourseStudentsTab({ courseId, enrollments }: { courseId: string, enrollments: any[] }) {
  const { t } = useTranslation();
  const { updateSubscription } = useAuthStore();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Pagination state for students list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const respondEnrollmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: EnrollmentStatus }) => {
      return enrollmentApis.respondEnrollment(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] });
      if (variables.status === EnrollmentStatus.APPROVED) {
        const current = useAuthStore.getState().user?.subscription?.totalStudents || 0;
        updateSubscription({ totalStudents: current + 1 });
      }
    },
    onError: (err: any) => {
      alert(err.message || err.response?.data?.message || t('Failed to respond to enrollment'));
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      return courseApis.inviteInstructor(courseId, inviteEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] });
      const current = useAuthStore.getState().user?.subscription?.totalStudents || 0;
      updateSubscription({ totalStudents: current + 1 });
      setInviteEmail('');
      alert(t('Invitation sent successfully!'));
    },
    onError: (err: any) => {
      alert(err.message || err.response?.data?.message || t('Failed to invite user'));
    }
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      await enrollmentApis.removeStudent(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] }),
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to remove student'));
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
                <Input placeholder={t('learner@example.com')} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <Button onClick={() => inviteMutation.mutate()} isLoading={inviteMutation.isPending}>
                  <Mail className="h-4 w-4 me-2" /> {t('Invite')}
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
                <p className="text-sm text-[var(--sv-text-muted)] text-center py-4">{t('No pending enrollment requests.')}</p>
              )}
              {pendingRequests.map((e: any) => (
                <div key={e.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-md bg-[var(--sv-warning-50)]/30 gap-3 border-[var(--sv-border)]">
                  <div className="text-sm">
                    <p className="font-medium">{e.learner?.firstName} {e.learner?.lastName}</p>
                    <p className="text-xs text-slate-500">{e.learner?.email}</p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-[var(--sv-success-600)] hover:text-[var(--sv-success-700)] hover:bg-[var(--sv-success-50)]" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.APPROVED })}>
                      <Check className="h-4 w-4 me-1" /> {t('Approve')}
                    </Button>
                    <Button size="sm" variant="outline" className="text-[var(--sv-error)] hover:text-[var(--sv-error-700)] hover:bg-[var(--sv-error-50)]" onClick={() => respondEnrollmentMutation.mutate({ id: e.id, status: EnrollmentStatus.REJECTED })}>
                      <X className="h-4 w-4 me-1" /> {t('Reject')}
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
            <div className="rounded-md border border-[var(--sv-border)]">
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
                      <TableCell colSpan={3} className="text-center py-8 text-[var(--sv-text-muted)]">
                        {t('No students enrolled yet.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-[var(--sv-surface-container-high)] flex items-center justify-center me-3 shrink-0">
                              <Users className="h-4 w-4 text-[var(--sv-text-muted)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--sv-text-primary)]">{e.learner?.firstName} {e.learner?.lastName}</p>
                    <p className="text-xs text-[var(--sv-text-muted)]">{e.learner?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--sv-text-muted)]">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[var(--sv-error)] hover:text-[var(--sv-error-700)] hover:bg-[var(--sv-error-50)]" 
                            onClick={() => {
                              if (confirm(t('Are you sure you want to remove this student from the course?'))) {
                                removeStudentMutation.mutate(e.id);
                              }
                            }}
                            isLoading={removeStudentMutation.isPending && removeStudentMutation.variables === e.id}
                          >
                            <Trash2 className="h-4 w-4 me-1" /> {t('Remove')}
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
