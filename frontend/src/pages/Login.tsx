import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await auth.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      const rol = response.data.usuario.rol;
      if (rol === 'ADMIN') window.location.href = '/admin';
      else if (rol === 'AUXILIAR') window.location.href = '/auxiliar';
      else window.location.href = '/gerente';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center py-4 px-6 md:px-10 bg-white/90 backdrop-blur-md fixed top-0 w-full z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Renacer" 
            className="h-8 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="font-bold text-xl text-renacer-600">Renacer</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-renacer-600 transition">Consulta</Link>
          <Link to="/login" className="bg-renacer-600 text-white px-4 py-2 rounded-lg hover:bg-renacer-700 transition">
            Iniciar Sesión
          </Link>
        </nav>
      </header>

      {/* Wrapper con dos columnas */}
      <div className="flex flex-col md:flex-row h-screen pt-16">
        
        {/* Lado izquierdo - Imagen con overlay */}
        <div className="flex-1 relative bg-cover bg-center flex items-center justify-center p-8"
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e")' }}>
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
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-texto mb-6">Iniciar Sesión</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div className="flex justify-between items-center mb-6 text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="rounded" /> Recordarme
                </label>
                <a href="#" className="text-renacer-600 hover:text-renacer-700">¿Olvidaste?</a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-renacer-600 to-renacer-800 text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;