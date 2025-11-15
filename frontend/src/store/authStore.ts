import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, RegisterData, User } from '@/types/auth';
import { authService } from '@/services/auth.service';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Start with true to wait for hydration
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const data = await authService.login(credentials);
          
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store tokens in localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          await authService.register(data);
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (refreshToken) {
          authService.logout(refreshToken).catch(console.error);
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set loading to false
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

