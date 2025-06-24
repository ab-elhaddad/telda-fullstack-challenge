import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth.store";
import authService from "@/services/auth.service";
import {
  LoginCredentials,
  RegistrationData,
  UpdateProfileData,
  UpdatePasswordData,
  User,
} from "@/types/auth";

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
    setUser,
    setAccessToken,
    setLoading,
    setError,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Login failed. Please try again.";
      setLocalError(errorMessage);
      setError(errorMessage);
    },
  });

  // User profile query
  const { isFetching: isLoadingUser, refetch: refetchUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated, // Only run if user is authenticated
    staleTime: 5 * 60 * 1000, // Consider user data fresh for 5 minutes
    // onSuccess: (userData: User) => {
    //   setUser(userData);
    // },
    // onError: () => {
    //   // If fetching user fails, log out the user
    //   logout();
    // }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegistrationData) => authService.register(userData),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
      navigate("/login?registered=true");
      return data;
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      setLocalError(errorMessage);
      setError(errorMessage);
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => authService.updateProfile(data),
    onSuccess: (userData: User) => {
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      return userData;
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setLocalError(errorMessage);
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordData) => authService.changePassword(data),
    onSuccess: () => {
      return logout();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to change password. Please try again.";
      setLocalError(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      // Even if server logout fails, we clear local state
      storeLogout();
      queryClient.clear();
      navigate("/login");
    },
  });

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const tokens = await loginMutation.mutateAsync(credentials);
      const userData = await authService.getCurrentUser();
      storeLogin(userData, tokens.accessToken);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/movies");
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Register a new user
  const register = async (userData: RegistrationData) => {
    setLoading(true);
    try {
      const result = await registerMutation.mutateAsync(userData);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Log out the current user
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Even if the logout API call fails, clean up local state
      storeLogout();
      queryClient.clear();
      navigate("/login");
    }
  };

  // Update the user's profile
  const updateProfile = async (data: UpdateProfileData) => {
    return updateProfileMutation.mutateAsync(data);
  };

  // Change password
  const changePassword = async (data: UpdatePasswordData) => {
    return changePasswordMutation.mutateAsync(data);
  };

  // Clear any authentication errors
  const clearError = () => {
    setLocalError(null);
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading:
      isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      updateProfileMutation.isPending ||
      logoutMutation.isPending ||
      changePasswordMutation.isPending ||
      isLoadingUser,
    error: storeError || localError,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    refetchUser,
  };
};

export default useAuth;
