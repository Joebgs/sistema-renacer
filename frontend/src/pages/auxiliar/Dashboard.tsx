import LayoutAuxiliar from '../../components/LayoutAuxiliar';
import Dashboard from '../../components/Dashboard';

function AuxiliarDashboard() {
  return (
    <LayoutAuxiliar title="Dashboard Auxiliar">
      <Dashboard
        rol="AUXILIAR"
        title="Dashboard Auxiliar"
        canEdit={false}
        canDelete={false}
        canCreate={true}
      />
    </LayoutAuxiliar>
  );
}

export default AuxiliarDashboard;
