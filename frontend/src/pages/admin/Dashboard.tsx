import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVendedoras: 0,
    totalGerentes: 0,
    consultasMes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [vendedoras, gerentes] = await Promise.all([
          api.get('/vendedoras'),
          api.get('/usuarios?rol=GERENTE_ZONA'),
        ]);
        setStats({
          totalVendedoras: vendedoras.data.length,
          totalGerentes: gerentes.data.length,
          consultasMes: 0,
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout title="Panel de Administrador">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Vendedoras</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalVendedoras}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Gerentes de Zona</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalGerentes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Consultas este mes</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.consultasMes}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Bienvenido al sistema</h3>
        <p className="text-gray-600">
          Desde aquí puedes gestionar vendedoras, usuarios y monitorear la seguridad del sistema.
        </p>
      </div>
    </Layout>
  );
}

export default AdminDashboard;