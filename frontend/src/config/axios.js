import axios from 'axios';

// URL base para todas las peticiones
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar respuestas - DEVOLVER DIRECTAMENTE response.data
api.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    console.error('Error de API:', error);
    return Promise.reject(error);
  }
);

export default api;