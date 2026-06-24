import { api } from './api';

export const enrollmentApis = {
  respondEnrollment: async (id: string, status: string) => {
    const response = await api.patch(`/enrollments/${id}/respond`, { status });
    return response.data;
  },
};
