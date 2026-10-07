'use client';

import { useQuery } from '@tanstack/react-query';
import { authApis } from '@/lib/authApis';

export function useAcademicHierarchy() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['universities'],
    queryFn: () => authApis.getUniversities(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    universities: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
