'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationApis } from '@/lib/notificationApis';
import { Avatar } from '@/components/ui/Avatar';
import { Bell, LogOut, User, Check, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApis.getNotifications(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApis.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApis.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    setShowNotifications(false);

    if (notification.relatedEntityType === 'course' && notification.relatedEntityId) {
      if (user?.role === 'instructor') {
        router.push('/instructor/courses/' + notification.relatedEntityId);
      } else {
        router.push('/my-courses/' + notification.relatedEntityId);
      }
      return;
    }

    if (notification.relatedEntityType === 'content' && notification.metadata?.courseId) {
      router.push('/my-courses/' + notification.metadata.courseId);
      return;
    }
  };

  if (!user) return null;

  const profileUrl = user.role.toLowerCase() === 'instructor' ? '/instructor/profile' : '/profile';

  return (
    <header className="sticky top-0 z-20 bg-[var(--sv-surface)]/80 backdrop-blur-md border-b border-[var(--sv-outline-variant)]/30 px-6 py-3 flex justify-between items-center w-full">
      <div className="flex items-center gap-6 flex-1">
        <button className="md:hidden p-2 rounded-full hover:bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface-variant)] transition-colors">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--sv-on-surface-variant)]" />
          <input 
            className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 bg-[var(--sv-surface-container-low)] border border-[var(--sv-outline-variant)] rounded-full text-sm focus:ring-2 focus:ring-[var(--sv-primary)] focus:border-transparent transition-all outline-none text-[var(--sv-on-surface)]" 
            placeholder={t('Search for courses, lessons...')} 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <LanguageSwitcher />
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-[var(--sv-on-surface-variant)] hover:bg-[var(--sv-surface-container-high)] transition-all focus:outline-none"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 ltr:right-1.5 rtl:left-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[var(--sv-error)] border-2 border-[var(--sv-surface)] animate-bounce">
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-80 rounded-xl border border-[var(--sv-outline-variant)]/30 bg-[var(--sv-surface)]/95 backdrop-blur-xl p-2 shadow-lg ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-[var(--sv-outline-variant)]/30 px-4 py-2">
                <span className="text-sm font-bold text-[var(--sv-on-surface)]">{t('Notifications')}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs font-semibold text-[var(--sv-primary)] hover:brightness-110 flex items-center gap-1 transition-colors"
                  >
                    <Check className="h-3 w-3" /> {t('Mark all read')}
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--sv-on-surface-variant)]">
                    {t('No notifications yet.')}
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={"flex flex-col gap-1 rounded-lg px-4 py-2.5 text-start transition-colors cursor-pointer " + (
                        notification.isRead
                          ? 'text-[var(--sv-on-surface-variant)] hover:bg-[var(--sv-surface-container-high)]'
                          : 'bg-[var(--sv-primary-container)]/10 text-[var(--sv-on-surface)] hover:bg-[var(--sv-primary-container)]/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--sv-on-surface)]">{notification.subject}</span>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--sv-primary)]" />
                        )}
                      </div>
                      <span className="text-xs leading-normal">{notification.message}</span>
                      <span className="text-[10px] text-[var(--sv-on-surface-variant)]">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-[var(--sv-outline-variant)] mx-2 hidden md:block"></div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-[var(--sv-primary)] text-[var(--sv-on-primary)] text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--sv-primary)]/20"
          >
            {user.profileImageUrl ? (
              <Avatar src={user.profileImageUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />
            ) : (
              <span>{user.firstName[0]?.toUpperCase()}{user.lastName[0]?.toUpperCase()}</span>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-56 origin-top-right rtl:origin-top-left rounded-xl border border-[var(--sv-outline-variant)]/30 bg-[var(--sv-surface)]/95 backdrop-blur-xl p-1.5 shadow-lg ring-1 ring-black/5 z-50">
              <div className="border-b border-[var(--sv-outline-variant)]/30 px-4 py-3">
                <p className="text-sm font-bold text-[var(--sv-on-surface)]">{user.firstName} {user.lastName}</p>
                <p className="truncate text-xs text-[var(--sv-on-surface-variant)]">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href={profileUrl}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--sv-on-surface-variant)] hover:bg-[var(--sv-surface-container-high)] hover:text-[var(--sv-primary)] transition-colors"
                >
                  <User className="me-3 h-4 w-4" />
                  {t('My Profile')}
                </Link>
              </div>

              <div className="border-t border-[var(--sv-outline-variant)]/30 pt-1">
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="flex w-full items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--sv-error)] hover:bg-[var(--sv-error-container)] transition-colors"
                >
                  <LogOut className="me-3 h-4 w-4" />
                  {t('Logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
