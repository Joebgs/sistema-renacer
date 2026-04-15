import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [cedula, setCedula] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  const validarCedula = (value: string): boolean => {
    if (!value) return false;
    const numeros = /^\d+$/.test(value);
    const longitud = value.length >= 6 && value.length <= 9;
    return numeros && longitud;
  };

  const buscar = async () => {
    setError('');
    setErrorValidacion('');
    
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
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setCedula(value);
      setErrorValidacion('');
    }
  };

  const getStatusClass = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return 'bg-green-50 text-green-700 border-green-200';
      case 'OBSERVADA': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'RESTRINGIDA': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusText = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return '✅ POSITIVA - Vendedora confiable';
      case 'OBSERVADA': return '⚠️ OBSERVADA - Se recomienda verificar';
      case 'RESTRINGIDA': return '🔴 RESTRINGIDA - Requiere validación administrativa';
      default: return '🔵 NUEVA - Sin historial previo';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center py-5 px-6 md:px-10">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Renacer" 
            className="h-10 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="font-bold text-xl text-renacer-600">Renacer</span>
        </div>
        <Link 
          to="/login" 
          className="border border-gray-300 px-4 py-2 rounded-xl bg-white text-gray-600 hover:border-renacer-500 hover:text-renacer-600 transition"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="text-center mt-8 mb-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-texto mb-3">
          Sistema de Verificación de Vendedoras
        </h1>
        <p className="text-texto-claro text-base md:text-lg">
          Consulta el estado e historial de una vendedora de forma rápida y segura
        </p>
      </section>

      {/* Contenedor principal */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 px-6 pb-12 max-w-6xl mx-auto">
        
        {/* Tarjeta de búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-96">
          <h3 className="text-lg font-semibold text-texto mb-3">Buscar por cédula</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              type="text"
              placeholder="Ingrese número de cédula"
              value={cedula}
              onChange={handleCedulaChange}
              onKeyPress={(e) => e.key === 'Enter' && buscar()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
              inputMode="numeric"
              maxLength={9}
            />
            <button
              onClick={buscar}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-renacer-600 to-renacer-800 text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium whitespace-nowrap"
            >
              {loading ? '...' : 'Consultar'}
            </button>
          </div>
          
          <small className="text-texto-claro text-xs mt-2 block">Ejemplo: 12345678</small>
          
          {errorValidacion && (
            <div className="mt-3 text-amber-600 text-sm text-center">
              ⚠️ {errorValidacion}
            </div>
          )}
          
          {error && !resultado && (
            <div className="mt-3 text-red-600 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Tarjeta de resultado */}
        {resultado && (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-96">
            {/* Estado */}
            <div className={`p-3 rounded-xl mb-5 text-center font-semibold ${getStatusClass(resultado.reputacion)}`}>
              {getStatusText(resultado.reputacion)}
            </div>

            {/* Perfil */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-renacer-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-texto">{resultado.nombre}</h3>
            </div>

            {/* Datos */}
            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Cédula:</span>
                <span className="text-texto font-medium">{resultado.cedula}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Estado:</span>
                <span className="text-texto font-medium">{resultado.reputacion}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Gerente:</span>
                <span className="text-texto font-medium">{resultado.gerenteActual || 'Sin asignar'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Zona:</span>
                <span className="text-texto font-medium">{resultado.gerenteZona || 'Sin asignar'}</span>
              </div>
            </div>

            {/* Historial */}
            <h4 className="font-semibold text-texto mb-3">Historial</h4>
            <div className="border-l-2 border-renacer-300 pl-4 space-y-2">
              {resultado.historial && resultado.historial.length > 0 ? (
                resultado.historial.map((h: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-renacer-500 rounded-full"></div>
                    <p className="text-texto-claro text-sm">{h.descripcion || `${h.gerenteZona} (${new Date(h.fechaAsignacion).toLocaleDateString()})`}</p>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-gray-300 rounded-full"></div>
                  <p className="text-texto-claro text-sm">Sin historial previo</p>
                </div>
              )}
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-gray-300 rounded-full"></div>
                <p className="text-texto-claro text-sm">Ingreso al sistema: {resultado.createdAt ? new Date(resultado.createdAt).toLocaleDateString() : 'No disponible'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-texto-claro text-sm">
            Sistema de Verificación de Vendedoras - Renacer Check In
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