import { useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { SubscriptionStatus, SubscriptionPlanType } from '@lms/shared-types';

export function useSubscriptionGuard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const checkCanCreateCourse = useCallback((): { allowed: boolean; reason?: string } => {
    const sub = user?.subscription;
    if (!sub) return { allowed: true };

    if (!sub.plan) return { allowed: true };

    if (sub.status === SubscriptionStatus.EXPIRED) {
      return { allowed: false, reason: t('Your subscription has expired. Please renew to create courses.') };
    }

    if (sub.status === SubscriptionStatus.CANCELLED) {
      return { allowed: false, reason: t('Your subscription is inactive. Please renew to create courses.') };
    }

    if (sub.maxCourses > 0 && sub.coursesCount >= sub.maxCourses) {
      return { allowed: false, reason: t('You have reached the maximum of {{max}} courses on your plan. Upgrade to create more.', { max: sub.maxCourses }) };
    }

    return { allowed: true };
  }, [user?.subscription, t]);

  const checkCanUploadContent = useCallback((fileSize: number): { allowed: boolean; reason?: string } => {
    const sub = user?.subscription;
    if (!sub) return { allowed: true };

    if (!sub.plan) return { allowed: true };

    if (sub.status === SubscriptionStatus.EXPIRED) {
      return { allowed: false, reason: t('Your subscription has expired. Please renew to upload content.') };
    }

    if (sub.status === SubscriptionStatus.CANCELLED) {
      return { allowed: false, reason: t('Your subscription is inactive. Please renew to upload content.') };
    }

    if (sub.maxStorageBytes > 0 && sub.totalStorageBytes + fileSize > sub.maxStorageBytes) {
      return { allowed: false, reason: t('You have reached the storage limit on your plan. Upgrade to upload more.') };
    }

    return { allowed: true };
  }, [user?.subscription, t]);

  const checkCanAcceptStudent = useCallback((): { allowed: boolean; reason?: string } => {
    const sub = user?.subscription;
    if (!sub) return { allowed: true };

    if (!sub.plan) return { allowed: true };

    if (sub.status === SubscriptionStatus.EXPIRED) {
      return { allowed: false, reason: t('Your subscription has expired. Please renew to accept students.') };
    }

    if (sub.status === SubscriptionStatus.CANCELLED) {
      return { allowed: false, reason: t('Your subscription is inactive. Please renew to accept students.') };
    }

    if (sub.maxStudentsPerCourse > 0 && sub.totalStudents >= sub.maxStudentsPerCourse) {
      return { allowed: false, reason: t('You have reached the maximum of {{max}} students per course on your plan. Upgrade to accept more.', { max: sub.maxStudentsPerCourse }) };
    }

    return { allowed: true };
  }, [user?.subscription, t]);

  return { checkCanCreateCourse, checkCanUploadContent, checkCanAcceptStudent };
}
