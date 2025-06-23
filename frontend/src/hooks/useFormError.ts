import { useState, useCallback } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Custom hook for consistent form error handling
 * Works with react-hook-form and our FormError component
 */
export function useFormError<T extends FieldValues>() {
  const [apiError, setApiError] = useState<string | null>(null);

  /**
   * Clear API error message
   */
  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  /**
   * Set API error message
   */
  const setError = useCallback((error: string | null) => {
    setApiError(error);
  }, []);

  /**
   * Handle form submission with API error handling
   * @param form - react-hook-form's form instance
   * @param submitFn - function to call for form submission
   * @returns A submit handler function that manages errors
   */
  const handleSubmit = useCallback(
    <R>(form: UseFormReturn<T>, submitFn: (data: T) => Promise<R>) => {
      return form.handleSubmit(async (data) => {
        clearApiError();
        
        try {
          await submitFn(data);
        } catch (error) {
          if (error instanceof Error) {
            setApiError(error.message);
          } else {
            setApiError('An unexpected error occurred');
          }
        }
      });
    },
    [clearApiError]
  );

  return {
    apiError,
    setApiError,
    clearApiError,
    handleSubmit,
    setError,
  };
}
