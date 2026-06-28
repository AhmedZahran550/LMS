'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { BookOpen, Compass, LayoutDashboard, LogOut, Settings, Video, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@lms/shared-types';
import { Avatar } from '@/components/ui/Avatar';

export function Sidebar() {
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
    <aside className="hidden md:flex flex-col h-full w-64 bg-[var(--sv-surface-container-low)] shadow-sm border-e border-[var(--sv-outline-variant)] py-6 px-4 z-30">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-[var(--sv-primary)]">{t('LMS Platform')}</h1>
        <p className="text-xs text-[var(--sv-on-surface-variant)]">{t('Education Platform')}</p>
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
  );
}
