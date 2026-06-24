import { api } from './api';

export const profileApis = {
  getProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },
  updateProfile: async (data: { firstName: string; lastName: string }) => {
    const response = await api.patch('/profile/me', data);
    return response.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/profile/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
