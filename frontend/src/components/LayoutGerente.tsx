import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface LayoutGerenteProps {
  children: React.ReactNode;
  title: string;
}

function LayoutGerente({ children, title }: LayoutGerenteProps) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-renacer-600 shadow-lg">
        <div className="p-6 border-b border-renacer-500">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Renacer" 
              className="h-16 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <p className="text-white text-center text-sm mt-2 opacity-80">Panel Gerente</p>
        </div>
        
        <div className="p-4 border-b border-renacer-500 bg-renacer-700">
          <p className="text-sm text-white">👤 {usuario.nombre || 'Gerente'}</p>
          <p className="text-xs text-white opacity-70">Gerente de Zona</p>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          <Link to="/gerente" className="block py-2 px-6 text-white hover:bg-renacer-700 rounded-lg transition">
            📊 Inicio
          </Link>
          <Link to="/gerente/vendedoras" className="block py-2 px-6 text-white hover:bg-renacer-700 rounded-lg transition">
            👩 Mis Vendedoras
          </Link>
          <Link to="/gerente/mensajes" className="block py-2 px-6 text-white hover:bg-renacer-700 rounded-lg transition">
            📬 Mensajes
          </Link>
          <button onClick={handleLogout} className="w-full text-left block py-2 px-6 text-white hover:bg-renacer-700 rounded-lg transition mt-4">
            🚪 Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Sidebar Móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-renacer-600 w-64 h-full p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-renacer-500">
              <img 
                src="/logo.png" 
                alt="Renacer" 
                className="h-12 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button onClick={() => setMenuAbierto(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="mb-4 pb-4 border-b border-renacer-500">
              <p className="text-sm text-white">👤 {usuario.nombre || 'Gerente'}</p>
              <p className="text-xs text-white opacity-70">Gerente de Zona</p>
            </div>
            <nav onClick={() => setMenuAbierto(false)} className="space-y-1">
              <Link to="/gerente" className="block py-2 px-4 text-white hover:bg-renacer-700 rounded-lg transition">📊 Inicio</Link>
              <Link to="/gerente/vendedoras" className="block py-2 px-4 text-white hover:bg-renacer-700 rounded-lg transition">👩 Mis Vendedoras</Link>
              <Link to="/gerente/mensajes" className="block py-2 px-4 text-white hover:bg-renacer-700 rounded-lg transition">📬 Mensajes</Link>
              <button onClick={handleLogout} className="w-full text-left block py-2 px-4 text-white hover:bg-renacer-700 rounded-lg transition mt-4">
                🚪 Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="md:ml-64">
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(true)} className="md:hidden text-2xl text-renacer-600">
              ☰
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Renacer" 
                className="h-8 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-lg md:text-xl font-bold text-renacer-600 hover:text-renacer-700 transition">
                Inicio
              </span>
            </Link>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-texto">{title}</h2>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800 text-sm">
            Cerrar Sesión
          </button>
        </header>

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default LayoutGerente;