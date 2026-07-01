'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Smartphone, Download } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface InvitationData {
  instructorName: string;
  instructorEmail: string;
  instructorProfileImageUrl?: string;
  studentEmail: string;
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useTranslation();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided.');
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      try {
        const response = await api.get(`/learner/invitations/info?token=${token}`);
        setData(response.data.data);
      } catch {
        setError('This invitation link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-container flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Invalid Invitation</h1>
          <p className="text-on-surface-variant mb-6">{error || 'Something went wrong.'}</p>
          <p className="text-sm text-on-surface-variant">
            Please ask your instructor to send you a new invitation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <Avatar
              src={data.instructorProfileImageUrl}
              firstName={data.instructorName.split(' ')[0]}
              lastName={data.instructorName.split(' ')[1] || ''}
              size="lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            You&apos;re Invited!
          </h1>
          <p className="text-lg text-on-surface-variant">
            <span className="font-semibold text-on-surface">{data.instructorName}</span> has invited you to join their courses.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-container flex items-center justify-center">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Download the App</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            To accept this invitation and access your courses, please download our mobile app.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-xl bg-on-surface text-background font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Download for iOS
            </a>
            <a
              href="#"
              className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-xl bg-on-surface text-background font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3v18h18V3H3zm15 5h-2.42v3.33H13v2.34h2.58V17h2.42v-3.33H20v-2.34h-2.42V8z"/>
              </svg>
              Download for Android
            </a>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">
          After installing the app, open it and log in with your email to automatically accept the invitation.
        </p>
      </div>
    </div>
  );
}
