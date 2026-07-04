'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { BookOpen, Compass, LayoutDashboard, LogOut, Settings, Video, CreditCard, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole, SubscriptionStatus } from '@lms/shared-types';
import { Avatar } from '@/components/ui/Avatar';

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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside className={`fixed md:relative top-0 ltr:left-0 rtl:right-0 h-full w-64 bg-[var(--sv-surface-container-low)] shadow-sm border-e border-[var(--sv-outline-variant)] py-6 px-4 z-50 transform transition-transform duration-300 flex flex-col md:!translate-x-0 ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sv-primary)]">{t('app.name')}</h1>
            <p className="text-xs text-[var(--sv-on-surface-variant)]">{t('app.name')}</p>
          </div>
          <button className="md:hidden text-[var(--sv-on-surface-variant)]" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = link.href === '/instructor' || link.href === '/'
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'text-[var(--sv-primary)] font-bold border-e-4 border-[var(--sv-primary)] bg-[var(--sv-surface-container-high)]'
                  : 'text-[var(--sv-on-surface-variant)] hover:text-[var(--sv-primary)] hover:bg-[var(--sv-surface-container-high)] active:scale-95'
              }`}
            >
              <link.icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-[var(--sv-primary)]' : 'text-[var(--sv-on-surface-variant)]'
                }`}
              />
              <span className="text-base">{t(link.name)}</span>
              {link.name === 'Subscription' && user.subscription?.status && (
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[var(--sv-on-surface-variant)] capitalize truncate max-w-[60px]">
                    {user.subscription.plan === 'free' ? t('Free') : user.subscription.plan === 'pro' ? t('Pro') : t('Plus')}
                  </span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      user.subscription.status === SubscriptionStatus.ACTIVE
                        ? 'bg-[var(--sv-success-500)]'
                        : user.subscription.status === SubscriptionStatus.TRIALING
                          ? 'bg-[var(--sv-accent-500)]'
                          : user.subscription.status === SubscriptionStatus.CANCELLED
                            ? 'bg-[var(--sv-on-surface-variant)]'
                            : 'bg-[var(--sv-error)]'
                    }`}
                    title={t(user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1))}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--sv-outline-variant)] pt-6">
        <Link 
          href={profileHref}
          className="flex items-center gap-4 mb-6 px-2 hover:bg-[var(--sv-surface-container-high)] p-2 rounded-lg transition-colors group"
        >
          <Avatar
            src={user.profileImageUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            size="sm"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-[var(--sv-on-surface)] truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-[var(--sv-on-surface-variant)] truncate">{user.email}</p>
          </div>
        </Link>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex items-center gap-4 w-full p-4 rounded-lg text-[var(--sv-error)] hover:bg-[var(--sv-error-container)] transition-colors active:scale-95 duration-150"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-base">{t('Logout')}</span>
        </button>
      </div>
    </aside>
    </>
  );
}
