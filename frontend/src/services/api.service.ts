/**
 * API Service for handling API requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  headers?: HeadersInit;
  body?: any;
  params?: Record<string, string>;
}

/**
 * Handles API requests with standard error handling and authentication
 */
class ApiService {
  /**
   * Send a GET request to the API
   */
  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Send a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Send a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Send a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Build a URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${API_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Handle API response with standard error handling
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        errors: errorData.errors,
      };
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
