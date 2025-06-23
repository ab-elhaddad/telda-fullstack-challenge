import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/services/api/apiClient';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default query options
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404s or authentication errors
        const apiError = error as ApiError;
        if (apiError.status === 404 || apiError.status === 401 || apiError.status === 403) {
          return false;
        }
        
        // Retry up to 2 times on other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
    },
    mutations: {
      // Default mutation options
      retry: false, // Don't retry mutations by default
      networkMode: 'always', // Always attempt network requests
    }
  }
});

export default queryClient;
