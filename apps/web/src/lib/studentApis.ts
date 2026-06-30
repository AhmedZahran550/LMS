import { roleApi, api } from './api';

export const studentApis = {
  searchInstructors: async (query: string, page = 1, limit = 20) => {
    const response = await roleApi.get(`/instructors?q=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },
  requestToJoin: async (instructorId: string) => {
    const response = await roleApi.post(`/instructors/${instructorId}/join`);
    return response.data;
  },
  myInstructors: async () => {
    const response = await roleApi.get('/my-instructors');
    return response.data;
  },
  acceptInvitation: async (token: string) => {
    const response = await api.get(`/learner/invitations/accept?token=${token}`);
    return response.data;
  },
};
