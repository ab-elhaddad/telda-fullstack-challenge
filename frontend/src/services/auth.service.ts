import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth.store";
// Import types from our updated auth.ts
import {
  LoginCredentials,
  RegistrationData,
  UpdateProfileData,
  UpdatePasswordData,
  User,
  AuthTokens,
} from "@/types/auth";

// Define API response structure
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

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
    }

    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await authApi.post<
      ApiResponse<AuthTokens & { user: User }>
    >("/auth/login", credentials);
    return response.data.data; // Extract the data from the API response
  },

  async register(userData: RegistrationData) {
    const response = await authApi.post<
      ApiResponse<AuthTokens & { user: User }>
    >("/auth/register", userData);
    return response.data.data; // Extract the data from the API response
  },

  async logout() {
    await authApi.post("/auth/logout");
    useAuthStore.getState().logout();
  },

  async getCurrentUser() {
    const response = await authApi.get<ApiResponse<User>>("/auth/me");
    return response.data.data; // Extract the user data from the API response
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await authApi.put<ApiResponse<User>>(
      "/auth/profile",
      data
    );
    return response.data.data; // Extract the user data from the API response
  },

  async changePassword(data: UpdatePasswordData) {
    const response = await authApi.put<ApiResponse<{ success: boolean }>>(
      "/auth/password",
      data
    );
    return { message: response.data.message };
  },
};

export default authService;
