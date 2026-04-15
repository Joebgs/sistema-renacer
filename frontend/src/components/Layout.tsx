import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

function Layout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const rol = usuario.rol;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const menuItems = () => {
    if (rol === 'ADMIN') {
      return (
        <>
          <Link to="/admin" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">📊 Inicio</Link>
          <Link to="/admin/vendedoras" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">👩 Vendedoras</Link>
          <Link to="/admin/usuarios" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">👥 Usuarios</Link>
          <Link to="/admin/mensajes" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">📬 Mensajes</Link>
          <Link to="/admin/seguridad" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">🛡️ Seguridad</Link>
        </>
      );
    } else if (rol === 'AUXILIAR') {
      return (
        <>
          <Link to="/auxiliar" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">📊 Inicio</Link>
          <Link to="/auxiliar/vendedoras" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">👩 Vendedoras</Link>
          <Link to="/auxiliar/mensajes" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">📬 Mensajes</Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/gerente" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">📊 Inicio</Link>
          <Link to="/gerente/vendedoras" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">👩 Mis Vendedoras</Link>
          <Link to="/gerente/mensajes" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">📬 Mensajes</Link>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition">
            Renacer
          </Link>
          <p className="text-sm text-gray-500 mt-1">Sistema interno</p>
        </div>
        
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600">👤 {usuario.nombre || 'Usuario'}</p>
          <p className="text-xs text-gray-400">Rol: {rol}</p>
        </div>

        <nav className="mt-4">
          {menuItems()}
        </nav>
      </div>

      {/* Sidebar Móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white w-64 h-full p-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <Link to="/" onClick={() => setMenuAbierto(false)} className="text-xl font-bold text-gray-800 hover:text-blue-600">
                Renacer
              </Link>
              <button onClick={() => setMenuAbierto(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">👤 {usuario.nombre || 'Usuario'}</p>
              <p className="text-xs text-gray-400">Rol: {rol}</p>
            </div>
            <nav onClick={() => setMenuAbierto(false)}>
              {menuItems()}
              <button onClick={handleLogout} className="block w-full text-left py-2 px-6 text-red-600 hover:bg-gray-100 mt-4">
                🚪 Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="md:ml-64">
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(true)} className="md:hidden text-2xl">
              ☰
            </button>
            <Link to="/" className="text-lg md:text-xl font-bold text-gray-800 hover:text-blue-600 transition">
              🏠 Inicio
            </Link>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">{title}</h2>
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

export default Layout;