import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [cedula, setCedula] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  // Validar cédula venezolana (6-9 dígitos, solo números)
  const validarCedula = (value: string): boolean => {
    if (!value) return false;
    const numeros = /^\d+$/.test(value);
    const longitud = value.length >= 6 && value.length <= 9;
    return numeros && longitud;
  };

  const buscar = async () => {
    // Limpiar errores previos
    setError('');
    setErrorValidacion('');
    
    // Validar cédula
    if (!cedula.trim()) {
      setErrorValidacion('Por favor ingrese un número de cédula');
      return;
    }
    
    if (!validarCedula(cedula)) {
      setErrorValidacion('La cédula debe tener entre 6 y 9 dígitos numéricos');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.get(`/vendedora/buscar/${cedula}`);
      setResultado(response.data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Vendedora no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir números
    if (value === '' || /^[0-9]+$/.test(value)) {
      setCedula(value);
      setErrorValidacion('');
    }
  };

  const getColorReputacion = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return 'text-green-600 bg-green-50 border-green-200';
      case 'OBSERVADA': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'RESTRINGIDA': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTextoReputacion = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return '✅ Sin novedad - Vendedora confiable';
      case 'OBSERVADA': return '⚠️ En observación - Se recomienda verificar';
      case 'RESTRINGIDA': return '🔴 Restringida - Consultar con administración';
      default: return '🔵 Sin historial previo';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 border-b">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Renacer" 
                className="h-16 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <h1 className="text-xl md:text-2xl font-bold text-renacer-600">
                Renacer Check In
              </h1>
            </div>
            <Link 
              to="/login" 
              className="text-renacer-600 hover:text-renacer-700 text-sm md:text-base font-medium"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {/* Tarjeta de bienvenida */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-texto mb-4">
            Sistema de Consulta
          </h2>
          <p className="text-texto-claro text-lg">
            Consulta el historial de vendedoras de forma rápida y segura
          </p>
        </div>

        {/* Tarjeta de búsqueda */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="text-center mb-6">
            {/* Logo dentro del círculo - reemplaza la lupa */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-renacer-100 rounded-full mb-4 p-2">
              <img 
                src="/logo.png" 
                alt="Renacer" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Si no hay logo, mostrar un ícono por defecto
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-3xl">🔍</span>';
                  }
                }}
              />
            </div>
            <h3 className="text-xl font-semibold text-texto">
              Consulta de Vendedoras
            </h3>
            <p className="text-texto-claro text-sm mt-1">
              Ingrese el número de cédula (6 a 9 dígitos)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ej: 12345678"
              value={cedula}
              onChange={handleCedulaChange}
              onKeyPress={(e) => e.key === 'Enter' && buscar()}
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500 focus:border-transparent text-center text-lg"
              inputMode="numeric"
              maxLength={9}
            />
            <button
              onClick={buscar}
              disabled={loading}
              className="bg-renacer-600 text-white px-8 py-3 rounded-xl hover:bg-renacer-700 transition disabled:opacity-50 font-semibold text-lg"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </div>

          {/* Mensaje de validación */}
          {errorValidacion && (
            <div className="mt-3 text-amber-600 text-sm text-center">
              ⚠️ {errorValidacion}
            </div>
          )}
        </div>

        {/* Mensaje de error de API */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <span className="text-3xl">📋</span>
              <h3 className="text-xl font-semibold text-texto">
                Resultado de la consulta
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b">
                <span className="font-semibold text-texto-claro">Nombre completo:</span>
                <span className="text-texto">{resultado.nombre}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b">
                <span className="font-semibold text-texto-claro">Cédula:</span>
                <span className="text-texto">{resultado.cedula}</span>
              </div>
              
              <div className={`p-4 rounded-xl border ${getColorReputacion(resultado.reputacion)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-semibold">Reputación:</span>
                  <span>{getTextoReputacion(resultado.reputacion)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b">
                <span className="font-semibold text-texto-claro">Gerente actual:</span>
                <span className="text-texto">{resultado.gerenteActual || 'Sin asignar'}</span>
              </div>
              
              {resultado.historial && resultado.historial.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-renacer-600 font-semibold">
                    📜 Ver historial de gerentes anteriores ({resultado.historial.length})
                  </summary>
                  <ul className="mt-3 pl-4 space-y-2">
                    {resultado.historial.map((h: any, idx: number) => (
                      <li key={idx} className="text-texto-claro text-sm">
                        • {h.gerenteZona} ({new Date(h.fechaAsignacion).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-texto-claro text-sm">
            Sistema de Consulta de Vendedoras - Renacer Check In
          </p>
          <p className="text-texto-claro text-xs mt-2 opacity-60">
            © 2026 Renacer - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;