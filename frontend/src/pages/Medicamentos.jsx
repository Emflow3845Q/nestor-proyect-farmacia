import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AddMedicamentoForm from "../components/forms/AddMedicamentoForm";
import UploadExcelForm from "../components/forms/UploadExcelForm";
import api from "../config/axios"; 
import { FaPlus, FaUpload, FaDownload } from "react-icons/fa";

const Medicamentos = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarUploadForm, setMostrarUploadForm] = useState(false);
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [errores, setErrores] = useState({});

  const cargarMedicamentos = async (buscar = "") => {
    try {
      setCargando(true);
      const params = buscar ? { buscar } : {};
      console.log('Cargando medicamentos desde:', '/api/medicamentos/');
      const response = await api.get('/api/medicamentos/', { params });
      console.log('Medicamentos cargados:', response);
      setMedicamentos(response);
      setErrores({});
    } catch (error) {
      console.error('Error cargando medicamentos:', error);
      console.error('Detalles del error:', error.response);
      setErrores({ general: 'Error al cargar los medicamentos. Verifique que el servidor esté funcionando.' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    cargarMedicamentos(valor);
  };

  const manejarAgregarMedicamento = (nuevoMedicamento) => {
    setMedicamentos(prev => [nuevoMedicamento, ...prev]);
    setMostrarFormulario(false);
  };

  const manejarUploadCompleto = () => {
    cargarMedicamentos(); 
    setMostrarUploadForm(false);
  };

  const descargarPlantilla = async () => {
    try {
      console.log('Descargando plantilla desde:', '/api/medicamentos/descargar_plantilla/');
      const response = await api.get('/api/medicamentos/descargar_plantilla/', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_medicamentos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      setErrores({ general: 'Error al descargar la plantilla' });
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "";
    return new Date(fechaString).toLocaleDateString('es-ES');
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const obtenerClaseStock = (estadoStock) => {
    switch (estadoStock) {
      case 'bajo':
        return "text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium";
      case 'agotado':
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const manejarUsoFrecuente = async (medicamentoId, usoFrecuente) => {
    try {
      await api.patch(`/api/medicamentos/${medicamentoId}/`, {
        uso_frecuente: usoFrecuente
      });
      cargarMedicamentos(); 
    } catch (error) {
      console.error('Error actualizando uso frecuente:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage="medicamentos" />

      <main className="flex-1 p-4 overflow-auto">
        <Header title="Medicamentos" />

        {errores.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errores.general}
          </div>
        )}

        {/* Barra de acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, laboratorio, categoría..."
            value={terminoBusqueda}
            onChange={manejarBusqueda}
            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5cc3b6] bg-gray-50"
          />

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={descargarPlantilla}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-3 py-2 rounded-md transition flex-1 sm:flex-none"
            >
              <FaDownload /> Plantilla
            </button>
            <button
              onClick={() => setMostrarUploadForm(true)}
              className="flex items-center justify-center gap-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white font-semibold px-3 py-2 rounded-md transition flex-1 sm:flex-none"
            >
              <FaUpload /> Cargar Excel
            </button>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center justify-center gap-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white font-semibold px-3 py-2 rounded-md transition flex-1 sm:flex-none"
            >
              <FaPlus /> Añadir Medicamento
            </button>
          </div>
        </div>

        {/* Tabla de medicamentos */}
        <section className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-left border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">ID</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Medicamento</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Presentación</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Categoría</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Stock</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Precio</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Vencimiento</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Ubicación</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Uso Frecuente</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5cc3b6]"></div>
                      <span>Cargando medicamentos...</span>
                    </div>
                  </td>
                </tr>
              ) : medicamentos.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {terminoBusqueda ? 'No se encontraron medicamentos que coincidan con la búsqueda' : 'No se encontraron medicamentos'}
                  </td>
                </tr>
              ) : (
                medicamentos.map((medicamento) => (
                  <tr key={medicamento.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-sm">
                      {medicamento.id_medicamento}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{medicamento.nombre_producto}</div>
                      <div className="text-sm text-gray-500">{medicamento.laboratorio}</div>
                    </td>
                    <td className="px-3 py-2">{medicamento.presentacion}</td>
                    <td className="px-3 py-2">{medicamento.categoria_display}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{medicamento.stock_actual}</span>
                        <span className={obtenerClaseStock(medicamento.estado_stock)}>
                          {medicamento.estado_stock_display}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {formatearPrecio(medicamento.precio_unitario)}
                    </td>
                    <td className="px-3 py-2">
                      {formatearFecha(medicamento.fecha_vencimiento)}
                    </td>
                    <td className="px-3 py-2">{medicamento.ubicacion}</td>
                    <td className="px-3 py-2">
                      <label className="flex items-center gap-2 text-gray-700">
                        <input
                          type="checkbox"
                          checked={medicamento.uso_frecuente}
                          onChange={(e) => manejarUsoFrecuente(medicamento.id, e.target.checked)}
                          className="rounded focus:ring-[#5cc3b6]"
                        />
                        <span className={`text-sm ${medicamento.uso_frecuente ? 'text-[#5cc3b6] font-medium' : 'text-gray-500'}`}>
                          Frecuente
                        </span>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Modales */}
        {mostrarFormulario && (
          <AddMedicamentoForm
            onClose={() => setMostrarFormulario(false)}
            onSave={manejarAgregarMedicamento}
          />
        )}

        {mostrarUploadForm && (
          <UploadExcelForm
            onClose={() => setMostrarUploadForm(false)}
            onSuccess={manejarUploadCompleto}
          />
        )}
      </main>
    </div>
  );
};

export default Medicamentos;