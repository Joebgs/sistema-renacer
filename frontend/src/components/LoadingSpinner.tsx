/**
 * COMPONENTE LOADING SPINNER
 *
 * Componente reutilizable para mostrar estados de carga con diferentes variantes
 * Incluye animaciones, tamaños personalizables y mensajes opcionales
 */

interface LoadingSpinnerProps {
  /** Variante de animación del spinner */
  variant?: 'spinner' | 'dots' | 'pulse';
  /** Tamaño del spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Mensaje a mostrar debajo del spinner */
  message?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Si debe mostrar un overlay oscuro */
  overlay?: boolean;
  /** Color del spinner (por defecto usa el tema renacer) */
  color?: string;
}

/**
 * COMPONENTE LOADING SPINNER
 *
 * @param variant - Tipo de animación ('spinner', 'dots', 'pulse')
 * @param size - Tamaño del componente ('sm', 'md', 'lg')
 * @param message - Texto opcional debajo del spinner
 * @param className - Clases CSS adicionales
 * @param overlay - Si mostrar overlay oscuro de fondo
 * @param color - Color personalizado del spinner
 *
 * @example
 * ```tsx
 * // Spinner básico
 * <LoadingSpinner />
 *
 * // Con mensaje personalizado
 * <LoadingSpinner message="Guardando cambios..." />
 *
 * // Con overlay
 * <LoadingSpinner overlay size="lg" message="Cargando datos..." />
 *
 * // Variante dots
 * <LoadingSpinner variant="dots" size="sm" />
 * ```
 */
function LoadingSpinner({
  variant = 'spinner',
  size = 'md',
  message = 'Cargando...',
  className = '',
  overlay = false,
  color = 'border-renacer-600'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`w-2 h-2 bg-${color.replace('border-', '')} rounded-full animate-bounce`}></div>
            <div className={`w-2 h-2 bg-${color.replace('border-', '')} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-2 h-2 bg-${color.replace('border-', '')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`rounded-full ${sizeClasses[size]} bg-${color.replace('border-', '')} animate-pulse`}></div>
        );

      default: // 'spinner'
        return (
          <div className={`animate-spin rounded-full border-b-2 ${color} ${sizeClasses[size]}`}></div>
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      {renderSpinner()}
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;

export default LoadingSpinner;