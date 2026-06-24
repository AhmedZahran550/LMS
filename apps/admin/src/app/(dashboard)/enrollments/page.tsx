'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';

export default function EnrollmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: async () => {
      const res = await api.get('/admin/enrollments');
      return res.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const enrollments = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Enrollments</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-900">Course</th>
                <th className="p-4 font-semibold text-slate-900">Learner</th>
                <th className="p-4 font-semibold text-slate-900">Status</th>
                <th className="p-4 font-semibold text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {enrollments.map((e: any) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium">{e.course?.title || 'Unknown Course'}</td>
                  <td className="p-4 text-slate-500">{e.learner?.firstName} {e.learner?.lastName}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-semibold uppercase">{e.status}</span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
