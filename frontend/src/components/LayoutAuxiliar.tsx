import { Link, useNavigate } from 'react-router-dom';

interface LayoutAuxiliarProps {
  children: React.ReactNode;
  title: string;
}

function LayoutAuxiliar({ children, title }: LayoutAuxiliarProps) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Renacer</h1>
          <p className="text-sm text-gray-500 mt-1">Panel Auxiliar</p>
        </div>
        
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600">👤 {usuario.nombre || 'Auxiliar'}</p>
          <p className="text-xs text-gray-400">Rol: Auxiliar</p>
        </div>

        <nav className="mt-4">
          <Link to="/auxiliar" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">
            📊 Inicio
          </Link>
          <Link to="/auxiliar/vendedoras" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">
            👩 Vendedoras
          </Link>
          <Link to="/auxiliar/mensajes" className="block py-2 px-6 text-gray-700 hover:bg-gray-100">
            📬 Mensajes
          </Link>
        </nav>
      </div>

      {/* Header */}
      <div className="ml-64">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default LayoutAuxiliar;