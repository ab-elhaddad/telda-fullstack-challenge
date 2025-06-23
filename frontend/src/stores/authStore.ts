import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '@/services/api/authService';
import { User, LoginCredentials, RegisterData, UpdateProfileData } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  
  // User state actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Token management
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);
          set({ 
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            isLoading: false,
            error: error.message || 'Failed to login'
          });
          throw error;
        }
      },
      
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register(userData);
          set({ 
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            isLoading: false,
            error: error.message || 'Failed to register'
          });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          // Clear token from localStorage
          localStorage.removeItem('accessToken');
        }
      },
      
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const updatedUser = await authService.updateProfile(data);
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            isLoading: false,
            error: error.message || 'Failed to update profile'
          });
          throw error;
        }
      },
      
      refreshToken: async () => {
        try {
          const tokens = await authService.refreshToken();
          return !!tokens.access_token;
        } catch (error) {
          // If refresh token fails, clear user state
          set({ 
            user: null,
            isAuthenticated: false
          });
          return false;
        }
      },
      
      checkAuth: async () => {
        const { user } = get();
        
        // If we already have a user, consider authenticated
        if (user) {
          return true;
        }
        
        try {
          set({ isLoading: true });
          
          // Check if token exists
          if (!authService.isAuthenticated()) {
            set({ isLoading: false });
            return false;
          }
          
          // Fetch current user profile
          const currentUser = await authService.getCurrentUser();
          set({ 
            user: currentUser,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } catch (error) {
          console.error('Authentication check failed:', error);
          
          // Try to refresh token
          const refreshed = await get().refreshToken();
          if (refreshed) {
            try {
              // Try again with new token
              const currentUser = await authService.getCurrentUser();
              set({ 
                user: currentUser,
                isAuthenticated: true,
                isLoading: false
              });
              return true;
            } catch {
              set({ 
                user: null,
                isAuthenticated: false,
                isLoading: false
              });
              return false;
            }
          }
          
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
