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
import { FaCheckCircle, FaExclamationCircle, FaClipboardList } from "react-icons/fa";
import api from "../config/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Inventarios = () => {
  const [inventarioData, setInventarioData] = useState({
    estadisticas: {
      stockDisponible: 0,
      alertasVencimiento: 0,
      ordenesPendientes: 0
    },
    medicamentosMasUsados: [],
    distribucionAreas: [],
    ordenesPendientes: [],
    medicamentosProximosVencer: []
  });
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState({});

  // Cargar datos de inventario
  const cargarInventario = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de medicamentos y órdenes
      const [medicamentosRes, ordenesRes] = await Promise.all([
        api.get('/api/medicamentos/'),
        api.get('/api/ordenes/')
      ]);

      const medicamentos = Array.isArray(medicamentosRes) ? medicamentosRes : [];
      const ordenes = Array.isArray(ordenesRes) ? ordenesRes : [];

      // Calcular estadísticas
      const estadisticas = calcularEstadisticas(medicamentos, ordenes);
      
      // Calcular medicamentos más usados
      const medicamentosMasUsados = calcularMedicamentosMasUsados(medicamentos, ordenes);
      
      // Calcular distribución por áreas (simulado)
      const distribucionAreas = calcularDistribucionAreas(ordenes);
      
      // Obtener órdenes pendientes
      const ordenesPendientes = obtenerOrdenesPendientes(ordenes);
      
      // Obtener medicamentos próximos a vencer
      const medicamentosProximosVencer = obtenerMedicamentosProximosVencer(medicamentos);

      setInventarioData({
        estadisticas,
        medicamentosMasUsados,
        distribucionAreas,
        ordenesPendientes,
        medicamentosProximosVencer
      });
      setErrores({});

    } catch (error) {
      console.error('Error cargando inventario:', error);
      setErrores({ general: 'Error al cargar los datos del inventario' });
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas generales
  const calcularEstadisticas = (medicamentos, ordenes) => {
    const totalMedicamentos = medicamentos.length;
    const medicamentosStockBajo = medicamentos.filter(med => 
      med.stock_actual <= med.stock_minimo
    ).length;
    
    const porcentajeStockDisponible = totalMedicamentos > 0 
      ? Math.round(((totalMedicamentos - medicamentosStockBajo) / totalMedicamentos) * 100)
      : 0;

    // Calcular alertas de vencimiento (medicamentos que vencen en los próximos 30 días)
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    
    const alertasVencimiento = medicamentos.filter(med => {
      if (!med.fecha_vencimiento) return false;
      const fechaVencimiento = new Date(med.fecha_vencimiento);
      return fechaVencimiento <= en30Dias && fechaVencimiento >= hoy;
    }).length;

    // Calcular órdenes pendientes
    const ordenesPendientes = ordenes.filter(orden => 
      orden.estado === 'pendiente'
    ).length;

    return {
      stockDisponible: porcentajeStockDisponible,
      alertasVencimiento,
      ordenesPendientes
    };
  };

  // Calcular medicamentos más usados 
  const calcularMedicamentosMasUsados = (medicamentos) => {
    // Ordenar por uso frecuente y stock bajo
    return medicamentos
      .filter(med => med.uso_frecuente)
      .sort((a, b) => {
        const prioridadA = a.uso_frecuente ? 2 : 1;
        const prioridadB = b.uso_frecuente ? 2 : 1;
        return (prioridadB * b.stock_minimo / (b.stock_actual || 1)) - (prioridadA * a.stock_minimo / (a.stock_actual || 1));
      })
      .slice(0, 5) 
      .map(med => ({
        nombre: med.nombre_producto,
        frecuencia: Math.round((med.stock_minimo / (med.stock_actual || 1)) * 10)
      }));
  };

  // Calcular distribución por áreas (simulado)
  const calcularDistribucionAreas = (ordenes) => {
    const areas = ['Urgencias', 'Hospitalización', 'Consulta Externa'];
    
    // Simular distribución basada en órdenes
    const totalOrdenes = ordenes.length;
    if (totalOrdenes === 0) {
      return areas.map(area => ({ area, porcentaje: 33 }));
    }

    // Distribuir proporcionalmente
    return areas.map((area, index) => ({
      area,
      porcentaje: Math.round((100 / areas.length) + (Math.random() * 20 - 10)) // Variación aleatoria
    }));
  };

  // Obtener órdenes pendientes
  const obtenerOrdenesPendientes = (ordenes) => {
    return ordenes
      .filter(orden => orden.estado === 'pendiente')
      .slice(0, 5) 
      .map(orden => ({
        id: orden.id,
        paciente: orden.paciente_nombre,
        estado: orden.estado_display
      }));
  };

  // Obtener medicamentos próximos a vencer
  const obtenerMedicamentosProximosVencer = (medicamentos) => {
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    return medicamentos
      .filter(med => {
        if (!med.fecha_vencimiento) return false;
        const fechaVencimiento = new Date(med.fecha_vencimiento);
        return fechaVencimiento <= en30Dias && fechaVencimiento >= hoy;
      })
      .slice(0, 5)
      .map(med => ({
        nombre: med.nombre_producto,
        fecha: med.fecha_vencimiento,
        cantidad: med.stock_actual
      }));
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
    cargarInventario();
  }, []);

  // Datos para gráficos
  const barData = {
    labels: inventarioData.medicamentosMasUsados.map(med => med.nombre),
    datasets: [
      {
        label: "Frecuencia de uso",
        data: inventarioData.medicamentosMasUsados.map(med => med.frecuencia),
        backgroundColor: "#5cc3b6",
      },
    ],
  };

  const donutData = {
    labels: inventarioData.distribucionAreas.map(area => area.area),
    datasets: [
      {
        data: inventarioData.distribucionAreas.map(area => area.porcentaje),
        backgroundColor: ["#5cc3b6", "#48a399", "#cce5e0"],
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const donutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar activePage="inventarios" />
        <main className="flex-1 p-8 overflow-auto">
          <Header title="Inventarios" subtitle="Cargando datos..." />
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
      <Sidebar activePage="inventarios" />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <Header 
          title="Inventarios" 
          subtitle={`${new Date().getDate()} de ${obtenerMesActual()}, de ${new Date().getFullYear()}`}
        />

        {errores.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errores.general}
          </div>
        )}

        {/* Tarjetas resumen */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{inventarioData.estadisticas.stockDisponible}%</h3>
            <p className="text-gray-500">Stock Disponible</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <FaExclamationCircle className="text-yellow-500 text-3xl mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{inventarioData.estadisticas.alertasVencimiento}</h3>
            <p className="text-gray-500">Alertas de Vencimiento</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <FaClipboardList className="text-[#5cc3b6] text-3xl mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-700">{inventarioData.estadisticas.ordenesPendientes}</h3>
            <p className="text-gray-500">Órdenes Pendientes</p>
          </div>
        </section>

        {/* Gráficos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Medicamentos más usados</h3>
            <div className="h-48">
              {inventarioData.medicamentosMasUsados.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay datos de medicamentos usados
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Distribución por área hospitalaria</h3>
            <div className="h-48">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>
        </section>

        {/* Tablas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Órdenes Pendientes</h3>
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Paciente</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventarioData.ordenesPendientes.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-3 py-2 text-center text-gray-500">
                      No hay órdenes pendientes
                    </td>
                  </tr>
                ) : (
                  inventarioData.ordenesPendientes.map((orden) => (
                    <tr key={orden.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{orden.paciente}</td>
                      <td className="px-3 py-2">
                        <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
                          {orden.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Medicamentos Próximos a Vencer</h3>
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Medicamento</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {inventarioData.medicamentosProximosVencer.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-center text-gray-500">
                      No hay medicamentos próximos a vencer
                    </td>
                  </tr>
                ) : (
                  inventarioData.medicamentosProximosVencer.map((med, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{med.nombre}</td>
                      <td className="px-3 py-2">{formatearFecha(med.fecha)}</td>
                      <td className="px-3 py-2">{med.cantidad}</td>
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

export default Inventarios;