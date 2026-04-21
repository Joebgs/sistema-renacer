// Constantes para layouts y menús
export interface MenuItem {
  to: string;
  label: string;
  icon: string;
}

export interface LayoutConfig {
  menuItems: MenuItem[];
  sidebarBg: string;
  sidebarBorder: string;
  sidebarHover: string;
  userBg: string;
  panelTitle: string;
  showMobileMenu: boolean;
}

export const LAYOUT_CONFIGS: Record<string, LayoutConfig> = {
  ADMIN: {
    menuItems: [
      { to: '/admin', label: 'Inicio', icon: '📊' },
      { to: '/admin/vendedoras', label: 'Vendedoras', icon: '👩' },
      { to: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
      { to: '/admin/mensajes', label: 'Mensajes', icon: '📬' },
      { to: '/admin/seguridad', label: 'Seguridad', icon: '🛡️' },
    ],
    sidebarBg: 'bg-renacer-600',
    sidebarBorder: 'border-renacer-500',
    sidebarHover: 'bg-renacer-700',
    userBg: 'bg-renacer-700',
    panelTitle: 'Sistema interno',
    showMobileMenu: true,
  },
  AUXILIAR: {
    menuItems: [
      { to: '/auxiliar', label: 'Inicio', icon: '📊' },
      { to: '/auxiliar/vendedoras', label: 'Vendedoras', icon: '👩' },
      { to: '/auxiliar/mensajes', label: 'Mensajes', icon: '📬' },
    ],
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-gray-300',
    sidebarHover: 'bg-gray-100',
    userBg: 'bg-gray-50',
    panelTitle: 'Panel Auxiliar',
    showMobileMenu: false,
  },
  GERENTE: {
    menuItems: [
      { to: '/gerente', label: 'Inicio', icon: '📊' },
      { to: '/gerente/vendedoras', label: 'Mis Vendedoras', icon: '👩' },
      { to: '/gerente/mensajes', label: 'Mensajes', icon: '📬' },
    ],
    sidebarBg: 'bg-renacer-600',
    sidebarBorder: 'border-renacer-500',
    sidebarHover: 'bg-renacer-700',
    userBg: 'bg-renacer-700',
    panelTitle: 'Panel Gerente',
    showMobileMenu: true,
  },
};