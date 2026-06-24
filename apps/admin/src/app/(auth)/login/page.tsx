'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { UserRole } from '@lms/shared-types';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      
      if (user.role !== UserRole.ADMIN) {
        throw new Error('Unauthorized: Admin access required.');
      }
      
      setAuth(user, accessToken, refreshToken);
      router.push('/users');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter admin credentials to continue.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</div>}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" isLoading={isLoading}>Sign In to Admin Panel</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
