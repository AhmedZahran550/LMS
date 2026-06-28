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

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authApis.verifyOtp(email, otp),
  });
};

export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApis.sendOtp(email),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApis.forgotPassword(email),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApis.resetPassword(token, newPassword),
  });
};
