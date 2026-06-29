'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionApis } from '@/lib/subscriptionApis';
import { PlanCard } from '@/components/subscription/PlanCard';
import { UsageBar } from '@/components/subscription/UsageBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CreditCard, AlertCircle, Calendar } from 'lucide-react';
import { SubscriptionPlanType, SubscriptionStatus } from '@lms/shared-types';
import { useAuthStore } from '@/store/useAuthStore';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function InstructorSubscriptionPage() {
  const { t } = useTranslation();
  const { user, updateSubscription } = useAuthStore();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const sub = user?.subscription;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      subscriptionApis.getMySubscription().then(usage => {
        updateSubscription({
          plan: usage.plan?.name || null,
          status: usage.subscription?.status || null,
          coursesCount: usage.coursesCount,
          totalStudents: usage.totalStudents,
          totalStorageBytes: usage.totalStorageBytes,
          maxCourses: usage.plan?.maxCourses || 0,
          maxStudentsPerCourse: usage.plan?.maxStudentsPerCourse || 0,
          maxStorageBytes: usage.plan?.maxStorageBytes || 0,
        });
      }).catch(() => {});
    }
  }, [updateSubscription]);

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionApis.getPlans(),
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planType: string) => {
      const result = await subscriptionApis.createCheckoutSession(planType);
      return result;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onSettled: () => setUpgradingPlan(null),
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionApis.createPortalSession(),
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleUpgrade = (planType: string) => {
    setUpgradingPlan(planType);
    checkoutMutation.mutate(planType);
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const variants: Record<string, string> = {
      [SubscriptionStatus.TRIALING]: 'secondary',
      [SubscriptionStatus.ACTIVE]: 'default',
      [SubscriptionStatus.PAST_DUE]: 'destructive',
      [SubscriptionStatus.CANCELLED]: 'outline',
      [SubscriptionStatus.EXPIRED]: 'destructive',
    };
    const s = status || 'inactive';
    return (
      <Badge variant={(variants[s] || 'outline') as any}>
        {t(s.charAt(0).toUpperCase() + s.slice(1))}
      </Badge>
    );
  };

  const isExpired = sub?.status === SubscriptionStatus.EXPIRED;
  const isTrialing = sub?.status === SubscriptionStatus.TRIALING;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sv-on-surface)]">{t('Subscription')}</h1>
        <p className="text-[var(--sv-on-surface-variant)] mt-1">{t('Manage your plan and billing')}</p>
      </div>

      {isExpired && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--sv-error)]/10 border border-[var(--sv-error)]/20 text-[var(--sv-error)]">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{t('Your subscription has expired. Upgrade to continue creating courses and accepting students.')}</p>
        </div>
      )}

      {sub && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('Current Plan')}</CardTitle>
              <div className="flex items-center gap-3">
                {getStatusBadge(sub.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--sv-on-surface)] capitalize">{t('{{plan}} Plan', { plan: sub.plan || 'Free' })}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => portalMutation.mutate()}
                isLoading={portalMutation.isPending}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t('Manage Billing')}
              </Button>
            </div>

            <div className="space-y-4">
              <UsageBar
                label={t('Courses')}
                current={sub.coursesCount}
                max={sub.maxCourses}
              />
              <UsageBar
                label={t('Students per Course')}
                current={sub.totalStudents}
                max={sub.maxStudentsPerCourse}
              />
              <UsageBar
                label={t('Storage')}
                current={parseFloat((sub.totalStorageBytes / (1024 * 1024 * 1024)).toFixed(1))}
                max={sub.maxStorageBytes === 0 ? 0 : parseFloat((sub.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(1))}
                unit="GB"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold text-[var(--sv-on-surface)] mb-4">{t('Available Plans')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((p: any) => {
            const isCurrentPlan = sub?.plan === p.name;
            const features = [
              { label: p.maxCourses === 0 ? t('Unlimited courses') : t('Up to {{count}} courses', { count: p.maxCourses }), included: true },
              { label: p.maxStudentsPerCourse === 0 ? t('Unlimited students per course') : t('Up to {{count}} students per course', { count: p.maxStudentsPerCourse }), included: true },
              { label: p.maxStorageBytes === 0 ? t('Unlimited storage') : t('Up to {{size}} storage', { size: formatBytes(p.maxStorageBytes) }), included: true },
              { label: p.trialDays > 0 ? t('{{days}}-day free trial', { days: p.trialDays }) : t('No free trial'), included: true },
              { label: t('Priority support'), included: p.name !== SubscriptionPlanType.FREE },
              { label: t('Custom branding'), included: p.name === SubscriptionPlanType.PLUS },
            ];

            return (
              <PlanCard
                key={p.id}
                name={p.name}
                price={p.price}
                currency={p.currency}
                description={p.description}
                features={features}
                isCurrentPlan={isCurrentPlan}
                isPopular={p.name === SubscriptionPlanType.PRO}
                onSelect={isCurrentPlan ? undefined : () => handleUpgrade(p.name)}
                buttonLabel={p.price === 0 ? t('Downgrade to Free') : t('Upgrade')}
                isLoading={upgradingPlan === p.name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
