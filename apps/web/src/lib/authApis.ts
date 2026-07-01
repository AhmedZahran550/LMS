import { api } from './api';

export const authApis = {
  login: async (data: any) => {
    const payload = { ...data, client: 'web' };
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },
  sendOtp: async (email: string) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};
