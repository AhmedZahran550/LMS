import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApis } from '@/lib/profileApis';
import { useAuthStore } from '@/store/useAuthStore';

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApis.getProfile(),
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateUserStore = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) =>
      profileApis.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUserStore({
        firstName: data.firstName,
        lastName: data.lastName,
      });
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();
  const updateUserStore = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (file: File) => profileApis.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUserStore({
        profileImageUrl: data.profileImageUrl,
      });
    },
  });
};
