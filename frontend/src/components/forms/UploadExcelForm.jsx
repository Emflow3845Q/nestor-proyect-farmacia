import React, { useState } from "react";
import api from "../../config/axios";
import { FaFileExcel, FaDownload } from "react-icons/fa";

const UploadExcelForm = ({ onClose, onSuccess }) => {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});

  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea un archivo Excel
      const extension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(extension)) {
        setErrores({ archivo: 'Por favor seleccione un archivo Excel (.xlsx o .xls)' });
        setArchivo(null);
        return;
      }
      
      setArchivo(file);
      setErrores({});
      setResultado(null);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!archivo) {
      setErrores({ archivo: 'Por favor seleccione un archivo' });
      return;
    }

    setCargando(true);
    setErrores({});

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      console.log('Enviando archivo a:', '/api/medicamentos/cargar_excel/');
      const response = await api.post('/api/medicamentos/cargar_excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Archivo procesado:', response);
      setResultado(response);
      
      if (response.errores.length === 0) {
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }

    } catch (error) {
      console.error('Error cargando archivo:', error);
      console.error('Detalles del error:', error.response);
      if (error.response?.data) {
        setErrores(error.response);
      } else {
        setErrores({ general: 'Error al cargar el archivo. Verifique la conexión.' });
      }
    } finally {
      setCargando(false);
    }
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
      console.error('Detalles del error:', error.response);
      setErrores({ general: 'Error al descargar la plantilla' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Cargar Medicamentos desde Excel</h2>

          {errores.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errores.general}
            </div>
          )}

          {/* Información de la plantilla */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Descargue la plantilla para conocer el formato requerido</li>
              <li>Las columnas marcadas con * son obligatorias</li>
              <li><strong>Categorías aceptadas:</strong> Analgésico, Antibiótico, Antiinflamatorio, Antihistamínico, Cardiovascular, Digestivo, Respiratorio, Rehidratante, Antiséptico, Gastroprotector, Antialérgico, Otros</li>
              <li>Las fechas deben estar en formato YYYY-MM-DD</li>
              <li>El ID debe ser único para cada medicamento</li>
            </ul>
            
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800 mb-1">Ejemplo de datos:</h4>
              <div className="text-xs text-yellow-700 font-mono">
                <div>ID: 1</div>
                <div>Nombre: Paracetamol 500 mg</div>
                <div>Presentación: Tabletas x 10</div>
                <div>Categoría: Analgésico</div>
                <div>Precio: 1200 (sin puntos decimales para pesos colombianos)</div>
              </div>
            </div>
          </div>

          {/* Botón para descargar plantilla */}
          <div className="mb-4">
            <button
              onClick={descargarPlantilla}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition"
            >
              <FaDownload /> Descargar Plantilla
            </button>
          </div>

          <form onSubmit={manejarEnvio}>
            {/* Selección de archivo */}
            <div className="mb-4">
              <label htmlFor="archivo" className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar archivo Excel *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="archivo"
                  accept=".xlsx,.xls"
                  onChange={manejarSeleccionArchivo}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5cc3b6] focus:border-transparent"
                />
                {archivo && (
                  <div className="flex items-center gap-2 text-green-600">
                    <FaFileExcel />
                    <span className="text-sm">{archivo.name}</span>
                  </div>
                )}
              </div>
              {errores.archivo && (
                <p className="text-red-500 text-sm mt-1">{errores.archivo}</p>
              )}
            </div>

            {/* Resultado de la carga */}
            {resultado && (
              <div className={`mb-4 p-4 rounded-md ${
                resultado.errores.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  resultado.errores.length > 0 ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  {resultado.errores.length > 0 ? 'Carga completada con errores' : '¡Carga exitosa!'}
                </h3>
                <p className={`text-sm ${
                  resultado.errores.length > 0 ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {resultado.mensaje} - Procesadas {resultado.total_filas} filas
                </p>
                
                {resultado.errores.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-yellow-800 mb-1">Errores encontrados:</h4>
                    <ul className="text-sm text-yellow-700 max-h-32 overflow-y-auto">
                      {resultado.errores.map((error, index) => (
                        <li key={index} className="py-1 border-b border-yellow-200 last:border-b-0">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

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
                disabled={cargando || !archivo}
                className="px-4 py-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white rounded-md transition font-medium disabled:opacity-50 flex items-center"
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </>
                ) : (
                  'Cargar Archivo'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadExcelForm;