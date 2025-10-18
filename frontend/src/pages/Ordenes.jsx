import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AddOrderForm from "../components/forms/AddOrderForm";
import api from "../config/axios";
import { FaPlus, FaSync, FaCheck, FaClock } from "react-icons/fa";

const Ordenes = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [errores, setErrores] = useState({});
  const [cambiandoEstado, setCambiandoEstado] = useState({});

  const cargarOrdenes = async (buscar = "") => {
    try {
      setCargando(true);
      const params = buscar ? { buscar } : {};
      console.log('Cargando órdenes desde:', '/api/ordenes/');
      const response = await api.get('/api/ordenes/', { params });
      console.log('Respuesta completa:', response);
      console.log('Datos de órdenes:', response);
      
      let ordenesData = response;
      
      if (ordenesData && typeof ordenesData === 'object' && !Array.isArray(ordenesData)) {
        const arrayKey = Object.keys(ordenesData).find(key => Array.isArray(ordenesData[key]));
        if (arrayKey) {
          ordenesData = ordenesData[arrayKey];
          console.log('Encontrado array en propiedad:', arrayKey);
        } else {
          ordenesData = [ordenesData];
        }
      }
      
      if (!Array.isArray(ordenesData)) {
        console.warn('Los datos no son un array, convirtiendo a array vacío');
        ordenesData = [];
      }
      
      setOrdenes(ordenesData);
      setErrores({});
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      console.error('Detalles del error:', error.response);
      setErrores({ general: 'Error al cargar las órdenes. Verifique que el servidor esté funcionando.' });
      setOrdenes([]); 
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    cargarOrdenes(valor);
  };

  const manejarAgregarOrden = (nuevaOrden) => {
    setOrdenes(prev => [nuevaOrden, ...prev]);
    setMostrarFormulario(false);
  };

const cambiarEstadoOrden = async (ordenId, nuevoEstado) => {
  try {
    setCambiandoEstado(prev => ({ ...prev, [ordenId]: true }));
    
    console.log(`Cambiando estado de orden ${ordenId} a ${nuevoEstado}`);
    
    // Con el interceptor actual, response ya es response.data
    const responseData = await api.patch(`/api/ordenes/${ordenId}/cambiar_estado/`, {
      estado: nuevoEstado
    });
    
    console.log('Datos de respuesta:', responseData);
    
    // Manejar diferentes formatos de respuesta
    let ordenActualizada;
    
    if (responseData.orden) {
      // Si la respuesta tiene propiedad 'orden'
      ordenActualizada = responseData.orden;
    } else if (responseData.id) {
      // Si la respuesta es directamente la orden
      ordenActualizada = responseData;
    } else {
      console.warn('Formato de respuesta inesperado:', responseData);
      // Recargar las órdenes para asegurar que tenemos los datos actualizados
      cargarOrdenes(terminoBusqueda);
      return;
    }
    
    // Actualizar la orden en el estado local
    setOrdenes(prev => prev.map(orden => 
      orden.id === ordenId ? ordenActualizada : orden
    ));
    
    // Mostrar mensaje de éxito
    setErrores({});
    
  } catch (error) {
    console.error('Error cambiando estado:', error);
    console.error('Detalles del error:', error);
    
    let mensajeError = 'Error al cambiar el estado de la orden';
    if (error?.data?.error) {
      mensajeError = error.data.error;
    } else if (error?.data?.mensaje) {
      mensajeError = error.data.mensaje;
    } else if (error?.message) {
      mensajeError = error.message;
    }
    
    setErrores({ 
      general: mensajeError
    });
  } finally {
    setCambiandoEstado(prev => ({ ...prev, [ordenId]: false }));
  }
};

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "";
    return new Date(fechaString).toLocaleDateString('es-ES');
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium";
      case 'entregado':
        return "text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const getOrdenesArray = () => {
    return Array.isArray(ordenes) ? ordenes : [];
  };

  const ordenesArray = getOrdenesArray();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage="ordenes" />
      
      <main className="flex-1 p-4 overflow-auto">
        <Header title="Órdenes" />

        {errores.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errores.general}
          </div>
        )}

        {/* Barra de acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar órdenes..."
            value={terminoBusqueda}
            onChange={manejarBusqueda}
            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5cc3b6] bg-gray-50"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center justify-center gap-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white font-semibold px-4 py-2 rounded-md transition flex-1 sm:flex-none"
            >
              <FaPlus /> Nueva Orden
            </button>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <section className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-left border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">Paciente</th>
                <th className="px-3 py-2 font-semibold text-gray-700">ID Orden</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Fecha</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Estado</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5cc3b6]"></div>
                      <span>Cargando órdenes...</span>
                    </div>
                  </td>
                </tr>
              ) : ordenesArray.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    {terminoBusqueda ? 'No se encontraron órdenes que coincidan con la búsqueda' : 'No se encontraron órdenes'}
                  </td>
                </tr>
              ) : (
                ordenesArray.map((orden) => (
                  <tr key={orden.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{orden.paciente_nombre}</div>
                      <div className="text-sm text-gray-500">
                        {orden.tipo_identificacion_display} {orden.paciente_identificacion}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-sm">
                      {orden.identificacion}
                    </td>
                    <td className="px-3 py-2">
                      {formatearFecha(orden.fecha)}
                    </td>
                    <td className="px-3 py-2">
                      <span className={obtenerClaseEstado(orden.estado)}>
                        {orden.estado_display}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {orden.estado === 'pendiente' ? (
                          <button
                            onClick={() => cambiarEstadoOrden(orden.id, 'entregado')}
                            disabled={cambiandoEstado[orden.id]}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition disabled:opacity-50"
                          >
                            {cambiandoEstado[orden.id] ? (
                              <FaSync className="animate-spin" />
                            ) : (
                              <FaCheck />
                            )}
                            Marcar Entregado
                          </button>
                        ) : (
                          <button
                            onClick={() => cambiarEstadoOrden(orden.id, 'pendiente')}
                            disabled={cambiandoEstado[orden.id]}
                            className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition disabled:opacity-50"
                          >
                            {cambiandoEstado[orden.id] ? (
                              <FaSync className="animate-spin" />
                            ) : (
                              <FaClock />
                            )}
                            Volver a Pendiente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Modal del Formulario */}
        {mostrarFormulario && (
          <AddOrderForm
            onClose={() => setMostrarFormulario(false)}
            onSave={manejarAgregarOrden}
          />
        )}
      </main>
    </div>
  );
};

export default Ordenes;