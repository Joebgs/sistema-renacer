import { useState, useCallback } from 'react';

interface ErrorState {
  message: string | null;
  hasError: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({ message: null, hasError: false });

  const handleError = useCallback((message: string) => {
    setError({ message, hasError: true });
  }, []);

  const clearError = useCallback(() => {
    setError({ message: null, hasError: false });
  }, []);

  const wrapAsync = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    errorMessage = 'Ha ocurrido un error inesperado'
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (err) {
      handleError(errorMessage);
      console.error(err);
      return null;
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    wrapAsync,
  };
};