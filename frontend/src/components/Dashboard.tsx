import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import DataTable from './DataTable';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { getReputacionConfig, MESSAGES } from '../constants/common';

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

interface DashboardProps {
  rol: 'ADMIN' | 'AUXILIAR' | 'GERENTE';
  title: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
}

function Dashboard({ rol, title, canEdit = false, canDelete = false, canCreate = false }: DashboardProps) {
  const { error, handleError, clearError, wrapAsync } = useErrorHandler();
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [filteredVendedoras, setFilteredVendedoras] = useState<Vendedora[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    reputacion: 'OBSERVADA',
    telefono: '',
    direccion: '',
  });

  const fetchVendedoras = useCallback(async () => {
    setLoading(true);
    const result = await wrapAsync(async () => {
      // Todos los roles usan el mismo endpoint, el backend filtra automáticamente
      const response = await api.get('/vendedora');
      setVendedoras(response.data);
    }, MESSAGES.ERROR_LOAD);
    setLoading(false);
    return result;
  }, [wrapAsync]);

  useEffect(() => {
    fetchVendedoras();
  }, [fetchVendedoras]);

  // Filtrar vendedoras
  const filtered = useMemo(() => {
    if (!busqueda.trim()) return vendedoras;
    return vendedoras.filter(v =>
      v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.cedula.includes(busqueda)
    );
  }, [vendedoras, busqueda]);

  useEffect(() => {
    setFilteredVendedoras(filtered);
  }, [filtered]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await wrapAsync(async () => {
      await api.post('/vendedora', formData);
      setShowModal(false);
      setFormData({ nombre: '', cedula: '', reputacion: 'OBSERVADA', telefono: '', direccion: '' });
      fetchVendedoras();
    }, MESSAGES.ERROR_SAVE);
  }, [formData, wrapAsync, fetchVendedoras]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm(MESSAGES.CONFIRM_DELETE)) return;
    await wrapAsync(async () => {
      await api.delete(`/vendedora/${id}`);
      fetchVendedoras();
    }, MESSAGES.ERROR_SAVE);
  }, [wrapAsync, fetchVendedoras]);

  const columns = useMemo(() => [
    { key: 'nombre', header: 'Nombre', className: 'font-medium' },
    { key: 'cedula', header: 'Cédula' },
    {
      key: 'reputacion',
      header: 'Reputación',
      render: (value: string) => {
        const config = getReputacionConfig(
          value === 'POSITIVA' ? 95 :
          value === 'OBSERVADA' ? 75 :
          value === 'RESTRINGIDA' ? 45 : 0
        );
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
            {config.texto}
          </span>
        );
      }
    },
    { key: 'gerenteZona', header: 'Gerente' },
    {
      key: 'createdAt',
      header: 'Fecha Creación',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    ...(canDelete ? [{
      key: 'acciones',
      header: 'Acciones',
      render: (_: any, item: Vendedora) => (
        <button
          onClick={() => handleDelete(item.id)}
          className="text-red-600 hover:text-red-800 text-sm"
          aria-label={`Eliminar ${item.nombre}`}
        >
          🗑️ Eliminar
        </button>
      )
    }] : [])
  ], [canDelete, handleDelete]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner message={MESSAGES.LOADING} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">Gestión de vendedoras del sistema</p>
      </div>

      {error.hasError && (
        <ErrorMessage
          message={error.message || 'Ha ocurrido un error'}
          className="mb-4"
        />
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Buscar vendedoras"
        />
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            aria-label="Agregar nueva vendedora"
          >
            ➕ Nueva Vendedora
          </button>
        )}
      </div>

      <DataTable
        data={filteredVendedoras}
        columns={columns}
        emptyMessage="No hay vendedoras registradas"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Agregar Nueva Vendedora"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cédula</label>
            <input
              type="text"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reputación</label>
            <select
              value={formData.reputacion}
              onChange={(e) => setFormData({ ...formData, reputacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="OBSERVADA">Observada</option>
              <option value="RESTRINGIDA">Restringida</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <textarea
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;