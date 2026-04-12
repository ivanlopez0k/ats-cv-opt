import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
  isEmailVerified?: boolean;
  nationality?: string;
  defaultTargetJob?: string;
  defaultTargetIndustry?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  needsEmailVerification: () => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      needsEmailVerification: () => {
        const { user } = get();
        return !!user && user.isEmailVerified === false;
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'cvmaster-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
          // Clear stale auth data if it looks corrupted
          if (state.refreshToken && !state.user) {
            state.logout();
          }
        }
      },
    }
  )
);
