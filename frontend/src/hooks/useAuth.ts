import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useAuthStore from '@/stores/authStore';
import authService from '@/services/api/authService';
import { LoginCredentials, RegisterData, UpdateProfileData } from '@/types/auth';

/**
 * Custom hook for authentication operations
 * Provides methods for login, register, logout, and profile management
 */
const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Get auth state and actions from Zustand store
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    error: storeError,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    updateProfile: storeUpdateProfile,
    setError
  } = useAuthStore();
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => storeLogin(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/movies');
    }
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => storeRegister(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/movies');
    }
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => storeUpdateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: storeLogout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    }
  });
  
  // User profile query
  const { 
    isFetching: isLoadingUser,
    refetch: refetchUser 
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated, // Only run if user is authenticated
    staleTime: 5 * 60 * 1000, // Consider user data fresh for 5 minutes
  });
  
  // Login handler
  const login = (credentials: LoginCredentials) => {
    setLocalError(null);
    loginMutation.mutate(credentials);
  };

  // Register a new user
  const register = (userData: RegisterData) => {
    setLocalError(null);
    registerMutation.mutate(userData);
  };

  // Log out the current user
  const logout = () => {
    logoutMutation.mutate();
  };

  // Update the user's profile
  const updateProfile = (data: UpdateProfileData) => {
    setLocalError(null);
    updateProfileMutation.mutate(data);
  };

  // Check if the current user is authenticated
  const checkAuth = async () => {
    return await useAuthStore.getState().checkAuth();
  };

  // Clear any authentication errors
  const clearError = () => {
    setLocalError(null);
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || 
               updateProfileMutation.isPending || logoutMutation.isPending || isLoadingUser,
    error: storeError || localError,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    clearError,
    refetchUser
  };
};

export default useAuth;
