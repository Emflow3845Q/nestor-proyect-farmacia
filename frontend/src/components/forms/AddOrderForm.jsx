import React, { useState, useEffect } from "react";
import api from "../../config/axios";

const AddOrderForm = ({ onClose, onSave }) => {
  const [datosFormulario, setDatosFormulario] = useState({
    paciente: "",
    identificacion: "",
    fecha: new Date().toISOString().split('T')[0],
    estado: "", 
    descripcion: ""
  });

  const [pacientes, setPacientes] = useState([]);
  const [opcionesEstado, setOpcionesEstado] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);
  const [cargandoEstados, setCargandoEstados] = useState(true);
  const [errores, setErrores] = useState({});

  // Cargar pacientes y opciones de estado desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log('Cargando datos para nueva orden...');
        
        // Cargar pacientes
        console.log('Cargando pacientes desde:', '/api/pacientes/');
        const responsePacientes = await api.get('/api/pacientes/');
        console.log('Pacientes cargados:', responsePacientes);
        setPacientes(responsePacientes);

        // Cargar opciones de estado desde el backend
        console.log('Cargando estados desde:', '/api/ordenes/opciones_estado/');
        const responseEstados = await api.get('/api/ordenes/opciones_estado/');
        console.log('Estados cargados:', responseEstados);
        setOpcionesEstado(responseEstados);
      } catch (error) {
        console.error('Error cargando datos:', error);
        console.error('Detalles del error:', error.response);
        // Si falla el backend, usar opciones por defecto
        setOpcionesEstado([
          ['pendiente', 'Pendiente'],
          ['entregado', 'Entregado']
        ]);
      } finally {
        setCargandoPacientes(false);
        setCargandoEstados(false);
      }
    };
    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    const { id, value } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [id]: value
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
    
    // Validar que se haya seleccionado un paciente
    if (!datosFormulario.paciente) {
      setErrores({ paciente: 'Por favor seleccione un paciente' });
      return;
    }

    // Validar que se haya seleccionado un estado
    if (!datosFormulario.estado) {
      setErrores({ estado: 'Por favor seleccione un estado' });
      return;
    }

    setCargando(true);
    setErrores({});

    try {
      console.log('Enviando datos a:', '/api/ordenes/', datosFormulario);
      const response = await api.post('/api/ordenes/', datosFormulario);
      console.log('Orden creada:', response);
      onSave(response);
      onClose();
    } catch (error) {
      console.error('Error creando orden:', error);
      console.error('Detalles del error:', error.response);
      if (error.response) {
        setErrores(error.response);
      } else {
        setErrores({ general: 'Error al guardar la orden. Verifique la conexión.' });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Orden</h2>

          {errores.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errores.general}
            </div>
          )}

          <form onSubmit={manejarEnvio}>
            {/* Paciente */}
            <div className="mb-4">
              <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                id="paciente"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                  errores.paciente ? 'border-red-500' : 'border-gray-300'
                } ${!datosFormulario.paciente ? 'text-gray-400' : ''}`}
                value={datosFormulario.paciente}
                onChange={manejarCambio}
                required
                disabled={cargandoPacientes}
              >
                <option value="" disabled className="text-gray-400">
                  {cargandoPacientes ? 'Cargando pacientes...' : 'Seleccione un paciente'}
                </option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id} className="text-gray-800">
                    {paciente.nombre_completo} - {paciente.tipo_identificacion_display} {paciente.numero_identificacion}
                  </option>
                ))}
              </select>
              {errores.paciente && (
                <p className="text-red-500 text-sm mt-1">{errores.paciente}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* ID Orden */}
              <div>
                <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Orden *
                </label>
                <input
                  type="text"
                  id="identificacion"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.identificacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: ORD-001"
                  value={datosFormulario.identificacion}
                  onChange={manejarCambio}
                  required
                />
                {errores.identificacion && (
                  <p className="text-red-500 text-sm mt-1">{errores.identificacion}</p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  id="fecha"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errores.fecha ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={datosFormulario.fecha}
                  onChange={manejarCambio}
                  required
                />
                {errores.fecha && (
                  <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="mb-4">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="estado"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                  errores.estado ? 'border-red-500' : 'border-gray-300'
                } ${!datosFormulario.estado ? 'text-gray-400' : ''}`}
                value={datosFormulario.estado}
                onChange={manejarCambio}
                required
                disabled={cargandoEstados}
              >
                <option value="" disabled className="text-gray-400">
                  {cargandoEstados ? 'Cargando estados...' : 'Seleccione un estado'}
                </option>
                {opcionesEstado.map(([valor, etiqueta]) => (
                  <option key={valor} value={valor} className="text-gray-800">
                    {etiqueta}
                  </option>
                ))}
              </select>
              {errores.estado && (
                <p className="text-red-500 text-sm mt-1">{errores.estado}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent"
                placeholder="Descripción de la orden..."
                value={datosFormulario.descripcion}
                onChange={manejarCambio}
              />
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
                disabled={cargando || cargandoPacientes || cargandoEstados}
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
                  'Crear Orden'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrderForm;