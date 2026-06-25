'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, LayoutDashboard, LogOut, Settings, Video } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@lms/shared-types';
import { Avatar } from '@/components/ui/Avatar';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case UserRole.INSTRUCTOR:
        return [
          { name: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
          { name: 'My Courses', href: '/instructor/courses', icon: Video },
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
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">LMS Platform</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = link.href === '/instructor' || link.href === '/'
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <link.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-indigo-700' : 'text-slate-400'
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4 space-y-1">
        <Link 
          href={profileHref}
          className={`flex items-center p-2 rounded-md transition-colors group ${
            pathname.startsWith(profileHref) 
              ? 'bg-indigo-50' 
              : 'hover:bg-slate-100'
          }`}
        >
          <Avatar
            src={user.profileImageUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            size="sm"
          />
          <div className="ml-3 overflow-hidden flex-1">
            <p className={`text-sm font-semibold truncate transition-colors ${
              pathname.startsWith(profileHref) ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-600'
            }`}>{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </Link>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
