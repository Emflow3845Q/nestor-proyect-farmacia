import React, { useState, useEffect } from "react";
import api from "../../config/axios";

const AddMedicamentoForm = ({ onClose, onSave }) => {
  const [datosFormulario, setDatosFormulario] = useState({
    id_medicamento: "",
    nombre_producto: "",
    presentacion: "",
    categoria: "",
    laboratorio: "",
    lote: "",
    fecha_vencimiento: "",
    stock_actual: 0,
    stock_minimo: 10,
    precio_unitario: 0,
    ubicacion: "",
    proveedor: "",
    fecha_ingreso: new Date().toISOString().split('T')[0],
    observaciones: "",
    uso_frecuente: false
  });

  const [opcionesCategoria, setOpcionesCategoria] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errores, setErrores] = useState({});

  // Cargar opciones de categoría desde el backend
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        console.log('Cargando categorías desde:', '/api/medicamentos/opciones_categoria/');
        const response = await api.get('/api/medicamentos/opciones_categoria/');
        setOpcionesCategoria(response);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        console.error('Detalles del error:', error.response);
        // Opciones por defecto si falla
        setOpcionesCategoria([
          ['analgesico', 'Analgésico'],
          ['antibiotico', 'Antibiótico'],
          ['antiinflamatorio', 'Antiinflamatorio'],
          ['antihistaminico', 'Antihistamínico'],
          ['cardiovascular', 'Cardiovascular'],
          ['digestivo', 'Digestivo'],
          ['respiratorio', 'Respiratorio'],
          ['rehidratante', 'Rehidratante'],
          ['antiseptico', 'Antiséptico'],
          ['gastroprotector', 'Gastroprotector'],
          ['antialergico', 'Antialérgico'],
          ['otros', 'Otros']
        ]);
      } finally {
        setCargandoCategorias(false);
      }
    };
    cargarCategorias();
  }, []);

  const manejarCambio = (e) => {
    const { id, value, type, checked } = e.target;
    
    setDatosFormulario(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    
    if (errores[id]) {
      setErrores(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrores({});

    try {
      console.log('Enviando datos a:', '/api/medicamentos/', datosFormulario);
      const response = await api.post('/api/medicamentos/', datosFormulario);
      console.log('Medicamento guardado:', response);
      onSave(response);
      onClose();
    } catch (error) {
      console.error('Error guardando medicamento:', error);
      console.error('Detalles del error:', error.response);
      if (error.response?.data) {
        setErrores(error.response);
      } else {
        setErrores({ general: 'Error al guardar el medicamento. Verifique la conexión.' });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Añadir Medicamento</h2>

          {errores.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errores.general}
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-4">
            {/* Fila 1: ID y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="id_medicamento" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Medicamento *
                </label>
                <input
                  type="text"
                  id="id_medicamento"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.id_medicamento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 1, 2, 3..."
                  value={datosFormulario.id_medicamento}
                  onChange={manejarCambio}
                  required
                />
                {errores.id_medicamento && (
                  <p className="text-red-500 text-sm mt-1">{errores.id_medicamento}</p>
                )}
              </div>

              <div>
                <label htmlFor="nombre_producto" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="nombre_producto"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.nombre_producto ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Paracetamol 500 mg"
                  value={datosFormulario.nombre_producto}
                  onChange={manejarCambio}
                  required
                />
                {errores.nombre_producto && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombre_producto}</p>
                )}
              </div>
            </div>

            {/* Fila 2: Presentación y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="presentacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Presentación *
                </label>
                <input
                  type="text"
                  id="presentacion"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.presentacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Tabletas x 10, Cápsulas x 12..."
                  value={datosFormulario.presentacion}
                  onChange={manejarCambio}
                  required
                />
                {errores.presentacion && (
                  <p className="text-red-500 text-sm mt-1">{errores.presentacion}</p>
                )}
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="categoria"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.categoria ? 'border-red-500' : 'border-gray-300'
                  } ${!datosFormulario.categoria ? 'text-gray-400' : ''}`}
                  value={datosFormulario.categoria}
                  onChange={manejarCambio}
                  required
                  disabled={cargandoCategorias}
                >
                  <option value="" disabled className="text-gray-400">
                    {cargandoCategorias ? 'Cargando categorías...' : 'Seleccione una categoría'}
                  </option>
                  {opcionesCategoria.map(([valor, etiqueta]) => (
                    <option key={valor} value={valor} className="text-gray-800">
                      {etiqueta}
                    </option>
                  ))}
                </select>
                {errores.categoria && (
                  <p className="text-red-500 text-sm mt-1">{errores.categoria}</p>
                )}
              </div>
            </div>

            {/* Fila 3: Laboratorio y Lote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="laboratorio" className="block text-sm font-medium text-gray-700 mb-1">
                  Laboratorio *
                </label>
                <input
                  type="text"
                  id="laboratorio"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.laboratorio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Genfar, Pfizer, Tecnoquímicas..."
                  value={datosFormulario.laboratorio}
                  onChange={manejarCambio}
                  required
                />
                {errores.laboratorio && (
                  <p className="text-red-500 text-sm mt-1">{errores.laboratorio}</p>
                )}
              </div>

              <div>
                <label htmlFor="lote" className="block text-sm font-medium text-gray-700 mb-1">
                  Lote *
                </label>
                <input
                  type="text"
                  id="lote"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.lote ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: L1234, A5678..."
                  value={datosFormulario.lote}
                  onChange={manejarCambio}
                  required
                />
                {errores.lote && (
                  <p className="text-red-500 text-sm mt-1">{errores.lote}</p>
                )}
              </div>
            </div>

            {/* Fila 4: Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  id="fecha_vencimiento"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.fecha_vencimiento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={datosFormulario.fecha_vencimiento}
                  onChange={manejarCambio}
                  required
                />
                {errores.fecha_vencimiento && (
                  <p className="text-red-500 text-sm mt-1">{errores.fecha_vencimiento}</p>
                )}
              </div>

              <div>
                <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  id="fecha_ingreso"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent"
                  value={datosFormulario.fecha_ingreso}
                  onChange={manejarCambio}
                />
              </div>
            </div>

            {/* Fila 5: Stocks y Precio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stock_actual" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Actual *
                </label>
                <input
                  type="number"
                  id="stock_actual"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.stock_actual ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  value={datosFormulario.stock_actual}
                  onChange={manejarCambio}
                  required
                />
                {errores.stock_actual && (
                  <p className="text-red-500 text-sm mt-1">{errores.stock_actual}</p>
                )}
              </div>

              <div>
                <label htmlFor="stock_minimo" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  id="stock_minimo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.stock_minimo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  value={datosFormulario.stock_minimo}
                  onChange={manejarCambio}
                  required
                />
                {errores.stock_minimo && (
                  <p className="text-red-500 text-sm mt-1">{errores.stock_minimo}</p>
                )}
              </div>

              <div>
                <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario (COP) *
                </label>
                <input
                  type="number"
                  id="precio_unitario"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.precio_unitario ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  placeholder="1200, 3500..."
                  value={datosFormulario.precio_unitario}
                  onChange={manejarCambio}
                  required
                />
                {errores.precio_unitario && (
                  <p className="text-red-500 text-sm mt-1">{errores.precio_unitario}</p>
                )}
              </div>
            </div>

            {/* Fila 6: Ubicación y Proveedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación *
                </label>
                <input
                  type="text"
                  id="ubicacion"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.ubicacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Estante A1, Almacén B3..."
                  value={datosFormulario.ubicacion}
                  onChange={manejarCambio}
                  required
                />
                {errores.ubicacion && (
                  <p className="text-red-500 text-sm mt-1">{errores.ubicacion}</p>
                )}
              </div>

              <div>
                <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor *
                </label>
                <input
                  type="text"
                  id="proveedor"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.proveedor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Distribuidora Farma, FarmaExpress..."
                  value={datosFormulario.proveedor}
                  onChange={manejarCambio}
                  required
                />
                {errores.proveedor && (
                  <p className="text-red-500 text-sm mt-1">{errores.proveedor}</p>
                )}
              </div>
            </div>

            {/* Fila 7: Observaciones y Uso Frecuente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent"
                  placeholder="Ej: Buen estado, Controlado, Mantener seco..."
                  value={datosFormulario.observaciones}
                  onChange={manejarCambio}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    id="uso_frecuente"
                    checked={datosFormulario.uso_frecuente}
                    onChange={manejarCambio}
                    className="rounded focus:ring-[#5cc3b6]"
                  />
                  Uso Frecuente
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={cargando}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando || cargandoCategorias}
                className="px-4 py-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white rounded-md transition font-medium disabled:opacity-50 flex items-center"
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Medicamento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicamentoForm;