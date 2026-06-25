import { roleApi } from './api';

export const enrollmentApis = {
  respondEnrollment: async (id: string, status: string) => {
    const response = await roleApi.patch(`/enrollments/${id}/respond`, { status });
    return response.data;
  },
};
