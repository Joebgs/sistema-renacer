import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

interface IPBloqueada {
  id: number;
  ip: string;
  motivo: string;
  fechaBloqueo: string;
  fechaExpiracion: string;
  intentosRegistrados: number;
}

interface Auditoria {
  id: number;
  cedulaConsultada: string;
  usuarioId: number;
  ip: string;
  fecha: string;
  exitosa: boolean;
}

function AdminSeguridad() {
  const [ipsBloqueadas, setIpsBloqueadas] = useState<IPBloqueada[]>([]);
  const [auditoria, setAuditoria] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'bloqueadas' | 'auditoria'>('bloqueadas');

  const fetchIpsBloqueadas = async () => {
    try {
      const response = await api.get('/seguridad/ips-bloqueadas');
      setIpsBloqueadas(response.data);
    } catch (error) {
      console.error('Error al cargar IPs bloqueadas:', error);
    }
  };

  const fetchAuditoria = async () => {
    try {
      const response = await api.get('/seguridad/auditoria');
      setAuditoria(response.data);
    } catch (error) {
      console.error('Error al cargar auditoría:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpsBloqueadas();
    fetchAuditoria();
  }, []);

  const handleDesbloquear = async (ip: string) => {
    if (confirm(`¿Desbloquear la IP ${ip}?`)) {
      try {
        await api.post('/seguridad/desbloquear-ip', { ip });
        fetchIpsBloqueadas();
        alert('✅ IP desbloqueada');
      } catch (error) {
        alert('❌ Error al desbloquear IP');
      }
    }
  };

  if (loading) return <Layout title="Seguridad"><div>Cargando...</div></Layout>;

  return (
    <Layout title="Panel de Seguridad">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setTab('bloqueadas')}
          className={`px-4 py-2 ${tab === 'bloqueadas' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          🚫 IPs Bloqueadas
        </button>
        <button
          onClick={() => setTab('auditoria')}
          className={`px-4 py-2 ${tab === 'auditoria' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          📋 Auditoría de Consultas
        </button>
      </div>

      {/* IPs Bloqueadas */}
      {tab === 'bloqueadas' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Bloqueo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intentos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ipsBloqueadas.map((ip) => (
                <tr key={ip.id}>
                  <td className="px-6 py-4 font-mono text-sm">{ip.ip}</td>
                  <td className="px-6 py-4">{ip.motivo}</td>
                  <td className="px-6 py-4">{new Date(ip.fechaBloqueo).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {ip.fechaExpiracion ? new Date(ip.fechaExpiracion).toLocaleString() : 'Permanente'}
                  </td>
                  <td className="px-6 py-4">{ip.intentosRegistrados}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDesbloquear(ip.ip)}
                      className="text-green-600 hover:text-green-800"
                    >
                      🔓 Desbloquear
                    </button>
                  </td>
                </tr>
              ))}
              {ipsBloqueadas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay IPs bloqueadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Auditoría */}
      {tab === 'auditoria' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditoria.map((a) => (
                <tr key={a.id} className={!a.exitosa ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm">{new Date(a.fecha).toLocaleString()}</td>
                  <td className="px-6 py-4">{a.cedulaConsultada}</td>
                  <td className="px-6 py-4 font-mono text-sm">{a.ip}</td>
                  <td className="px-6 py-4">{a.usuarioId || 'Público'}</td>
                  <td className="px-6 py-4">
                    {a.exitosa ? '✅ Exitosa' : '❌ Fallida'}
                  </td>
                </tr>
              ))}
              {auditoria.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay registros de auditoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default AdminSeguridad;