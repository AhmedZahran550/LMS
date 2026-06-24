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
};
