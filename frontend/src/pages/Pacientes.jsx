import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AddPatientForm from "../components/forms/AddPatientForm";
import api from "../config/axios"; 
import { FaPlus } from "react-icons/fa";

const Pacientes = () => {
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errores, setErrores] = useState({});

  const fetchPatients = async (search = "") => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      console.log('Cargando pacientes desde:', '/api/pacientes/');
      const response = await api.get('/api/pacientes/', { params });
      console.log('Pacientes cargados:', response);
      
      setPatients(response);
      setErrores({});
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      console.error('Detalles del error:', error);
      setErrores({ general: 'Error al cargar los pacientes. Verifique que el servidor esté funcionando.' });
      setPatients([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchPatients(value);
  };

  const handleAddPatient = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pendiente";
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getPatientsArray = () => {
    return Array.isArray(patients) ? patients : [];
  };

  const patientsArray = getPatientsArray();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage="pacientes" />
      
      <main className="flex-1 p-4 overflow-auto">
        <Header title="Pacientes" />

        {errores.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errores.general}
          </div>
        )}

        {/* Barra de acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5cc3b6] bg-gray-50"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 bg-[#5cc3b6] hover:bg-[#48a399] text-white font-semibold px-4 py-2 rounded-md transition flex-1 sm:flex-none"
            >
              <FaPlus /> Añadir Paciente
            </button>
          </div>
        </div>

        {/* Tabla de pacientes */}
        <section className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-left border border-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">Nombre</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Identificación</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Fecha de ingreso</th>
                <th className="px-3 py-2 font-semibold text-gray-700">Última atención</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5cc3b6]"></div>
                      <span>Cargando pacientes...</span>
                    </div>
                  </td>
                </tr>
              ) : patientsArray.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron pacientes que coincidan con la búsqueda' : 'No se encontraron pacientes'}
                  </td>
                </tr>
              ) : (
                patientsArray.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{patient.nombre_completo}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{patient.tipo_identificacion_display} {patient.numero_identificacion}</div>
                    </td>
                    <td className="px-3 py-2">{formatDate(patient.fecha_ingreso)}</td>
                    <td className={`px-3 py-2 ${
                      !patient.ultima_atencion ? "text-red-500 font-medium" : ""
                    }`}>
                      {formatDate(patient.ultima_atencion)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Modal del Formulario */}
        {showForm && (
          <AddPatientForm
            onClose={() => setShowForm(false)}
            onSave={handleAddPatient}
          />
        )}
      </main>
    </div>
  );
};

export default Pacientes;