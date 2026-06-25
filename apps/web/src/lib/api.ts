import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setTokens(accessToken, newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export const getRoleUrl = (path: string) => {
  const { user } = useAuthStore.getState();
  const prefix =
    user?.role?.toLowerCase() === "instructor" ? "/instructor" : "/learner";
  return `${prefix}${path}`;
};

export const roleApi = {
  get: <T = any>(url: string, config?: any) => api.get<T>(getRoleUrl(url), config),
  post: <T = any>(url: string, data?: any, config?: any) => api.post<T>(getRoleUrl(url), data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => api.patch<T>(getRoleUrl(url), data, config),
  delete: <T = any>(url: string, config?: any) => api.delete<T>(getRoleUrl(url), config),
};
