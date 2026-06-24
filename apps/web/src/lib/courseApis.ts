import { api } from './api';

export const courseApis = {
  getCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  getCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },
  getCourseEnrollments: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/enrollments`);
    return response.data;
  },
  updateCourse: async (courseId: string, data: any) => {
    const response = await api.patch(`/courses/${courseId}`, data);
    return response.data;
  },
  createCourse: async (data: any) => {
    const response = await api.post('/courses', data);
    return response.data;
  },
  uploadVideo: async (courseId: string, formData: FormData, config?: any) => {
    const response = await api.post(`/courses/${courseId}/videos`, formData, config);
    return response.data;
  },
  inviteInstructor: async (courseId: string, email: string) => {
    const response = await api.post(`/courses/${courseId}/invite`, { email });
    return response.data;
  },
  enrollInCourse: async (courseId: string) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
};
