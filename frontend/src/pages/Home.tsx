import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { getReputacionConfig } from '../constants/common';

function Home() {
  const { error, handleError, clearError } = useErrorHandler();
  const [cedula, setCedula] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  const validarCedula = useCallback((value: string): boolean => {
    if (!value) return false;
    const numeros = /^\d+$/.test(value);
    const longitud = value.length >= 6 && value.length <= 9;
    return numeros && longitud;
  }, []);

  const buscar = useCallback(async () => {
    clearError();
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
      handleError(err.response?.data?.mensaje || 'Vendedora no encontrada');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }, [cedula, validarCedula, handleError, clearError]);

  const handleCedulaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setCedula(value);
      setErrorValidacion('');
    }
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') buscar();
  }, [buscar]);

  // Memoizar cálculos
  const ultimaReputacion = useMemo(() => {
    if (!resultado?.historial || resultado.historial.length === 0) {
      return 'NUEVA';
    }
    return resultado.historial[0].reputacion;
  }, [resultado]);

  const reputacionConfig = useMemo(() => getReputacionConfig(
    ultimaReputacion === 'POSITIVA' ? 95 :
    ultimaReputacion === 'OBSERVADA' ? 75 :
    ultimaReputacion === 'RESTRINGIDA' ? 45 : 0
  ), [ultimaReputacion]);

  const getStatusText = useCallback((reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return '✅ POSITIVA - Sin novedad';
      case 'OBSERVADA': return '⚠️ OBSERVADA - Se recomienda verificar';
      case 'RESTRINGIDA': return '🔴 RESTRINGIDA - Requiere validación administrativa';
      default: return '🔵 NUEVA - Sin historial previo';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col">
      <header className="flex justify-between items-center py-5 px-6 md:px-10" role="banner">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo Renacer - Sistema de verificación"
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
          aria-label="Ir a iniciar sesión"
        >
          Iniciar Sesión
        </Link>
      </header>

      <section className="text-center mt-8 mb-10 px-4" role="main" aria-labelledby="main-title">
        <h1 id="main-title" className="text-3xl md:text-4xl font-bold text-texto mb-3">
          Sistema de Verificación de Vendedoras
        </h1>
        <p className="text-texto-claro text-base md:text-lg">
          Consulta el estado e historial de una vendedora de forma rápida y segura
        </p>
      </section>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 px-6 pb-12 max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-96" role="search" aria-labelledby="search-title">
          <h3 id="search-title" className="text-lg font-semibold text-texto mb-3">Buscar por cédula</h3>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              type="text"
              placeholder="Ingrese número de cédula"
              value={cedula}
              onChange={handleCedulaChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
              inputMode="numeric"
              maxLength={9}
              aria-label="Número de cédula"
              aria-describedby={errorValidacion ? "validation-error" : undefined}
              disabled={loading}
            />
            <button
              onClick={buscar}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-renacer-600 to-renacer-800 text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium whitespace-nowrap"
              aria-label={loading ? "Buscando..." : "Consultar vendedora"}
            >
              {loading ? <LoadingSpinner size="sm" message="" /> : 'Consultar'}
            </button>
          </div>

          <small className="text-texto-claro text-xs mt-2 block">Ejemplo: 12345678</small>

          {errorValidacion && (
            <div id="validation-error" className="mt-3 text-amber-600 text-sm text-center" role="alert">
              ⚠️ {errorValidacion}
            </div>
          )}

          {error.hasError && !resultado && (
            <ErrorMessage
              message={error.message || 'Ha ocurrido un error'}
              className="mt-3"
            />
          )}
        </div>

        {resultado && (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full lg:w-96" role="region" aria-labelledby="result-title">
            <div className={`p-3 rounded-xl mb-5 text-center font-semibold ${reputacionConfig.bg} border ${reputacionConfig.color.replace('text-', 'border-')}`}>
              {getStatusText(ultimaReputacion)}
            </div>

            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-renacer-100 rounded-full flex items-center justify-center mx-auto mb-3" role="img" aria-label="Avatar de vendedora">
                <span className="text-3xl">👤</span>
              </div>
              <h3 id="result-title" className="text-xl font-bold text-texto">{resultado.nombre}</h3>
            </div>

            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Cédula:</span>
                <span className="text-texto font-medium">{resultado.cedula}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Teléfono:</span>
                <span className="text-texto font-medium">{resultado.telefono || 'No registrado'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-texto-claro">Dirección:</span>
                <span className="text-texto font-medium">{resultado.direccion || 'No registrada'}</span>
              </div>
            </div>

            {resultado.historial && resultado.historial.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-renacer-600 font-semibold" aria-expanded="false">
                  📜 Historial de reportes ({resultado.historial.length})
                </summary>
                <ul className="mt-3 pl-4 space-y-2" role="list">
                  {resultado.historial.map((h: any, idx: number) => (
                    <li key={idx} className="text-texto-claro text-sm border-l-2 border-renacer-300 pl-3" role="listitem">
                      • Reportado por: <strong>{h.gerenteZona || 'Desconocido'}</strong> ({h.region || 'Sin región'}) - {h.reputacion}
                      <br />
                      <span className="text-xs">📅 {new Date(h.fechaReporte).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>

      <footer className="bg-white border-t mt-auto py-6" role="contentinfo">
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