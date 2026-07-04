'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Check, X, ArrowLeft, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApis } from '@/lib/instructorApis';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function RequestsPage() {
  const { t } = useTranslation();
  const { updateSubscription } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-requests', page],
    queryFn: () => instructorApis.listRequests({ page, limit: 20 }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'decline' }) =>
      instructorApis.respondToRequest(id, action),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      if (variables.action === 'approve') {
        const current = useAuthStore.getState().user?.subscription?.totalStudents || 0;
        updateSubscription({ totalStudents: current + 1 });
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t('Failed to respond'));
    },
  });

  const requests = data?.data?.items || [];
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
          <h1 className="text-2xl font-bold text-on-surface">{t('Join Requests')}</h1>
          <p className="text-sm text-on-surface-variant">{meta.total} {t('pending requests')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Requests')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-on-surface-variant">{t('Loading...')}</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">{t('No pending requests.')}</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req: any) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-low"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-on-surface-variant" />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">
                        {req.student?.firstName} {req.student?.lastName}
                      </p>
                      <p className="text-sm text-on-surface-variant">{req.student?.email}</p>
                    </div>
                  </div>
                  <div className="flex w-full sm:w-auto items-center justify-end gap-2">
                    <Badge variant="outline">{t('Requested')}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success-500 hover:text-success-600 hover:bg-success-50"
                      onClick={() => respondMutation.mutate({ id: req.id, action: 'approve' })}
                      isLoading={respondMutation.isPending}
                    >
                      <Check className="h-4 w-4 me-1" /> {t('Approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error hover:text-error-700 hover:bg-error-50"
                      onClick={() => respondMutation.mutate({ id: req.id, action: 'decline' })}
                      isLoading={respondMutation.isPending}
                    >
                      <X className="h-4 w-4 me-1" /> {t('Decline')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {meta.totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
