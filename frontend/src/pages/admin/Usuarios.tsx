import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  gerenteZonaId?: number;
  gerenteZona?: string;
  region?: string;
  activo: boolean;
  createdAt: string;
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.rol === 'GERENTE_ZONA') {
        await api.post('/auth/registrar-gerente', {
          email: formData.email,
          nombre: formData.nombre,
          password: formData.password,
          region: formData.region,
        });
      } else {
        await api.post('/auth/registrar', {
          email: formData.email,
          nombre: formData.nombre,
          password: formData.password,
          rol: formData.rol,
        });
      }
      setShowModal(false);
      setFormData({ email: '', nombre: '', password: '', rol: 'GERENTE_ZONA', region: '' });
      fetchUsuarios();
      alert('✅ Usuario creado exitosamente');
    } catch (error: any) {
      alert('❌ Error al crear usuario: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditUsuario(usuario);
    setEditFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      region: usuario.region || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/auth/usuarios/${editUsuario?.id}`, {
        email: editFormData.email,
        nombre: editFormData.nombre,
        rol: editFormData.rol,
        region: editFormData.region,
      });
      setShowEditModal(false);
      fetchUsuarios();
      alert('✅ Usuario actualizado correctamente');
    } catch (error: any) {
      alert('❌ Error al actualizar usuario: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este usuario?')) {
      try {
        await api.delete(`/auth/usuarios/${id}`);
        fetchUsuarios();
        alert('✅ Usuario eliminado');
      } catch (error) {
        alert('❌ Error al eliminar usuario');
      }
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'AUXILIAR': return 'bg-yellow-100 text-yellow-800';
      case 'GERENTE_ZONA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolTexto = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return '👑 Administrador';
      case 'AUXILIAR': return '🛠️ Auxiliar';
      case 'GERENTE_ZONA': return '📍 Gerente de Zona';
      default: return rol;
    }
  };

  if (loading) return <Layout title="Usuarios"><div className="p-6">Cargando...</div></Layout>;

  return (
    <Layout title="Gestión de Usuarios">
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-renacer-600 text-white px-4 py-2 rounded-lg hover:bg-renacer-700 transition"
        >
          + Crear Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Región</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{usuario.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${getRolColor(usuario.rol)}`}>
                      {getRolTexto(usuario.rol)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {usuario.rol === 'GERENTE_ZONA' ? (usuario.region || 'Sin asignar') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      disabled={usuario.rol === 'ADMIN'}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={usuario.rol === 'ADMIN'}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-texto">Crear Nuevo Usuario</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="GERENTE_ZONA">Gerente de Zona</option>
                  <option value="AUXILIAR">Auxiliar</option>
                </select>
              </div>
              {formData.rol === 'GERENTE_ZONA' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Región</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar región...</option>
                    <option value="Portuguesa">Portuguesa</option>
                    <option value="Cojedes">Cojedes</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-renacer-600 text-white rounded-lg hover:bg-renacer-700 transition">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {showEditModal && editUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-texto">Editar Usuario</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editFormData.nombre}
                  onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={editFormData.rol}
                  onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="GERENTE_ZONA">Gerente de Zona</option>
                  <option value="AUXILIAR">Auxiliar</option>
                </select>
              </div>
              {editFormData.rol === 'GERENTE_ZONA' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Región</label>
                  <select
                    value={editFormData.region}
                    onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar región...</option>
                    <option value="Portuguesa">Portuguesa</option>
                    <option value="Cojedes">Cojedes</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-renacer-600 text-white rounded-lg hover:bg-renacer-700 transition">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminUsuarios;