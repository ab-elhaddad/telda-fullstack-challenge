import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth.store";
// Import types from our updated auth.ts
import {
  LoginCredentials,
  RegistrationData,
  UpdateProfileData,
  UpdatePasswordData,
  User,
  AuthTokens
} from "@/types/auth";


// Create axios instance with base configuration
const authApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies (refresh token)
});

// Add request interceptor to include auth token
authApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      try {
        // Attempt to refresh the token
        const response = await authApi.post<{ accessToken: string }>(
          "/auth/refresh-token"
        );
        const { accessToken } = response.data;

        // Update the token in the store
        useAuthStore.getState().setAccessToken(accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await authApi.post<AuthTokens>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  async register(userData: RegistrationData): Promise<AuthTokens> {
    const response = await authApi.post<AuthTokens>(
      "/auth/register",
      userData
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await authApi.post("/auth/logout");
    useAuthStore.getState().logout();
  },

  async getCurrentUser(): Promise<User> {
    const response = await authApi.get<User>("/auth/me");
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<{ user: User }> {
    const response = await authApi.put<{ user: User }>(
      "/auth/profile",
      data
    );
    return response.data;
  },

  async changePassword(data: UpdatePasswordData): Promise<{ message: string }> {
    const response = await authApi.put<{ message: string }>(
      "/auth/password",
      data
    );
    return response.data;
  },
};

export default authService;
