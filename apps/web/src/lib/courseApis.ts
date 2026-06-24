import { api } from './api';
import { useAuthStore } from '../store/useAuthStore';

const getUrl = (path: string) => {
  const { user } = useAuthStore.getState();
  const prefix = user?.role?.toLowerCase() === 'instructor' ? '/instructor' : '/learner';
  return `${prefix}${path}`;
};

export const courseApis = {
  getCourses: async () => {
    const response = await api.get(getUrl('/courses'));
    return response.data;
  },
  getCourse: async (courseId: string) => {
    const response = await api.get(getUrl(`/courses/${courseId}`));
    return response.data;
  },
  getCourseEnrollments: async (courseId: string) => {
    const response = await api.get(getUrl(`/courses/${courseId}/enrollments`));
    return response.data;
  },
  updateCourse: async (courseId: string, data: any) => {
    const response = await api.patch(getUrl(`/courses/${courseId}`), data);
    return response.data;
  },
  createCourse: async (data: any) => {
    const response = await api.post(getUrl('/courses'), data);
    return response.data;
  },
  uploadVideo: async (courseId: string, formData: FormData, config?: any) => {
    const response = await api.post(getUrl(`/courses/${courseId}/videos`), formData, config);
    return response.data;
  },
  inviteInstructor: async (courseId: string, email: string) => {
    const response = await api.post(getUrl(`/courses/${courseId}/invite`), { email });
    return response.data;
  },
  enrollInCourse: async (courseId: string) => {
    const response = await api.post(getUrl(`/courses/${courseId}/enroll`));
    return response.data;
  },
};

