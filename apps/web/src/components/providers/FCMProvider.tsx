'use client';

import React from 'react';
import { useFCM } from '@/hooks/useFCM';

export const FCMProvider = ({ children }: { children: React.ReactNode }) => {
  useFCM();
  return <>{children}</>;
};
