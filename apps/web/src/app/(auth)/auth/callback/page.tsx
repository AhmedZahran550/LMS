'use client';

import { useEffect } from 'react';

export default function AuthCallbackPage() {
  useEffect(() => {
    try { window.close(); } catch {}
    window.location.replace('about:blank');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm text-slate-500">Authentication complete — you may close this window.</p>
    </div>
  );
}
