import React, { useState } from "react";
import { FaClinicMedical, FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        navigate('/dashboard');
      } else {
        setError(data.message || 'Error en el login');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Visible en desktop, oculto en móvil */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#08988e] flex-col justify-center items-center text-white p-8">
        <div className="max-w-md w-full text-center">
          <FaClinicMedical className="text-6xl mb-6 mx-auto" />
          <h1 className="text-4xl font-bold mb-4">FarmaGestión</h1>
          <p className="text-xl opacity-90">Sistema de Gestión Farmacéutica</p>
        </div>
      </div>

      {/* Panel Derecho - Ocupa toda la pantalla en móvil, mitad en desktop */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Header móvil - Solo visible en móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FaClinicMedical className="text-4xl text-[#08988e] mr-3" />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-[#08988e]">FarmaGestión</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión Farmacéutica</p>
              </div>
            </div>
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center lg:justify-start">
              <FaUser className="text-[#08988e] mr-3 text-xl" /> 
              Iniciar Sesión
            </h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08988e] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08988e] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full lg:w-auto bg-[#08988e] hover:bg-[#067a74] text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="text-lg" />
                      <span>Ingresar</span>
                    </>
                  )}
                </button>
                <a
                  href="/recuperar-contrasena"
                  className="text-[#08988e] hover:text-[#067a74] text-sm font-medium transition-colors duration-200 text-center lg:text-right block py-2 lg:py-0"
                >
                  ¿Olvidaste la Contraseña?
                </a>
              </div>
            </form>
          </div>

          {/* Footer móvil */}
          <div className="lg:hidden text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 FarmaGestión. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;