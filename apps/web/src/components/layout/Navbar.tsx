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

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
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
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-full hover:bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface-variant)] transition-colors">
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
            <div className="absolute ltr:-right-16 sm:ltr:right-0 rtl:-left-16 sm:rtl:left-0 mt-2 w-[280px] sm:w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--sv-outline-variant)]/30 bg-[var(--sv-surface)]/95 backdrop-blur-xl p-2 shadow-lg ring-1 ring-black/5 z-50">
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

              <div className="max-h-72 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <span className="text-2xl mb-1 block">🎉</span>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{t("You're all caught up!")}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t("No new notifications at this moment.")}</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={"flex flex-col gap-1 rounded-xl mx-1 px-3.5 py-2.5 text-start transition-colors cursor-pointer " + (
                        notification.isRead
                          ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{notification.subject}</span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs leading-normal">{notification.message}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString(i18n.language)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-transform active:scale-95 cursor-pointer"
          >
            <Avatar src={user.profileImageUrl} firstName={user.firstName} lastName={user.lastName} size="sm" isOnline={true} />
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
