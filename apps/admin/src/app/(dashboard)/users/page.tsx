'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users'); // Note: The route is /api/admin/users
      return res.data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await api.patch(`/admin/users/${id}`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  });

  if (isLoading) return <div>Loading...</div>;

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-slate-900">Name</th>
                <th className="p-4 font-semibold text-slate-900">Email</th>
                <th className="p-4 font-semibold text-slate-900">Role</th>
                <th className="p-4 font-semibold text-slate-900">Status</th>
                <th className="p-4 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="p-4 text-slate-500">{user.email}</td>
                  <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">{user.role}</span></td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive })}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
