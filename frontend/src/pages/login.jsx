
import React, { useState } from "react";
import { FaClinicMedical, FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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
    <div className="flex h-screen">
      {/* Lado Izquierdo */}
      <div className="w-1/2 bg-[#08988e] flex flex-col justify-center items-center text-white">
        <FaClinicMedical className="text-6xl mb-4" />
        <h1 className="text-3xl font-semibold">FarmaGestión</h1>
        <p className="mt-2 text-lg opacity-90">Sistema de Gestión Farmacéutica</p>
      </div>

      {/* Lado Derecho */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-50">
        <div className="w-3/4 max-w-md">
          <h2 className="text-[#08988e] text-2xl font-semibold mb-6 flex items-center">
            <FaUser className="text-[#08988e] mr-3" /> Iniciar Sesión
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#08988e]"
                required
                disabled={loading}
              />
            </div>
            
            <div className="relative mb-4">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#08988e]"
                required
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#08988e] text-white px-5 py-2 rounded hover:bg-[#05766f] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaSignInAlt /> Ingresar
                  </>
                )}
              </button>
              <a
                href="/recuperar-contrasena"
                className="text-[#08988e] text-sm hover:underline ml-2"
              >
                ¿Olvidaste la Contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;