import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';

function Login() {
  const navigate = useNavigate();
  const { error, handleError, clearError } = useErrorHandler();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateEmail(email)) {
      handleError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (!password.trim()) {
      handleError('La contraseña es requerida.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      const rol = response.data.usuario.rol;
      if (rol === 'ADMIN') navigate('/admin');
      else if (rol === 'AUXILIAR') navigate('/auxiliar');
      else navigate('/gerente');
    } catch (err: any) {
      handleError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate, handleError, clearError]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center py-4 px-6 md:px-10 bg-white/90 backdrop-blur-md fixed top-0 w-full z-10 shadow-sm" role="banner">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo Renacer - Sistema de gestión"
            className="h-8 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="font-bold text-xl text-renacer-600">Renacer</span>
        </div>
        <nav className="flex items-center gap-4" role="navigation" aria-label="Navegación principal">
          <Link to="/" className="text-gray-600 hover:text-renacer-600 transition" aria-label="Ir a consulta">
            Consulta
          </Link>
          <Link to="/login" className="bg-renacer-600 text-white px-4 py-2 rounded-lg hover:bg-renacer-700 transition" aria-label="Iniciar sesión">
            Iniciar Sesión
          </Link>
        </nav>
      </header>

      {/* Wrapper con dos columnas */}
      <div className="flex flex-col md:flex-row h-screen pt-16">

        {/* Lado izquierdo - Imagen con overlay */}
        <div
          className="flex-1 relative bg-cover bg-center flex items-center justify-center p-8"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e")' }}
          role="img"
          aria-label="Imagen de fondo representando el sistema Renacer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-black/80"></div>
          <div className="relative text-white max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Renacer Check In</h1>
            <p className="text-white/90 leading-relaxed">
              Sistema de gestión y verificación de vendedoras.
              <br /><br />
              Accede para administrar, validar y consultar el sistema.
            </p>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md" role="main" aria-labelledby="login-title">
            <h2 id="login-title" className="text-2xl font-bold text-texto mb-6">Iniciar Sesión</h2>

            {error.hasError && (
              <ErrorMessage
                message={error.message || 'Ha ocurrido un error'}
                className="mb-4"
              />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500 focus:border-transparent transition"
                  required
                  aria-describedby={error.hasError ? "error-message" : undefined}
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500 focus:border-transparent transition"
                  required
                  aria-describedby={error.hasError ? "error-message" : undefined}
                  disabled={loading}
                />
              </div>

              <div className="flex justify-between items-center mb-6 text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded"
                    aria-label="Recordarme en este dispositivo"
                  />
                  Recordarme
                </label>
                <a href="#" className="text-renacer-600 hover:text-renacer-700" aria-label="Recuperar contraseña">
                  ¿Olvidaste?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-renacer-600 to-renacer-800 text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-semibold"
                aria-label={loading ? "Cargando..." : "Iniciar sesión"}
              >
                {loading ? <LoadingSpinner size="sm" message="" /> : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;