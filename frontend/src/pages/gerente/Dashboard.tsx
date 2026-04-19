import { useEffect, useState } from 'react';
import LayoutGerente from '../../components/LayoutGerente';
import api from '../../services/api';

interface Vendedora {
  id: number;
  nombre: string;
  cedula: string;
  reputacion: string;
  gerenteZona: string;
  createdAt: string;
  creadaPorNombre?: string;
  telefono?: string;
  direccion?: string;
}

function GerenteDashboard() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filteredVendedoras, setFilteredVendedoras] = useState<Vendedora[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    reputacion: 'OBSERVADA',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState<{ [key: number]: number }>({});

  const fetchVendedoras = async () => {
    try {
      const response = await api.get('/vendedora');
      setVendedoras(response.data);
      setFilteredVendedoras(response.data);
    } catch (error) {
      console.error('Error al cargar vendedoras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendedoras();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nuevosTiempos: { [key: number]: number } = {};
      vendedoras.forEach(v => {
        const creado = new Date(v.createdAt).getTime();
        const ahora = Date.now();
        const minutosPasados = (ahora - creado) / 60000;
        if (minutosPasados < 30) {
          nuevosTiempos[v.id] = Math.max(0, 30 - minutosPasados);
        }
      });
      setTiempoRestante(nuevosTiempos);
    }, 1000);
    return () => clearInterval(interval);
  }, [vendedoras]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/vendedora', {
        nombre: formData.nombre,
        cedula: formData.cedula,
        reputacion: formData.reputacion,
        telefono: formData.telefono,
        direccion: formData.direccion,
        gerenteZonaId: null,
      });
      setShowModal(false);
      setFormData({ nombre: '', cedula: '', reputacion: 'OBSERVADA', telefono: '', direccion: '' });
      fetchVendedoras();
      setSuccess('✅ Vendedora reportada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al reportar vendedora');
    }
  };

  const handleEdit = async (id: number, nuevaReputacion: string) => {
    try {
      await api.put(`/vendedora/${id}`, { reputacion: nuevaReputacion });
      fetchVendedoras();
      setSuccess('✅ Reputación actualizada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al actualizar reputación');
    }
  };

  const puedeEditar = (vendedora: Vendedora) => {
    const tiempo = tiempoRestante[vendedora.id];
    return tiempo !== undefined && tiempo > 0;
  };

  const getTiempoTexto = (minutos: number) => {
    if (minutos <= 0) return 'Tiempo expirado';
    const mins = Math.floor(minutos);
    const segs = Math.floor((minutos % 1) * 60);
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  };

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
      case 'POSITIVA': return '✅ Positiva';
      case 'OBSERVADA': return '⚠️ Observada';
      case 'RESTRINGIDA': return '🔴 Restringida';
      default: return '🔵 Nueva';
    }
  };

  if (loading) return <LayoutGerente title="Mis Vendedoras"><div className="p-6">Cargando...</div></LayoutGerente>;

  return (
    <LayoutGerente title="Mis Vendedoras">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Mis Vendedoras</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{filteredVendedoras.length}</p>
            </div>
            <div className="w-12 h-12 bg-renacer-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tiempo para editar</p>
              <p className="text-xl font-bold text-renacer-600 mt-1">30 minutos</p>
            </div>
            <div className="w-12 h-12 bg-renacer-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar vendedora</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Nombre o cédula..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-renacer-600 text-white px-6 py-2 rounded-xl hover:bg-renacer-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl">+</span> Reportar Vendedora
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reputación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendedoras.map((v) => {
                const puede = puedeEditar(v);
                const tiempo = tiempoRestante[v.id];
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{v.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{v.cedula}</td>
                    <td className="px-6 py-4 text-gray-600">{v.telefono || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{v.direccion || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getColorReputacion(v.reputacion)}`}>
                        {getTextoReputacion(v.reputacion)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {tiempo ? getTiempoTexto(tiempo) : 'Tiempo expirado'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        onChange={(e) => handleEdit(v.id, e.target.value)}
                        disabled={!puede}
                        className={`border rounded-lg px-2 py-1 text-sm ${!puede ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={v.reputacion}
                      >
                        <option value="POSITIVA">✅ Positiva</option>
                        <option value="OBSERVADA">⚠️ Observada</option>
                        <option value="RESTRINGIDA">🔴 Restringida</option>
                        <option value="NUEVA">🔵 Nueva</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filteredVendedoras.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No has reportado vendedoras aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para reportar vendedora */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-texto">Reportar Vendedora</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <p className="text-sm text-amber-600 mb-4">
              ⚠️ Solo puedes reportar vendedoras con reputación OBSERVADA o RESTRINGIDA
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
                  required
                  inputMode="numeric"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
                  placeholder="0412-1234567"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
                  placeholder="Dirección de la vendedora"
                  rows={2}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reputación</label>
                <select
                  value={formData.reputacion}
                  onChange={(e) => setFormData({ ...formData, reputacion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-renacer-500"
                >
                  <option value="OBSERVADA">⚠️ Observada</option>
                  <option value="RESTRINGIDA">🔴 Restringida</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-renacer-600 text-white rounded-xl hover:bg-renacer-700 transition">
                  Reportar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutGerente>
  );
}

export default GerenteDashboard;