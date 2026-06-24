'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { UserRole } from '@lms/shared-types';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(50, 'Password must be at most 50 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    ),
  role: z.nativeEnum(UserRole),
});

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.LEARNER);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Frontend Validation using Zod
      registerSchema.parse({
        firstName,
        lastName,
        email,
        password,
        role,
      });

      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      
      if (user.role === UserRole.INSTRUCTOR) {
        router.push('/instructor');
      } else {
        router.push('/courses');
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Join our platform as a Learner or Instructor.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="firstName">First name</label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email address</label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password (min 6 chars)</label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">I want to join as:</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value={UserRole.LEARNER}
                  checked={role === UserRole.LEARNER}
                  onChange={() => setRole(UserRole.LEARNER)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">Student</span>
              </label>
              <label className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value={UserRole.INSTRUCTOR}
                  checked={role === UserRole.INSTRUCTOR}
                  onChange={() => setRole(UserRole.INSTRUCTOR)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">Instructor</span>
              </label>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
          <p className="text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
