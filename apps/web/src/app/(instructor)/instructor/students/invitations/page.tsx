'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Mail, Trash2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApis } from '@/lib/instructorApis';
import { InstructorStudentStatus } from '@lms/shared-types';
import Link from 'next/link';

export default function InvitationsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-students', InstructorStudentStatus.INVITED, page],
    queryFn: () => instructorApis.listStudents({ status: InstructorStudentStatus.INVITED, page, limit: 20 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => instructorApis.removeStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to cancel invitation'));
    },
  });

  const invitations = data?.data?.items || [];
  const meta = data?.data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instructor/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 me-2" /> {t('Back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t('Pending Invitations')}</h1>
          <p className="text-sm text-on-surface-variant">{meta.total} {t('pending invitations')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Invitations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-outline-variant">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Email')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('Sent')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead className="text-end">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-on-surface-variant">
                      {t('Loading...')}
                    </TableCell>
                  </TableRow>
                ) : invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-on-surface-variant">
                      {t('No pending invitations.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-on-surface-variant" />
                          <span>{inv.student?.email || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-on-surface-variant text-sm hidden sm:table-cell">
                        {inv.invitationSentAt
                          ? new Date(inv.invitationSentAt).toLocaleDateString(i18n.language)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t('Pending')}</Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error hover:text-error hover:bg-error-container"
                          onClick={() => {
                            if (confirm(t('Cancel this invitation?'))) {
                              cancelMutation.mutate(inv.id);
                            }
                          }}
                          isLoading={cancelMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 me-1" /> {t('Cancel')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {meta.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
