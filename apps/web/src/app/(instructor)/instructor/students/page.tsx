'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Users, Mail, Trash2, UserPlus, Link as LinkIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApis } from '@/lib/instructorApis';
import { useAuthStore } from '@/store/useAuthStore';
import { InstructorStudentStatus } from '@lms/shared-types';
import Link from 'next/link';

const statusOptions = [
  { value: '', label: 'All' },
  { value: InstructorStudentStatus.ACTIVE, label: 'Active' },
  { value: InstructorStudentStatus.INVITED, label: 'Invited' },
  { value: InstructorStudentStatus.REQUESTED, label: 'Requested' },
];

export default function StudentListPage() {
  const { t, i18n } = useTranslation();
  const { updateSubscription } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-students', statusFilter, page],
    queryFn: () => instructorApis.listStudents({ status: statusFilter || undefined, page, limit: 20 }),
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => instructorApis.inviteStudent(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      setInviteEmail('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to invite student'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => instructorApis.removeStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to remove student'));
    },
  });

  const students = data?.data?.items || [];
  const meta = data?.data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const statusBadge = (status: string) => {
    switch (status) {
      case InstructorStudentStatus.ACTIVE:
        return <Badge variant="default" className="bg-success-500">{t('Active')}</Badge>;
      case InstructorStudentStatus.INVITED:
        return <Badge variant="secondary">{t('Invited')}</Badge>;
      case InstructorStudentStatus.REQUESTED:
        return <Badge variant="outline">{t('Requested')}</Badge>;
      default:
        return <Badge variant="outline">{t(status)}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t('Students')}</h1>
          <p className="text-sm text-on-surface-variant">{t('Manage your students and invitations.')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/instructor/students/invitations">
            <Button variant="outline">
              <Mail className="h-4 w-4 me-2" /> {t('Invitations')}
            </Button>
          </Link>
          <Link href="/instructor/students/requests">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 me-2" /> {t('Requests')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Invite Student')}</CardTitle>
              <CardDescription>{t('Send an email invitation.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  placeholder={t('student@example.com')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => inviteMutation.mutate(inviteEmail)}
                  isLoading={inviteMutation.isPending}
                >
                  <Mail className="h-4 w-4 me-2" /> {t('Send Invitation')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Filter')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                ))}
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('All Students')}</CardTitle>
              <CardDescription>{meta.total} {t('total')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-outline-variant">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Student')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('Email')}</TableHead>
                      <TableHead>{t('Status')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('Invited')}</TableHead>
                      <TableHead className="text-end">{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-on-surface-variant">
                          {t('Loading...')}
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-on-surface-variant">
                          {t('No students found.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                                <Users className="h-4 w-4 text-on-surface-variant" />
                              </div>
                              <div>
                                <p className="font-medium text-on-surface">
                                  {s.student?.firstName} {s.student?.lastName}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-on-surface-variant hidden sm:table-cell">
                            {s.student?.email || '—'}
                          </TableCell>
                          <TableCell>{statusBadge(s.status)}</TableCell>
                          <TableCell className="text-on-surface-variant text-sm hidden sm:table-cell">
                            {s.invitationSentAt
                              ? new Date(s.invitationSentAt).toLocaleDateString(i18n.language)
                              : '—'}
                          </TableCell>
                          <TableCell className="text-end">
                            <div className="flex items-center justify-end gap-1">
                              {s.status === InstructorStudentStatus.ACTIVE && (
                                <Link href={`/instructor/students/${s.student?.id}/assign`}>
                                  <Button size="sm" variant="ghost">
                                    <LinkIcon className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-error hover:text-error hover:bg-error-container"
                                onClick={() => {
                                  if (confirm(t('Are you sure?'))) {
                                    removeMutation.mutate(s.id);
                                  }
                                }}
                                isLoading={removeMutation.isPending}
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
              {meta.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
