/**
 * COMPONENTE LAYOUT GENÉRICO
 *
 * Estructura base para paneles protegidos (Admin, Auxiliar, Gerente)
 * - Sidebar configurable con menú dinámico
 * - Header con logout
 * - Diseño responsive opcional
 * - Accesibilidad mejorada
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import { MenuItem } from '../constants/layout';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  menuItems: MenuItem[];
  sidebarBg: string;
  sidebarBorder: string;
  sidebarHover: string;
  userBg: string;
  panelTitle: string;
  showMobileMenu?: boolean;
}

function Layout({
  children,
  title,
  menuItems,
  sidebarBg,
  sidebarBorder,
  sidebarHover,
  userBg,
  panelTitle,
  showMobileMenu = true
}: LayoutProps) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Memoizar usuario para evitar re-parsing
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch (error) {
      console.error('Error parsing usuario from localStorage:', error);
      return {};
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }, [navigate]);

  const toggleMenu = useCallback(() => setMenuAbierto(prev => !prev), []);
  const closeMenu = useCallback(() => setMenuAbierto(false), []);

  // Manejo de teclado para accesibilidad
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && menuAbierto) closeMenu();
  }, [menuAbierto, closeMenu]);

  return (
    <div className="min-h-screen bg-gray-100" onKeyDown={handleKeyDown}>
      {/* Sidebar Desktop */}
      <div className={`hidden md:block fixed left-0 top-0 h-full w-64 ${sidebarBg} shadow-lg`}>
        <div className={`p-6 border-b ${sidebarBorder}`}>
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Logo Renacer - Sistema interno"
              className="h-16 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <p className="text-white text-center text-sm mt-2 opacity-80">{panelTitle}</p>
        </div>

        <div className={`p-4 border-b ${sidebarBorder} ${userBg}`}>
          <p className="text-sm text-white">👤 {usuario.nombre || 'Usuario'}</p>
          <p className="text-xs text-white opacity-70">Rol: {usuario.rol || 'Desconocido'}</p>
        </div>

        <nav className="mt-4 px-3 space-y-1" role="navigation" aria-label="Menú principal">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block py-2 px-6 text-white hover:${sidebarHover} rounded-lg transition`}
              aria-label={item.label}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className={`w-full text-left block py-2 px-6 text-white hover:${sidebarHover} rounded-lg transition mt-4`}
            aria-label="Cerrar sesión"
          >
            🚪 Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Sidebar Móvil */}
      {showMobileMenu && menuAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={closeMenu}
          role="dialog"
          aria-modal="true"
          aria-label="Menú móvil"
        >
          <div className={`${sidebarBg} w-64 h-full p-4`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex justify-between items-center mb-4 pb-4 border-b ${sidebarBorder}`}>
              <img
                src="/logo.png"
                alt="Logo Renacer"
                className="h-12 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                onClick={closeMenu}
                className="text-white text-2xl"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>
            <div className={`mb-4 pb-4 border-b ${sidebarBorder}`}>
              <p className="text-sm text-white">👤 {usuario.nombre || 'Usuario'}</p>
              <p className="text-xs text-white opacity-70">Rol: {usuario.rol || 'Desconocido'}</p>
            </div>
            <nav onClick={closeMenu} className="space-y-1" role="navigation" aria-label="Menú móvil">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block py-2 px-4 text-white hover:${sidebarHover} rounded-lg transition`}
                  aria-label={item.label}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className={`w-full text-left block py-2 px-4 text-white hover:${sidebarHover} rounded-lg transition mt-4`}
                aria-label="Cerrar sesión"
              >
                🚪 Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="md:ml-64">
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-3">
            {showMobileMenu && (
              <button
                onClick={toggleMenu}
                className="md:hidden text-2xl text-renacer-600"
                aria-label="Abrir menú móvil"
                aria-expanded={menuAbierto}
              >
                ☰
              </button>
            )}
            <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio">
              <img
                src="/logo.png"
                alt="Logo Renacer"
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
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 text-sm"
            aria-label="Cerrar sesión"
          >
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