import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import DataTable from './DataTable';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { MESSAGES } from '../constants/common';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  gerentezonaId?: number;
  gerentezona?: string;
  region?: string;
  activo: boolean;
  createdAt: string;
}

function UsuariosAdmin() {
  const { error, handleError, clearError, wrapAsync } = useErrorHandler();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsuario, setEditUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: 'GERENTE_ZONA',
    region: '',
  });
  const [editFormData, setEditFormData] = useState({
    email: '',
    nombre: '',
    rol: '',
    region: '',
  });

  const fetchUsuarios = useCallback(async () => {
    await wrapAsync(async () => {
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data);
    }, MESSAGES.ERROR_LOAD);
  }, [wrapAsync]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Filtrar usuarios
  const filtered = useMemo(() => {
    if (!busqueda.trim()) return usuarios;
    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rol.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [usuarios, busqueda]);

  useEffect(() => {
    setFilteredUsuarios(filtered);
  }, [filtered]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await wrapAsync(async () => {
      await api.post('/auth/register', formData);
      setShowModal(false);
      setFormData({ email: '', nombre: '', password: '', rol: 'GERENTE_ZONA', region: '' });
      fetchUsuarios();
    }, MESSAGES.ERROR_SAVE);
  }, [formData, wrapAsync, fetchUsuarios]);

  const handleEdit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsuario) return;
    await wrapAsync(async () => {
      await api.put(`/auth/usuarios/${editUsuario.id}`, editFormData);
      setShowEditModal(false);
      setEditUsuario(null);
      fetchUsuarios();
    }, MESSAGES.ERROR_SAVE);
  }, [editUsuario, editFormData, wrapAsync, fetchUsuarios]);

  const handleToggleActivo = useCallback(async (usuario: Usuario) => {
    await wrapAsync(async () => {
      await api.put(`/auth/usuarios/${usuario.id}`, { activo: !usuario.activo });
      fetchUsuarios();
    }, MESSAGES.ERROR_SAVE);
  }, [wrapAsync, fetchUsuarios]);

  const openEditModal = useCallback((usuario: Usuario) => {
    setEditUsuario(usuario);
    setEditFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      region: usuario.region || '',
    });
    setShowEditModal(true);
  }, []);

  const columns = useMemo(() => [
    { key: 'nombre', header: 'Nombre', className: 'font-medium' },
    { key: 'email', header: 'Email' },
    {
      key: 'rol',
      header: 'Rol',
      render: (value: string) => {
        const colors = {
          ADMIN: 'bg-purple-100 text-purple-800',
          GERENTE_ZONA: 'bg-blue-100 text-blue-800',
          AUXILIAR: 'bg-green-100 text-green-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    },
    { key: 'region', header: 'Región' },
    {
      key: 'activo',
      header: 'Estado',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha Creación',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: any, item: Usuario) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            aria-label={`Editar ${item.nombre}`}
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => handleToggleActivo(item)}
            className={`text-sm ${item.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
            aria-label={`${item.activo ? 'Desactivar' : 'Activar'} ${item.nombre}`}
          >
            {item.activo ? '🚫 Desactivar' : '✅ Activar'}
          </button>
        </div>
      )
    }
  ], [openEditModal, handleToggleActivo]);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">Administrar usuarios del sistema</p>
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
          placeholder="Buscar por nombre, email o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Buscar usuarios"
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          aria-label="Agregar nuevo usuario"
        >
          ➕ Nuevo Usuario
        </button>
      </div>

      <DataTable
        data={filteredUsuarios}
        columns={columns}
        emptyMessage="No hay usuarios registrados"
      />

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Nuevo Usuario"
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
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ADMIN">Administrador</option>
              <option value="GERENTE_ZONA">Gerente de Zona</option>
              <option value="AUXILIAR">Auxiliar</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Región</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Usuario"
      >
        <form onSubmit={handleEdit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={editFormData.nombre}
              onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={editFormData.rol}
              onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ADMIN">Administrador</option>
              <option value="GERENTE_ZONA">Gerente de Zona</option>
              <option value="AUXILIAR">Auxiliar</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Región</label>
            <input
              type="text"
              value={editFormData.region}
              onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsuariosAdmin;