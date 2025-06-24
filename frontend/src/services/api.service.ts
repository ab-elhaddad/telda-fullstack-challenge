const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// API response structure from the backend
export interface Pagination {
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface ApiOptions {
  headers?: HeadersInit;
  body?: any;
  params?: Record<string, string>;
}

class ApiService {
  async get<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    return this.handleResponse<T>(response);
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${API_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        errors: errorData.errors,
      };
    }

    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
