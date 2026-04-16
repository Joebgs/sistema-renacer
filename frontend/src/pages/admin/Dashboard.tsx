import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

interface Vendedora {
  id: number;
  nombre: string;
  cedula: string;
  reputacion: string;
  gerenteZona: string;
}

function AdminDashboard() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filteredVendedoras, setFilteredVendedoras] = useState<Vendedora[]>([]);
  const [stats, setStats] = useState({
    totalVendedoras: 0,
    totalGerentes: 0,
    consultasMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendedorasRes, gerentesRes] = await Promise.all([
          api.get('/vendedora'),
          api.get('/auth/usuarios?rol=GERENTE_ZONA'), // ← Ahora filtra en el backend
        ]);
        
        setVendedoras(vendedorasRes.data);
        setFilteredVendedoras(vendedorasRes.data);
        setStats({
          totalVendedoras: vendedorasRes.data.length,
          totalGerentes: gerentesRes.data.length,
          consultasMes: 1250,
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === '') {
      setFilteredVendedoras(vendedoras);
    } else {
      const filtered = vendedoras.filter(v =>
        v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.cedula.includes(busqueda)
      );
      setFilteredVendedoras(filtered);
    }
  }, [busqueda, vendedoras]);

  const getColorReputacion = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return 'bg-green-100 text-green-800';
      case 'OBSERVADA': return 'bg-yellow-100 text-yellow-800';
      case 'RESTRINGIDA': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTextoReputacion = (reputacion: string) => {
    switch (reputacion) {
      case 'POSITIVA': return 'Positiva';
      case 'OBSERVADA': return 'Observada';
      case 'RESTRINGIDA': return 'Restringida';
      default: return 'Nueva';
    }
  };

  if (loading) return <Layout title="Dashboard"><div className="p-6">Cargando...</div></Layout>;

  return (
    <Layout title="Panel de Administrador">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Vendedoras</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalVendedoras}</p>
            </div>
            <div className="w-12 h-12 bg-renacer-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Gerentes de Zona</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalGerentes}</p>
            </div>
            <div className="w-12 h-12 bg-renacer-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Consultas este mes</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.consultasMes}</p>
            </div>
            <div className="w-12 h-12 bg-renacer-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar vendedora</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Nombre o cédula..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {busqueda && filteredVendedoras.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Resultados encontrados: {filteredVendedoras.length}</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredVendedoras.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">{v.nombre}</p>
                    <p className="text-sm text-gray-500">Cédula: {v.cedula}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getColorReputacion(v.reputacion)}`}>
                    {getTextoReputacion(v.reputacion)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabla de vendedoras */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Listado de Vendedoras</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reputación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendedoras.slice(0, 10).map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{v.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{v.cedula}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getColorReputacion(v.reputacion)}`}>
                      {getTextoReputacion(v.reputacion)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{v.gerenteZona || 'Sin asignar'}</td>
                </tr>
              ))}
              {filteredVendedoras.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No hay vendedoras registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;