import LayoutAdmin from '../../components/LayoutAdmin';
import Dashboard from '../../components/Dashboard';

function AdminDashboard() {
  return (
    <LayoutAdmin title="Dashboard Administrador">
      <Dashboard
        rol="ADMIN"
        title="Dashboard Administrador"
        canEdit={true}
        canDelete={true}
        canCreate={true}
      />
    </LayoutAdmin>
  );
}

export default AdminDashboard;
