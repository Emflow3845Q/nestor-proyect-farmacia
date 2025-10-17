import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Login from './pages/login';
import RecuperarContrasena from './pages/RecuperarContrasena';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Medicamentos from './pages/Medicamentos';
import Ordenes from './pages/Ordenes';
import Inventarios from './pages/Inventarios';
import Reportes from './pages/Reportes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/medicamentos" element={<Medicamentos />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/inventarios" element={<Inventarios />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Router>
  );
}

export default App;