import { useState, useCallback } from 'react';
import { ApiError } from '@/services/api/apiClient';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  autoExecute?: boolean;
}

/**
 * Custom hook for handling API requests with loading and error states
 * @param apiFunction The async API function to execute
 * @param options Additional options for success/error handling and auto-execution
 * @returns Object containing data, loading state, error, and execute function
 */
function useApi<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError, autoExecute = false } = options;
  
  // State for loading, data, and error
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: autoExecute,
    error: null,
  });
  
  // Execute the API function with the provided arguments
  const execute = useCallback(
    async (...args: P) => {
      // Reset state before executing
      setState({ data: null, isLoading: true, error: null });
      
      try {
        // Execute the API function
        const result = await apiFunction(...args);
        
        // Update state with the result
        setState({
          data: result,
          isLoading: false,
          error: null,
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        // Extract error message
        const errorMessage = err instanceof Error 
          ? err.message 
          : (err as ApiError)?.message || 'Something went wrong';
        
        // Update state with the error
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        
        // Call onError callback if provided
        if (onError) {
          onError(errorMessage);
        }
        
        // Re-throw the error for further handling
        throw err;
      }
    },
    [apiFunction, onSuccess, onError]
  );
  
  // Auto-execute the API function if requested
  useCallback(() => {
    if (autoExecute) {
      execute([] as unknown as P);
    }
  }, [autoExecute, execute]);
  
  return {
    ...state,
    execute,
    // Utility methods for managing state
    reset: () => setState({ data: null, isLoading: false, error: null }),
    setData: (data: T) => setState(prev => ({ ...prev, data })),
  };
}

export default useApi;
