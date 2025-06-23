import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleGlobalError } from '../errorHandler';
import useAuthStore from '@/stores/authStore';

// Define API error types
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

// Define API response type
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies (refresh tokens)
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');
        // If token exists, add it to the authorization header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        // Extract response and request config
        const originalRequest = error.config;
        
        // If the error is unauthorized and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the access token using the refresh token in HttpOnly cookie
            const response = await axios.post<{ accessToken: string }>(
              `${this.baseURL}/auth/refresh`, 
              {}, 
              { withCredentials: true }
            );
            
            const { accessToken } = response.data;
            
            // Update the token in localStorage
            localStorage.setItem('accessToken', accessToken);
            
            // Update the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            // Retry the original request with the new token
            return this.client(originalRequest);
          } catch (refreshError) {
            // If we can't refresh the token, clear auth and redirect to login
            localStorage.removeItem('accessToken');
            const authStore = useAuthStore.getState();
            authStore.logout();
            
            // Handle the refresh error
            handleGlobalError(refreshError);
            
            // Redirect to login page
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        // Handle all other errors globally but don't block the rejection
        handleGlobalError(error);
        
        // Format error response
        const apiError: ApiError = {
          status: error.response?.status || 500,
          message: this.extractErrorMessage(error),
          details: error.response?.data,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      // Try to extract message from response data
      const data = error.response.data as Record<string, any>;
      if (data.message) return data.message;
      if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
    
    // Fallback messages based on status codes
    if (error.response) {
      switch (error.response.status) {
        case 400: return 'Bad request';
        case 401: return 'Unauthorized';
        case 403: return 'Forbidden';
        case 404: return 'Resource not found';
        case 422: return 'Validation error';
        case 429: return 'Too many requests';
        case 500: return 'Internal server error';
        default: return `Server error (${error.response.status})`;
      }
    }
    
    // Network errors or other issues
    if (error.code === 'ECONNABORTED') return 'Request timed out';
    if (!navigator.onLine) return 'No internet connection';
    
    return error.message || 'Something went wrong';
  }

  // Centralized error handler helper method
  private handleResponseError(error: unknown): string {
    if (error instanceof AxiosError) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
    }
    return error instanceof Error ? error.message : 'An unknown error occurred';
  }

  // Generic GET request
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(endpoint, config);
    return response.data.data;
  }

  // Generic POST request
  async post<T = any>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(endpoint, data, config);
    return response.data.data;
  }

  // Generic PUT request
  async put<T = any>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(endpoint, data, config);
    return response.data.data;
  }

  // Generic DELETE request
  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(endpoint, config);
    return response.data.data;
  }

  // Generic PATCH request
  async patch<T = any>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(endpoint, data, config);
    return response.data.data;
  }
}

// Create and export default instance
const apiClient = new ApiClient();
export default apiClient;
