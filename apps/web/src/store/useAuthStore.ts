import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@lms/shared-types';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setHasHydrated: (state: boolean) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'lms-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);


