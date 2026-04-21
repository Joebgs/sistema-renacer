// Constantes para reputación y estados
export const REPUTACION_CONFIG = {
  EXCELENTE: { color: 'text-green-600', bg: 'bg-green-100', texto: 'Excelente' },
  BUENA: { color: 'text-blue-600', bg: 'bg-blue-100', texto: 'Buena' },
  REGULAR: { color: 'text-yellow-600', bg: 'bg-yellow-100', texto: 'Regular' },
  MALA: { color: 'text-red-600', bg: 'bg-red-100', texto: 'Mala' },
};

export const ESTADO_CONFIG = {
  ACTIVO: { color: 'text-green-600', bg: 'bg-green-100', texto: 'Activo' },
  INACTIVO: { color: 'text-gray-600', bg: 'bg-gray-100', texto: 'Inactivo' },
  SUSPENDIDO: { color: 'text-red-600', bg: 'bg-red-100', texto: 'Suspendido' },
};

// Funciones helper
export const getReputacionConfig = (reputacion: number) => {
  if (reputacion >= 90) return REPUTACION_CONFIG.EXCELENTE;
  if (reputacion >= 70) return REPUTACION_CONFIG.BUENA;
  if (reputacion >= 50) return REPUTACION_CONFIG.REGULAR;
  return REPUTACION_CONFIG.MALA;
};

export const getEstadoConfig = (estado: string) => {
  switch (estado.toUpperCase()) {
    case 'ACTIVO':
      return ESTADO_CONFIG.ACTIVO;
    case 'INACTIVO':
      return ESTADO_CONFIG.INACTIVO;
    case 'SUSPENDIDO':
      return ESTADO_CONFIG.SUSPENDIDO;
    default:
      return ESTADO_CONFIG.INACTIVO;
  }
};

// Mensajes comunes
export const MESSAGES = {
  LOADING: 'Cargando...',
  ERROR_LOAD: 'Error al cargar datos. Inténtalo de nuevo.',
  ERROR_SAVE: 'Error al guardar cambios.',
  SUCCESS_SAVE: 'Cambios guardados correctamente.',
  CONFIRM_DELETE: '¿Estás seguro de que quieres eliminar este elemento?',
};