import { useEffect, useState } from 'react';
import LayoutGerente from '../../components/LayoutGerente';
import api from '../../services/api';

interface Mensaje {
  id: number;
  titulo: string;
  contenido: string;
  leido: boolean;
  remitenteNombre: string;
  createdAt: string;
}

function GerenteMensajes() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchMensajes();
  }, []);

  const marcarLeido = async (id: number) => {
    try {
      await api.put(`/mensajes/${id}/leer`);
      fetchMensajes();
    } catch (error) {
      console.error('Error al marcar como leído');
    }
  };

  if (loading) return <LayoutGerente title="Mensajes"><div>Cargando...</div></LayoutGerente>;

  return (
    <LayoutGerente title="Mis Mensajes">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">De</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mensajes.map((m) => (
              <tr key={m.id} className={!m.leido ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4">
                  {!m.leido ? (
                    <button
                      onClick={() => marcarLeido(m.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📖 Marcar leído
                    </button>
                  ) : (
                    <span className="text-gray-400">✅ Leído</span>
                  )}
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
    </LayoutGerente>
  );
}

export default GerenteMensajes;