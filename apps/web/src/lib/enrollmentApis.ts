import { roleApi } from './api';
import { EnrollmentStatus } from '@lms/shared-types';

export const enrollmentApis = {
  requestEnrollment: async (courseId: string) => {
    const response = await roleApi.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
  respondEnrollment: async (enrollmentId: string, status: EnrollmentStatus) => {
    const response = await roleApi.patch(`/enrollments/${enrollmentId}/respond`, { status });
    return response.data;
  },
  removeStudent: async (enrollmentId: string) => {
    const response = await roleApi.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  }
};
