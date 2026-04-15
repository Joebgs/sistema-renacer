import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminVendedoras from './pages/admin/Vendedoras';
import AuxiliarDashboard from './pages/auxiliar/Dashboard';
import GerenteDashboard from './pages/gerente/Dashboard';  // ← Esta línea es la que falta
import AdminMensajes from './pages/admin/Mensajes';
import GerenteMensajes from './pages/gerente/Mensajes';
import AdminSeguridad from './pages/admin/Seguridad';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/vendedoras" element={<AdminVendedoras />} />
        <Route path="/auxiliar" element={<AuxiliarDashboard />} />
        <Route path="/gerente" element={<GerenteDashboard />} />
        <Route path="/admin/mensajes" element={<AdminMensajes />} />
        <Route path="/gerente/mensajes" element={<GerenteMensajes />} />
        <Route path="/admin/seguridad" element={<AdminSeguridad />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;