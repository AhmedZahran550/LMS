import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: any) => apiClient.auth.login(data),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: any) => apiClient.auth.register(data),
  });
};
