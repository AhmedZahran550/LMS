'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionApis } from '@/lib/subscriptionApis';
import { PlanCard } from '@/components/subscription/PlanCard';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export default function ChoosePlanPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateSubscription } = useAuthStore();
  const [choosingPlan, setChoosingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If user is not instructor or already has subscription, redirect away
  useEffect(() => {
    if (user && (user.role !== 'instructor' || user.subscription?.status)) {
      const target = user.role === 'instructor' ? '/instructor' : '/my-courses';
      router.replace(target);
    }
  }, [user, router]);

  // Handle Stripe checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setChoosingPlan('refreshing');
      subscriptionApis.refreshSubscription()
        .then((sub) => {
          updateSubscription(sub);
          window.location.href = '/instructor';
        })
        .catch(() => {
          setChoosingPlan(null);
          setError(t('Failed to verify subscription. Please try again.'));
        });
    }
  }, [updateSubscription, t]);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionApis.getPlans(),
  });

  const choosePlanMutation = useMutation({
    mutationFn: async (planType: string) => {
      if (planType === 'free') {
        const result = await subscriptionApis.choosePlan(planType);
        return { planType, result };
      }
      const result = await subscriptionApis.createCheckoutSession(
        planType,
        `${window.location.origin}/choose-plan?success=true`,
        `${window.location.origin}/choose-plan`,
      );
      return { planType, result };
    },
    onSuccess: (data) => {
      if (data.planType === 'free') {
        updateSubscription(data.result);
        window.location.href = '/instructor';
      } else if (data.result?.url) {
        window.location.href = data.result.url;
      }
    },
    onError: (err: any) => {
      setError(err.message || err.response?.data?.message || t('Something went wrong'));
      setChoosingPlan(null);
    },
  });

  const handleChoosePlan = (planType: string) => {
    setChoosingPlan(planType);
    setError(null);
    choosePlanMutation.mutate(planType);
  };

  if (!user) return null;

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--sv-text-primary)]">
            {t('Choose Your Plan')}
          </h1>
          <p className="text-[var(--sv-text-secondary)] mt-2">
            {t('Pick the plan that best fits your needs. You can upgrade anytime.')}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-[var(--sv-error)] bg-[var(--sv-error-50)] p-3 rounded-lg border border-[var(--sv-error)]/20 mb-6 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {plansLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--sv-primary)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((p: any) => {
              const features = [
                { label: p.maxCourses === 0 ? 'Unlimited courses' : `Up to ${p.maxCourses} courses`, included: true },
                { label: p.maxStudentsPerCourse === 0 ? 'Unlimited students per course' : `Up to ${p.maxStudentsPerCourse} students per course`, included: true },
                { label: p.maxStorageBytes === 0 ? 'Unlimited storage' : `Up to ${formatBytes(p.maxStorageBytes)} storage`, included: true },
                { label: p.trialDays > 0 ? `${p.trialDays}-day free trial` : 'No free trial', included: true },
                { label: 'Priority support', included: p.name !== 'free' },
                { label: 'Custom branding', included: p.name === 'plus' },
              ];

              const isPopular = p.name === 'pro';

              return (
                <PlanCard
                  key={p.id}
                  name={p.name}
                  price={p.price}
                  currency={p.currency}
                  description={p.description}
                  features={features}
                  isCurrentPlan={false}
                  isPopular={isPopular}
                  onSelect={() => handleChoosePlan(p.name)}
                  buttonLabel={p.price === 0 ? 'Choose Free' : 'Subscribe'}
                  isLoading={choosingPlan === p.name}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
