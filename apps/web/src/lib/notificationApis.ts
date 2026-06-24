import { api } from './api';

export const notificationApis = {
  getNotifications: async () => {
    const response = await api.get('/learner/notifications');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/learner/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.post('/learner/notifications/read-all');
    return response.data;
  },
};
