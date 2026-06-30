'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApis } from '@/lib/instructorApis';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteStudentDialog({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => instructorApis.inviteStudent(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      setEmail('');
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--sv-surface-container-high)] rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{t('Invite Student')}</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('Enter student email')}
          className="w-full px-4 py-2 border border-[var(--sv-outline-variant)] rounded-lg mb-4 bg-[var(--sv-surface)]"
        />
        {mutation.isError && (
          <p className="text-red-500 text-sm mb-2">{t('Failed to send invitation')}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--sv-outline-variant)]">
            {t('Cancel')}
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!email || mutation.isPending}
            className="px-4 py-2 rounded-lg bg-[var(--sv-primary)] text-white disabled:opacity-50"
          >
            {mutation.isPending ? t('Sending...') : t('Invite')}
          </button>
        </div>
      </div>
    </div>
  );
}
