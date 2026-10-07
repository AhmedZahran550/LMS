'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@lms/shared-types';
import { useTranslation } from 'react-i18next';
import { GraduationCap, BookOpen } from 'lucide-react';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  const { t } = useTranslation();

  const roles = [
    { role: UserRole.INSTRUCTOR, label: t('Instructor'), icon: BookOpen },
    { role: UserRole.LEARNER, label: t('Student'), icon: GraduationCap },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--sv-text-primary)]">
        {t('I want to join as:')}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map(({ role, label, icon: Icon }) => (
          <button
            key={role}
            type="button"
            disabled={disabled}
            onClick={() => onChange(role)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all',
              'focus:outline-none focus:ring-2 focus:ring-[var(--sv-ring-focus)] focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              value === role
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'border-[var(--sv-border)] bg-transparent text-[var(--sv-text-secondary)] hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
