'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface UsageBarProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  className?: string;
}

export function UsageBar({ label, current, max, unit, className }: UsageBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isUnlimited = max === 0;

  const barColor =
    percentage >= 90 ? 'var(--sv-error)' : percentage >= 70 ? 'var(--sv-accent-500)' : 'var(--sv-primary)';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--sv-on-surface)]">{label}</span>
        <span className="text-sm text-[var(--sv-on-surface-variant)]">
          {isUnlimited ? 'Unlimited' : `${current} / ${max}${unit ? ` ${unit}` : ''}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full rounded-full bg-[var(--sv-surface-container-high)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: barColor }}
          />
        </div>
      )}
    </div>
  );
}
