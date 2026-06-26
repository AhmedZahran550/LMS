'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerifyOtpForm } from './VerifyOtpForm';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return <VerifyOtpForm email={email} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
