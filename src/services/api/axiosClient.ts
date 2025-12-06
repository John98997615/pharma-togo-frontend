// src/services/api/axiosClient.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Intercepteur pour le token Sanctum
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour les erreurs
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentative de rafraîchissement du token
        const response = await axios.post(`${API_BASE_URL}/refresh`, {}, {
          headers: {
            'Accept': 'application/json',
          },
          withCredentials: true,
        });
        
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Déconnexion si le rafraîchissement échoue
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Gestion des autres erreurs
    if (error.response?.status === 422) {
      return Promise.reject(error.response.data);
    }
    
    if (error.response?.status === 403) {
      console.error('Accès interdit');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;