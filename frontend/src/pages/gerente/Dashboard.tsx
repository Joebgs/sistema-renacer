import LayoutGerente from '../../components/LayoutGerente';
import Dashboard from '../../components/Dashboard';

function GerenteDashboard() {
  return (
    <LayoutGerente title="Dashboard Gerente">
      <Dashboard
        rol="GERENTE"
        title="Dashboard Gerente"
        canEdit={true}
        canDelete={false}
        canCreate={true}
      />
    </LayoutGerente>
  );
}

export default GerenteDashboard;
