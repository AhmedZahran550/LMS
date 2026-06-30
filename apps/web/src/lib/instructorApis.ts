import { roleApi } from "./api";

export const instructorApis = {
  getInstructors: async (params?: any) => {
    const response = await roleApi.get("/instructors", { params });
    return response.data;
  },
  getInstructor: async (id: string) => {
    const response = await roleApi.get(`/instructors/${id}`);
    return response.data;
  },
  inviteStudent: async (email: string) => {
    const response = await roleApi.post("/students/invite", { email });
    return response.data;
  },
  listStudents: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await roleApi.get("/students", { params });
    return response.data;
  },
  listRequests: async (params?: { page?: number; limit?: number }) => {
    const response = await roleApi.get("/students/requests", { params });
    return response.data;
  },
  respondToRequest: async (id: string, action: 'approve' | 'decline') => {
    const response = await roleApi.patch(`/students/requests/${id}/respond`, { action });
    return response.data;
  },
  removeStudent: async (id: string) => {
    const response = await roleApi.delete(`/students/${id}`);
    return response.data;
  },
  assignCourses: async (studentId: string, courseIds?: string[]) => {
    const body = courseIds ? { courseIds } : {};
    const response = await roleApi.post(`/students/${studentId}/assign`, body);
    return response.data;
  },
  getAssignments: async (studentId: string) => {
    const response = await roleApi.get(`/students/${studentId}/assignments`);
    return response.data;
  },
};
