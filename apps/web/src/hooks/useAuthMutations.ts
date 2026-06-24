import { useMutation } from '@tanstack/react-query';
import { authApis } from '@/lib/authApis';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: any) => authApis.login(data),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: any) => authApis.register(data),
  });
};

export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApis.resendVerification(email),
  });
};
