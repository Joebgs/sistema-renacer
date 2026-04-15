import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [cedula, setCedula] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buscar = async () => {
    if (!cedula.trim()) return;
    
    setLoading(true);
    setError('');
    setResultado(null);
    
    try {
      const response = await api.get(`/vendedora/buscar/${cedula}`);
      setResultado(response.data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Vendedora no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const getColorReputacion = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return 'text-green-600 bg-green-50';
      case 'OBSERVADA': return 'text-yellow-600 bg-yellow-50';
      case 'RESTRINGIDA': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md py-3 px-4 flex justify-between items-center">
        <Link to="/" className="text-lg md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition">
          Renacer Check In
        </Link>
        <a href="/login" className="text-blue-600 text-sm md:text-base hover:text-blue-800">
          Iniciar Sesión
        </a>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
            Sistema Check-In Renacer
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Consulta el historial de vendedoras de forma rápida y segura
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Ingrese cédula o nombre"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscar()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
            <button
              onClick={buscar}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {resultado && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
              Resultado de la consulta
            </h3>
            
            <div className="space-y-3 text-sm md:text-base">
              <p><span className="font-semibold">Nombre completo:</span> {resultado.nombre}</p>
              <p><span className="font-semibold">Cédula:</span> {resultado.cedula}</p>
              
              <div className={`p-3 rounded-lg ${getColorReputacion(resultado.reputacion)}`}>
                <span className="font-semibold">Reputación:</span> {getTextoReputacion(resultado.reputacion)}
              </div>
              
              <p><span className="font-semibold">Gerente actual:</span> {resultado.gerenteActual || 'Sin asignar'}</p>
              
              {resultado.historial && resultado.historial.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-600 font-semibold">
                    📜 Historial de gerentes anteriores ({resultado.historial.length})
                  </summary>
                  <ul className="mt-2 pl-4 space-y-1">
                    {resultado.historial.map((h: any, idx: number) => (
                      <li key={idx}>• {h.gerenteZona} ({new Date(h.fechaAsignacion).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 md:py-6 text-gray-500 text-xs md:text-sm">
        © 2026 Renacer - Sistema interno
      </footer>
    </div>
  );
}

export default Home;