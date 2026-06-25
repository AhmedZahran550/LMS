'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationApis } from '@/lib/notificationApis';
import { Avatar } from '@/components/ui/Avatar';
import { Bell, LogOut, User, Check } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
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
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      <div className="flex items-center">
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-150 bg-white p-2 shadow-lg ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <span className="text-sm font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={"flex flex-col gap-1 rounded-lg px-4 py-2.5 text-left transition-colors cursor-pointer " + (
                        notification.isRead
                          ? 'text-slate-600 hover:bg-slate-50'
                          : 'bg-indigo-50/40 text-slate-800 hover:bg-indigo-50/70'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{notification.subject}</span>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <span className="text-xs leading-normal">{notification.message}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <Avatar src={user.profileImageUrl} firstName={user.firstName} lastName={user.lastName} size="md" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-150 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href={profileUrl}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="mr-3 h-4 w-4 text-slate-400" />
                  My Profile
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="flex w-full items-center rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
