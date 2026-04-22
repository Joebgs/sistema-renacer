import React from 'react';
import ErrorMessage from './ErrorMessage';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Ups! Algo salió mal
              </h2>
              <ErrorMessage
                message="Ha ocurrido un error inesperado. Por favor, intenta recargar la página."
                onRetry={() => window.location.reload()}
                className="mb-4"
              />
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;