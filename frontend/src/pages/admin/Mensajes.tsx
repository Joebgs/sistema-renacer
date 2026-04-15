import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

interface Mensaje {
  id: number;
  titulo: string;
  contenido: string;
  leido: boolean;
  remitenteNombre: string;
  createdAt: string;
  destinatarioId?: number;
  paraTodosGerentes?: boolean;
}

interface Gerente {
  id: number;
  nombre: string;
  email: string;
}

function AdminMensajes() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    destinatarioId: '',
    paraTodos: false,
  });

  const fetchMensajes = async () => {
    try {
      const response = await api.get('/mensajes/recibidos');
      setMensajes(response.data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGerentes = async () => {
    try {
      const response = await api.get('/mensajes/gerentes');
      setGerentes(response.data);
    } catch (error) {
      console.error('Error al cargar gerentes:', error);
    }
  };

  useEffect(() => {
    fetchMensajes();
    fetchGerentes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mensajes/enviar', {
        titulo: formData.titulo,
        contenido: formData.contenido,
        destinatarioId: formData.paraTodos ? null : parseInt(formData.destinatarioId),
        paraTodosGerentes: formData.paraTodos,
      });
      setShowModal(false);
      setFormData({ titulo: '', contenido: '', destinatarioId: '', paraTodos: false });
      fetchMensajes();
      alert('✅ Mensaje enviado');
    } catch (error) {
      alert('❌ Error al enviar mensaje');
    }
  };

  const marcarLeido = async (id: number) => {
    try {
      await api.put(`/mensajes/${id}/leer`);
      fetchMensajes();
    } catch (error) {
      console.error('Error al marcar como leído');
    }
  };

  if (loading) return <Layout title="Mensajes"><div>Cargando...</div></Layout>;

  return (
    <Layout title="Sistema de Mensajes">
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          ✉️ Nuevo Mensaje
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">De</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contenido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mensajes.map((m) => (
              <tr key={m.id} className={!m.leido ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4">
                  {!m.leido && (
                    <button
                      onClick={() => marcarLeido(m.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📖 Marcar leído
                    </button>
                  )}
                  {m.leido && <span className="text-gray-400">✅ Leído</span>}
                </td>
                <td className="px-6 py-4">{m.remitenteNombre}</td>
                <td className="px-6 py-4 font-medium">{m.titulo}</td>
                <td className="px-6 py-4">{m.contenido}</td>
                <td className="px-6 py-4 text-sm">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para enviar mensaje */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enviar Mensaje</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Destinatario</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mb-2"
                  onChange={(e) => setFormData({ ...formData, paraTodos: e.target.value === 'todos' })}
                  defaultValue=""
                >
                  <option value="">Seleccionar...</option>
                  <option value="todos">📢 Todos los gerentes</option>
                  <option value="individual">👤 Gerente específico</option>
                </select>
                {!formData.paraTodos && (
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    onChange={(e) => setFormData({ ...formData, destinatarioId: e.target.value })}
                    required={!formData.paraTodos}
                  >
                    <option value="">Seleccionar gerente...</option>
                    {gerentes.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre} - {g.email}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Mensaje</label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminMensajes;