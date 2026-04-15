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
}

function GerenteDashboard() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    reputacion: 'OBSERVADA',
  });
  const [error, setError] = useState('');

  const fetchVendedoras = async () => {
    try {
      const response = await api.get('/vendedora');
      setVendedoras(response.data);
    } catch (error) {
      console.error('Error al cargar vendedoras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendedoras();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/vendedora', {
        nombre: formData.nombre,
        cedula: formData.cedula,
        reputacion: formData.reputacion,
        gerenteZonaId: null,
      });
      setShowModal(false);
      setFormData({ nombre: '', cedula: '', reputacion: 'OBSERVADA' });
      fetchVendedoras();
      alert('✅ Vendedora registrada exitosamente');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al registrar vendedora');
    }
  };

  const handleEdit = async (id: number, nuevaReputacion: string) => {
    try {
      await api.put(`/vendedora/${id}`, { reputacion: nuevaReputacion });
      fetchVendedoras();
      alert('✅ Reputación actualizada');
    } catch (error) {
      alert('❌ Error al actualizar reputación');
    }
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

  if (loading) return <LayoutGerente title="Panel Gerente"><div>Cargando...</div></LayoutGerente>;

  return (
    <LayoutGerente title="Mis Vendedoras">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Vendedoras de mi zona</h2>
          <p className="text-sm text-gray-500">Total: {vendedoras.length} vendedoras</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Registrar Vendedora
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reputación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendedoras.map((v) => (
              <tr key={v.id}>
                <td className="px-6 py-4 font-medium">{v.nombre}</td>
                <td className="px-6 py-4">{v.cedula}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${getColorReputacion(v.reputacion)}`}>
                    {getTextoReputacion(v.reputacion)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    onChange={(e) => handleEdit(v.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    value={v.reputacion}
                  >
                    <option value="POSITIVA">✅ Positiva</option>
                    <option value="OBSERVADA">⚠️ Observada</option>
                    <option value="RESTRINGIDA">🔴 Restringida</option>
                    <option value="NUEVA">🔵 Nueva</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para registrar vendedora */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar Vendedora</h2>
            <p className="text-sm text-gray-500 mb-4">
              ⚠️ Solo puedes registrar vendedoras con reputación OBSERVADA o RESTRINGIDA
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Cédula *</label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Reputación</label>
                <select
                  value={formData.reputacion}
                  onChange={(e) => setFormData({ ...formData, reputacion: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="OBSERVADA">⚠️ Observada</option>
                  <option value="RESTRINGIDA">🔴 Restringida</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Guardar
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