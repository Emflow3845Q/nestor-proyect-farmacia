import React, { useState, useEffect } from "react";
import api from "../../config/axios";

const AddPatientForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    tipo_identificacion: "",
    numero_identificacion: "",
    fecha_ingreso: new Date().toISOString().split('T')[0],
    ultima_atencion: "",
    observaciones: ""
  });

  const [opcionesIdentificacion, setOpcionesIdentificacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOpciones, setLoadingOpciones] = useState(true);
  const [errors, setErrors] = useState({});

  // Cargar opciones solo desde el backend
  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        console.log('Cargando opciones de identificación desde:', '/api/pacientes/opciones_identificacion/');
        const response = await api.get('/api/pacientes/opciones_identificacion/');
        console.log('Opciones cargadas:', response);
        setOpcionesIdentificacion(response);
      } catch (error) {
        console.error('Error cargando opciones:', error);
        console.error('Detalles del error:', error.response);
        // Si falla el backend, usar opciones por defecto
        setOpcionesIdentificacion([
          ['CC', 'Cédula de Ciudadanía'],
          ['TI', 'Tarjeta de Identidad'],
          ['PA', 'Pasaporte']
        ]);
      } finally {
        setLoadingOpciones(false);
      }
    };
    fetchOpciones();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.tipo_identificacion) {
    setErrors({ tipo_identificacion: 'Por favor seleccione un tipo de identificación' });
    return;
  }

  setLoading(true);
  setErrors({});

  try {
    console.log('Enviando datos a:', '/api/pacientes/', formData);
    
    // Debug: mostrar URL completa
    const fullUrl = 'http://localhost:8000/api/pacientes/';
    console.log('URL completa:', fullUrl);
    
    const response = await api.post('/api/pacientes/', formData);
    console.log('Paciente guardado:', response);
    onSave(response);
    onClose();
  } catch (error) {
    console.error('Error guardando paciente - COMPLETO:', error);
    console.error('Config:', error.config);
    console.error('Response:', error.response);
    
    if (error.response?.data) {
      setErrors(error.response.data);
    } else {
      setErrors({ general: `Error: ${error.message}` });
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Añadir Paciente</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errors.nombre_completo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Juan López"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                />
                {errors.nombre_completo && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre_completo}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="tipo_identificacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de identificación *
                </label>
                <select
                  id="tipo_identificacion"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errors.tipo_identificacion ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.tipo_identificacion ? 'text-gray-400' : ''}`}
                  value={formData.tipo_identificacion}
                  onChange={handleChange}
                  required
                  disabled={loadingOpciones}
                >
                  <option value="" disabled className="text-gray-400">
                    {loadingOpciones ? 'Cargando opciones...' : 'Seleccione tipo de identificación'}
                  </option>
                  {opcionesIdentificacion.map(([value, label]) => (
                    <option key={value} value={value} className="text-gray-800">
                      {label}
                    </option>
                  ))}
                </select>
                {errors.tipo_identificacion && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipo_identificacion}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="numero_identificacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de identificación *
                </label>
                <input
                  type="text"
                  id="numero_identificacion"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errors.numero_identificacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Número de documento"
                  value={formData.numero_identificacion}
                  onChange={handleChange}
                  required
                />
                {errors.numero_identificacion && (
                  <p className="text-red-500 text-sm mt-1">{errors.numero_identificacion}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de ingreso *
                </label>
                <input
                  type="date"
                  id="fecha_ingreso"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent ${
                    errors.fecha_ingreso ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  required
                />
                {errors.fecha_ingreso && (
                  <p className="text-red-500 text-sm mt-1">{errors.fecha_ingreso}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="ultima_atencion" className="block text-sm font-medium text-gray-700 mb-1">
                  Última atención
                </label>
                <input
                  type="date"
                  id="ultima_atencion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent"
                  value={formData.ultima_atencion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent"
                placeholder="Notas sobre el paciente..."
                value={formData.observaciones}
                onChange={handleChange}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || loadingOpciones}
                className="px-4 py-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white rounded-md transition font-medium disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Paciente'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientForm;