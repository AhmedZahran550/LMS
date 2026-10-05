import { roleApi, api } from "./api";

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
  getCourseContents: async (courseId: string, params?: any) => {
    const response = await roleApi.get(`/courses/${courseId}/content`, { params });
    return response.data;
  },
  initUploadSession: async (courseId: string, params: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    title: string;
    description?: string;
    isPreview?: boolean;
  }) => {
    const response = await roleApi.post(
      `/courses/${courseId}/content/upload-session`,
      params,
    );
    return response.data;
  },
  completeUpload: async (
    courseId: string,
    data: {
      sessionId: string;
      title: string;
      description?: string;
      isPreview?: boolean;
      cloudinaryResult?: {
        publicId: string;
        secureUrl: string;
        bytes?: number;
        resourceType?: string;
        format?: string;
      };
    },
  ) => {
    const response = await roleApi.post(
      `/courses/${courseId}/content/complete-upload`,
      data,
    );
    return response.data;
  },
  getUploadStatus: async (sessionId: string) => {
    const response = await api.get(`/uploads/session/${sessionId}/status`);
    return response.data;
  },
  abortUploadSession: async (sessionId: string) => {
    const response = await api.delete(`/uploads/session/${sessionId}`);
    return response.data;
  },
  deleteContent: async (courseId: string, contentId: string) => {
    const response = await roleApi.delete(`/courses/${courseId}/content/${contentId}`);
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
  getLearnerCourseContents: async (courseId: string, params?: any) => {
    const response = await roleApi.get(`/my-courses/${courseId}/content`, { params });
    return response.data;
  },
};
