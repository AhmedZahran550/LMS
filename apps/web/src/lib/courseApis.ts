import { roleApi } from "./api";

export const courseApis = {
  getCourses: async (params?: any) => {
    const response = await roleApi.get("/courses", { params });
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await roleApi.get("/courses/stats/dashboard");
    return response.data;
  },
  getCourse: async (courseId: string) => {
    const response = await roleApi.get(`/courses/${courseId}`);
    return response.data;
  },
  getCourseEnrollments: async (courseId: string) => {
    const response = await roleApi.get(`/courses/${courseId}/enrollments`);
    return response.data;
  },
  updateCourse: async (courseId: string, data: any) => {
    const response = await roleApi.patch(`/courses/${courseId}`, data);
    return response.data;
  },
  createCourse: async (data: any) => {
    const response = await roleApi.post("/courses", data);
    return response.data;
  },
  uploadVideo: async (courseId: string, formData: FormData, config?: any) => {
    const response = await roleApi.post(
      `/courses/${courseId}/videos`,
      formData,
      config,
    );
    return response.data;
  },
  inviteInstructor: async (courseId: string, email: string) => {
    const response = await roleApi.post(`/courses/${courseId}/invite`, {
      email,
    });
    return response.data;
  },
  enrollInCourse: async (courseId: string) => {
    const response = await roleApi.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
  getMyCourses: async () => {
    const response = await roleApi.get("/my-courses");
    return response.data;
  },
  getMyCourse: async (courseId: string) => {
    const response = await roleApi.get(`/my-courses/${courseId}`);
    return response.data;
  },
};
