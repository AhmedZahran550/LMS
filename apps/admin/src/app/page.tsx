import { redirect } from 'next/navigation';

export default function RootPage() {
  // Simple redirect to login or dashboard. 
  // Real implementation would check auth state server-side if possible, 
  // but since we use Zustand client-side storage, we can just point to dashboard
  // which will redirect to login if unauthenticated via ProtectedLayout.
  redirect('/users');
}
