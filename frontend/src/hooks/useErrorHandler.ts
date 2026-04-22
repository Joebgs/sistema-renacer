import { useState, useCallback } from 'react';

/**
 * ESTADO DE ERROR
 * Representa el estado de error en el componente
 */
interface ErrorState {
  message: string | null;
  hasError: boolean;
}

/**
 * HOOK USE ERROR HANDLER
 *
 * Hook personalizado para manejo centralizado de errores en componentes.
 * Proporciona funciones para manejar, limpiar y envolver operaciones asíncronas.
 *
 * @returns Object con estado de error y funciones de manejo
 *
 * @example
 * ```typescript
 * const { error, handleError, clearError, wrapAsync } = useErrorHandler();
 *
 * // Mostrar error
 * handleError('Error al cargar datos');
 *
 * // Envolver función async
 * const data = await wrapAsync(fetchData, 'Error al cargar');
 *
 * // Limpiar error
 * clearError();
 * ```
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({ message: null, hasError: false });

  /**
   * MANEJAR ERROR
   * Establece un mensaje de error y marca que hay un error activo
   *
   * @param message - Mensaje de error a mostrar
   */
  const handleError = useCallback((message: string) => {
    setError({ message, hasError: true });
  }, []);

  /**
   * LIMPIAR ERROR
   * Remueve el mensaje de error y marca que no hay error activo
   */
  const clearError = useCallback(() => {
    setError({ message: null, hasError: false });
  }, []);

  /**
   * ENVOLVER FUNCIÓN ASÍNCRONA
   * Ejecuta una función async y maneja errores automáticamente
   *
   * @param asyncFn - Función asíncrona a ejecutar
   * @param errorMessage - Mensaje de error si falla (opcional)
   * @returns Resultado de la función o null si hay error
   */
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