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
  activo: boolean;
  createdAt: string;
}

interface Zona {
  id: number;
  nombre: string;
  region: string;
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: 'GERENTE_ZONA',
    gerenteZonaId: '',
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

  const fetchZonas = async () => {
    try {
      const response = await api.get('/zonas');
      setZonas(response.data);
    } catch (error) {
      console.error('Error al cargar zonas:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchZonas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/registrar', {
        email: formData.email,
        nombre: formData.nombre,
        password: formData.password,
        rol: formData.rol,
        gerenteZonaId: formData.gerenteZonaId ? parseInt(formData.gerenteZonaId) : undefined,
      });
      setShowModal(false);
      setFormData({ email: '', nombre: '', password: '', rol: 'GERENTE_ZONA', gerenteZonaId: '' });
      fetchUsuarios();
      alert('✅ Usuario creado exitosamente');
    } catch (error: any) {
      alert('❌ Error al crear usuario: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const handleAsignarZona = async (usuarioId: number, zonaId: number) => {
    try {
      await api.put(`/auth/usuarios/${usuarioId}/asignar-zona`, { gerenteZonaId: zonaId });
      fetchUsuarios();
      alert('✅ Zona asignada correctamente');
    } catch (error) {
      alert('❌ Error al asignar zona');
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
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Crear Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 font-medium">{usuario.nombre}</td>
                <td className="px-6 py-4">{usuario.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${getRolColor(usuario.rol)}`}>
                    {getRolTexto(usuario.rol)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {usuario.rol === 'GERENTE_ZONA' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{usuario.gerenteZona || 'Sin asignar'}</span>
                      <button
                        onClick={() => {
                          setSelectedUsuario(usuario);
                          setShowZonaModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Asignar
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
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
          </tbody>
        </table>
      </div>

      {/* Modal para crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Usuario</h2>
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
                  <label className="block text-sm font-medium mb-1">Zona (ID)</label>
                  <select
                    value={formData.gerenteZonaId}
                    onChange={(e) => setFormData({ ...formData, gerenteZonaId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Sin zona</option>
                    {zonas.map((zona) => (
                      <option key={zona.id} value={zona.id}>{zona.nombre} - {zona.region}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar zona */}
      {showZonaModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Asignar Zona</h2>
            <p className="text-sm text-gray-600 mb-4">
              Usuario: <strong>{selectedUsuario.nombre}</strong>
            </p>
            <select
              className="w-full border rounded-lg px-3 py-2 mb-4"
              onChange={(e) => handleAsignarZona(selectedUsuario.id, parseInt(e.target.value))}
            >
              <option value="">Seleccionar zona...</option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>{zona.nombre} - {zona.region}</option>
              ))}
            </select>
            <div className="flex justify-end">
              <button onClick={() => setShowZonaModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminUsuarios;