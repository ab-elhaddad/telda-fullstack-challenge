import { AxiosError } from 'axios';
import { notificationService } from './notificationService';

/**
 * Format and handle specific API error types
 */
export function formatApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle Axios specific errors
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 422:
          // Validation errors
          if (data?.errors) {
            return Object.values(data.errors).join(', ');
          }
          return 'Validation failed. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          // Try to extract error message from response data
          if (data?.message) {
            return data.message;
          } else if (typeof data === 'string') {
            return data;
          }
      }
    } else if (error.request) {
      // The request was made but no response was received
      return 'No response from server. Please check your internet connection.';
    }
    
    return error.message || 'An unexpected error occurred';
  }
  
  // Handle non-axios errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Global error handler function
 */
export function handleGlobalError(error: unknown): void {
  const errorMessage = formatApiError(error);
  notificationService.error(errorMessage);
  
  // Optionally log to error tracking service
  console.error('Global error:', error);
}

/**
 * Custom error types
 */
export class ValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Create a query error handler for React Query
 */
export function createQueryErrorHandler(customHandler?: (error: unknown) => void) {
  return (error: unknown) => {
    // Call custom handler if provided
    if (customHandler) {
      customHandler(error);
    }
    
    // Default error handling
    handleGlobalError(error);
  };
}
