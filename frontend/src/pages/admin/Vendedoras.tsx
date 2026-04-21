import LayoutAdmin from '../../components/LayoutAdmin';
import Dashboard from '../../components/Dashboard';

function AdminVendedoras() {
  return (
    <LayoutAdmin title="Gestión de Vendedoras">
      <Dashboard
        rol="ADMIN"
        title="Gestión de Vendedoras"
        canEdit={true}
        canDelete={true}
        canCreate={true}
      />
    </LayoutAdmin>
  );
}

export default AdminVendedoras;
