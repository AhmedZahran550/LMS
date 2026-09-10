'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { BookOpen, Compass, LayoutDashboard, LogOut, Settings, Video, CreditCard, Users, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole, SubscriptionStatus } from '@lms/shared-types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case UserRole.INSTRUCTOR:
        return [
          { name: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
          { name: 'My Courses', href: '/instructor/courses', icon: Video },
          { name: 'Students', href: '/instructor/students', icon: Users },
          { name: 'Subscription', href: '/instructor/subscription', icon: CreditCard },
        ];
      case UserRole.LEARNER:
      default:
        return [
          { name: 'Browse Courses', href: '/courses', icon: Compass },
          { name: 'My Learning', href: '/my-courses', icon: BookOpen },
        ];
    }
  };

  const links = getLinks();
  const profileHref = user.role === UserRole.INSTRUCTOR ? '/instructor/profile' : '/profile';
  const roleLabel = user.role === UserRole.INSTRUCTOR ? t('Instructor') : t('Learner');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside className={`fixed md:relative top-0 ltr:left-0 rtl:right-0 h-full w-64 bg-[var(--sv-surface-container-low)] shadow-sm border-e border-[var(--sv-outline-variant)]/30 py-6 px-4 z-50 transform transition-transform duration-300 flex flex-col md:!translate-x-0 ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
            <Link href="/" className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-1.5">
              <span>{t('app.name')}</span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user.role === UserRole.INSTRUCTOR ? t('Instructor Workspace') : t('Learner Hub')}
            </p>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-800 p-1 rounded-lg" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      
        <nav className="flex-1 space-y-1.5">
          {links.map((link) => {
            const isActive = link.href === '/instructor' || link.href === '/'
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/50 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 active:scale-[0.98]'
                }`}
              >
                <link.icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span className="flex-1">{t(link.name)}</span>
                {link.name === 'Subscription' && user.subscription?.status && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                      {user.subscription.plan === 'free' ? t('Free') : user.subscription.plan === 'pro' ? t('Pro') : t('Plus')}
                    </span>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        user.subscription.status === SubscriptionStatus.ACTIVE
                          ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                          : user.subscription.status === SubscriptionStatus.TRIALING
                            ? 'bg-amber-500 ring-2 ring-amber-500/20'
                            : user.subscription.status === SubscriptionStatus.CANCELLED
                              ? 'bg-slate-400'
                              : 'bg-red-500'
                      }`}
                      title={t(user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1))}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 pt-5 space-y-2">
          <Link 
            href={profileHref}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all group"
          >
            <Avatar
              src={user.profileImageUrl}
              firstName={user.firstName}
              lastName={user.lastName}
              size="sm"
              isOnline={true}
            />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {roleLabel}
            </span>
          </Link>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('Logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
