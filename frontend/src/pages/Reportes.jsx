import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import api from "../config/axios";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const Reportes = () => {
  const [reportesData, setReportesData] = useState({
    medicamentosEntregados: [],
    alertasResueltas: { resueltas: 0, total: 0 },
    pedidosCompletados: { completados: 0, total: 0 },
    ordenesDelMes: []
  });
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState({});

  // Cargar datos de reportes
  const cargarReportes = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de órdenes y medicamentos
      const [ordenesRes, medicamentosRes] = await Promise.all([
        api.get('/api/ordenes/'),
        api.get('/api/medicamentos/')
      ]);

      const ordenes = Array.isArray(ordenesRes) ? ordenesRes : [];
      const medicamentos = Array.isArray(medicamentosRes) ? medicamentosRes : [];

      // Calcular medicamentos entregados por mes (últimos 7 meses)
      const medicamentosEntregados = calcularMedicamentosEntregados(ordenes);
      
      // Calcular alertas resueltas (medicamentos con stock normal vs bajo)
      const alertasResueltas = calcularAlertasResueltas(medicamentos);
      
      // Calcular pedidos completados (órdenes entregadas vs total)
      const pedidosCompletados = calcularPedidosCompletados(ordenes);
      
      // Obtener órdenes del mes actual
      const ordenesDelMes = obtenerOrdenesDelMes(ordenes);

      setReportesData({
        medicamentosEntregados,
        alertasResueltas,
        pedidosCompletados,
        ordenesDelMes
      });
      setErrores({});

    } catch (error) {
      console.error('Error cargando reportes:', error);
      setErrores({ general: 'Error al cargar los reportes' });
    } finally {
      setLoading(false);
    }
  };

  // Calcular medicamentos entregados por mes
  const calcularMedicamentosEntregados = (ordenes) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ahora = new Date();
    const ultimos7Meses = [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      ultimos7Meses.push({
        mes: meses[fecha.getMonth()],
        año: fecha.getFullYear(),
        mesNum: fecha.getMonth()
      });
    }

    // Simular cantidad de medicamentos entregados 
    return ultimos7Meses.map(({ mes, año, mesNum }) => {
      const ordenesDelMes = ordenes.filter(orden => {
        const fechaOrden = new Date(orden.fecha);
        return fechaOrden.getMonth() === mesNum && 
               fechaOrden.getFullYear() === año &&
               orden.estado === 'entregado';
      }).length;
      
      // Simular cantidad de medicamentos (promedio de 50 medicamentos por orden)
      return ordenesDelMes * 50;
    });
  };

  // Calcular alertas resueltas
  const calcularAlertasResueltas = (medicamentos) => {
    const totalMedicamentos = medicamentos.length;
    const medicamentosConAlerta = medicamentos.filter(med => 
      med.stock_actual <= med.stock_minimo
    ).length;
    const medicamentosSinAlerta = totalMedicamentos - medicamentosConAlerta;
    
    return {
      resueltas: medicamentosSinAlerta,
      total: totalMedicamentos
    };
  };

  // Calcular pedidos completados
  const calcularPedidosCompletados = (ordenes) => {
    const totalOrdenes = ordenes.length;
    const ordenesCompletadas = ordenes.filter(orden => 
      orden.estado === 'entregado'
    ).length;
    const ordenesPendientes = totalOrdenes - ordenesCompletadas;
    
    return {
      completados: ordenesCompletadas,
      total: totalOrdenes
    };
  };

  // Obtener órdenes del mes actual
  const obtenerOrdenesDelMes = (ordenes) => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    return ordenes
      .filter(orden => {
        const fechaOrden = new Date(orden.fecha);
        return fechaOrden.getMonth() === mesActual && 
               fechaOrden.getFullYear() === añoActual;
      })
      .slice(0, 10); 
  };

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "";
    return new Date(fechaString).toLocaleDateString('es-ES');
  };

  // Obtener nombre del mes actual
  const obtenerMesActual = () => {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const ahora = new Date();
    return meses[ahora.getMonth()];
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  // Datos para gráficos
  const barData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"].slice(-7),
    datasets: [
      {
        label: "Medicamentos",
        data: reportesData.medicamentosEntregados,
        backgroundColor: "#5cc3b6",
      },
    ],
  };

  const donutData1 = {
    labels: ["Resueltas", "Pendientes"],
    datasets: [{ 
      data: [
        reportesData.alertasResueltas.resueltas, 
        reportesData.alertasResueltas.total - reportesData.alertasResueltas.resueltas
      ], 
      backgroundColor: ["#5cc3b6", "#e0e0e0"] 
    }],
  };

  const donutData2 = {
    labels: ["Completados", "Pendientes"],
    datasets: [{ 
      data: [
        reportesData.pedidosCompletados.completados, 
        reportesData.pedidosCompletados.total - reportesData.pedidosCompletados.completados
      ], 
      backgroundColor: ["#5cc3b6", "#e0e0e0"] 
    }],
  };

  const barOptions = {
    plugins: { 
      legend: { display: false } 
    }, 
    responsive: true 
  };

  const donutOptions = {
    plugins: { 
      legend: { display: false } 
    },
    cutout: "70%",
    responsive: true,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activePage="reportes" />
        <main className="flex-1 p-8 overflow-auto">
          <Header title="Reportes" subtitle="Cargando datos..." />
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
      <Sidebar activePage="reportes" />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <Header 
          title="Reportes" 
          subtitle={`${new Date().getDate()} de ${obtenerMesActual()}, de ${new Date().getFullYear()}`}
        />

        {errores.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errores.general}
          </div>
        )}

        {/* Cards */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Medicamentos Entregados en el mes
            </h3>
            <div className="text-[#2c776d] text-2xl font-bold mb-3">
              {reportesData.medicamentosEntregados[reportesData.medicamentosEntregados.length - 1] || 0}
            </div>
            <Bar data={barData} options={barOptions} />
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Alertas resueltas</h3>
            <div className="text-[#2c776d] text-2xl font-bold mb-3">
              {reportesData.alertasResueltas.total > 0 
                ? Math.round((reportesData.alertasResueltas.resueltas / reportesData.alertasResueltas.total) * 100) 
                : 0
              }%
            </div>
            <Doughnut data={donutData1} options={donutOptions} />
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Pedidos completados</h3>
            <div className="text-[#2c776d] text-2xl font-bold mb-3">
              {reportesData.pedidosCompletados.completados}
            </div>
            <Doughnut data={donutData2} options={donutOptions} />
          </div>
        </section>

        {/* Tabla */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Órdenes del mes de {obtenerMesActual()} de {new Date().getFullYear()}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold text-gray-700">Orden</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Paciente</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {reportesData.ordenesDelMes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                      No hay órdenes para el mes actual
                    </td>
                  </tr>
                ) : (
                  reportesData.ordenesDelMes.map((orden) => (
                    <tr key={orden.id} className="border-b hover:bg-gray-50 text-gray-700">
                      <td className="py-3 px-4 font-mono">{orden.identificacion}</td>
                      <td className="py-3 px-4">{orden.paciente_nombre}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          orden.estado === 'entregado' 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {orden.estado_display}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatearFecha(orden.fecha)}</td>
                      <td className="py-3 px-4">{orden.descripcion || 'Sin descripción'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-5">
            <button className="bg-[#a2d6ce] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#7cb7ad] transition">
              Exportar
            </button>
            <button className="bg-[#5cc3b6] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#48a399] transition">
              Generar reporte
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reportes;