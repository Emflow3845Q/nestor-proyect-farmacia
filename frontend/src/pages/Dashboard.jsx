import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { FaUserInjured, FaPills, FaFileMedical, FaBoxes } from "react-icons/fa";
import api from "../config/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalMedicamentos: 0,
    totalOrdenes: 0,
    alertasInventario: 0
  });
  const [ordenesMensuales, setOrdenesMensuales] = useState([]);
  const [estadoOrdenes, setEstadoOrdenes] = useState({ entregadas: 0, pendientes: 0 });
  const [ultimasOrdenes, setUltimasOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState({});

  // Cargar datos del dashboard
  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const [pacientesRes, medicamentosRes, ordenesRes] = await Promise.all([
        api.get('/api/pacientes/'),
        api.get('/api/medicamentos/'),
        api.get('/api/ordenes/')
      ]);

      // Calcular estadísticas
      const totalPacientes = Array.isArray(pacientesRes) ? pacientesRes.length : 0;
      const totalMedicamentos = Array.isArray(medicamentosRes) ? medicamentosRes.length : 0;
      const totalOrdenes = Array.isArray(ordenesRes) ? ordenesRes.length : 0;

      // Calcular alertas de inventario (medicamentos con stock bajo)
      const medicamentos = Array.isArray(medicamentosRes) ? medicamentosRes : [];
      const alertasInventario = medicamentos.filter(med => 
        med.stock_actual <= med.stock_minimo
      ).length;

      // Calcular órdenes mensuales (últimos 6 meses)
      const ordenes = Array.isArray(ordenesRes) ? ordenesRes : [];
      const ordenesPorMes = calcularOrdenesMensuales(ordenes);
      
      // Calcular estado de órdenes
      const estadoOrdenes = calcularEstadoOrdenes(ordenes);

      // Obtener últimas órdenes
      const ultimasOrdenes = ordenes
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);

      setStats({
        totalPacientes,
        totalMedicamentos,
        totalOrdenes,
        alertasInventario
      });
      setOrdenesMensuales(ordenesPorMes);
      setEstadoOrdenes(estadoOrdenes);
      setUltimasOrdenes(ultimasOrdenes);
      setErrores({});

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      setErrores({ general: 'Error al cargar los datos del dashboard' });
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular órdenes por mes
  const calcularOrdenesMensuales = (ordenes) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ahora = new Date();
    const ultimos6Meses = [];
    
    // Generar los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      ultimos6Meses.push({
        mes: meses[fecha.getMonth()],
        año: fecha.getFullYear(),
        mesNum: fecha.getMonth()
      });
    }

    // Contar órdenes por mes
    return ultimos6Meses.map(({ mes, año, mesNum }) => {
      const count = ordenes.filter(orden => {
        const fechaOrden = new Date(orden.fecha);
        return fechaOrden.getMonth() === mesNum && fechaOrden.getFullYear() === año;
      }).length;
      return count;
    });
  };

  // Función para calcular estado de órdenes
  const calcularEstadoOrdenes = (ordenes) => {
    const entregadas = ordenes.filter(orden => orden.estado === 'entregado').length;
    const pendientes = ordenes.filter(orden => orden.estado === 'pendiente').length;
    return { entregadas, pendientes };
  };

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "";
    return new Date(fechaString).toLocaleDateString('es-ES');
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  // Datos del gráfico de barras
  const barData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"].slice(-6),
    datasets: [
      {
        label: "Órdenes mensuales",
        data: ordenesMensuales,
        backgroundColor: "#5cc3b6",
      },
    ],
  };

  // Datos del gráfico de dona
  const doughnutData = {
    labels: ["Entregadas", "Pendientes"],
    datasets: [
      {
        data: [estadoOrdenes.entregadas, estadoOrdenes.pendientes],
        backgroundColor: ["#5cc3b6", "#f6ad55"],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activePage="dashboard" />
        <main className="flex-1 p-8 overflow-auto">
          <Header title="Dashboard" />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc3b6]"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Header title="Dashboard" />

        {errores.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errores.general}
          </div>
        )}

        {/* Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-5 flex flex-col items-center justify-center text-center">
            <FaUserInjured className="text-[#08988e] text-3xl mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{stats.totalPacientes}</h3>
            <p className="text-gray-500">Pacientes</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5 flex flex-col items-center justify-center text-center">
            <FaPills className="text-[#08988e] text-3xl mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{stats.totalMedicamentos}</h3>
            <p className="text-gray-500">Medicamentos</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5 flex flex-col items-center justify-center text-center">
            <FaFileMedical className="text-[#08988e] text-3xl mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{stats.totalOrdenes}</h3>
            <p className="text-gray-500">Órdenes</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5 flex flex-col items-center justify-center text-center">
            <FaBoxes className="text-[#08988e] text-3xl mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{stats.alertasInventario}</h3>
            <p className="text-gray-500">Alertas Inventario</p>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-4">Órdenes Mensuales</h3>
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-4">Estado de Órdenes</h3>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </section>

        {/* Últimas órdenes */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Últimas Órdenes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Paciente</th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-2 font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimasOrdenes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                      No hay órdenes recientes
                    </td>
                  </tr>
                ) : (
                  ultimasOrdenes.map((orden) => (
                    <tr key={orden.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-sm">{orden.identificacion}</td>
                      <td className="px-4 py-2">{orden.paciente_nombre}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          orden.estado === 'entregado' 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {orden.estado_display}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatearFecha(orden.fecha)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;