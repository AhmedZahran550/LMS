'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { HardDrive, Server, Zap } from 'lucide-react';
import { subscriptionApis } from '@/lib/subscriptionApis';
import { toast } from 'react-hot-toast';

interface BuyStorageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPaidPlan: boolean;
}

export function BuyStorageDialog({ open, onOpenChange, isPaidPlan }: BuyStorageDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyStorage = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionApis.buyStorageAddon();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('Failed to initiate checkout'));
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('Buy Extra Storage')}
      description={t('Need more space for your courses? Add a 10 GB storage pack to your plan.')}
      className="max-w-md"
    >
      <div className="space-y-6">
        <div className="bg-[var(--sv-surface-container-low)] border border-[var(--sv-outline-variant)] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[var(--sv-primary-container)]/20 flex items-center justify-center flex-shrink-0">
              <HardDrive className="h-6 w-6 text-[var(--sv-primary)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--sv-on-surface)]">10 GB {t('Storage Pack')}</h3>
              <p className="text-sm text-[var(--sv-on-surface-variant)]">{t('Valid for 6 months')}</p>
            </div>
          </div>
          
          <div className="mb-4 pt-4 border-t border-[var(--sv-outline-variant)]">
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-[var(--sv-on-surface)]">100</span>
              <span className="text-lg font-bold text-[var(--sv-on-surface)]">EGP</span>
              <span className="text-sm text-[var(--sv-on-surface-variant)] mb-1">/ {t('6 months')}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm text-[var(--sv-on-surface)]">
              <Server className="h-4 w-4 text-[var(--sv-primary)]" />
              {t('Add 10 GB to your total storage capacity')}
            </li>
            <li className="flex items-center gap-2 text-sm text-[var(--sv-on-surface)]">
              <Zap className="h-4 w-4 text-[var(--sv-primary)]" />
              {t('Instant activation after payment')}
            </li>
          </ul>

          {!isPaidPlan && (
            <div className="p-3 mb-4 rounded-lg bg-[var(--sv-error-container)]/20 border border-[var(--sv-error)]/30">
              <p className="text-sm text-[var(--sv-error)]">
                {t('Storage add-ons are only available for paid plans. Please upgrade your plan first.')}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleBuyStorage}
            isLoading={isLoading}
            disabled={!isPaidPlan || isLoading}
          >
            {t('Buy via Stripe')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
