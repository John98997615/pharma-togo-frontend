// src/services/api/axiosClient.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api`;

// Variable pour suivre l'état CSRF
let csrfTokenRetrieved = false;
let csrfPromise: Promise<void> | null = null;

// Fonction optimisée pour obtenir le cookie CSRF
export const getCsrfToken = async (): Promise<void> => {
  // Si déjà récupéré récemment, ne pas refaire
  if (csrfTokenRetrieved && csrfPromise) {
    return csrfPromise;
  }
  
  // Éviter les appels concurrents
  if (!csrfPromise) {
    csrfPromise = axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
      }
    })
      .then((response) => {
        console.log('✅ CSRF cookie obtenu avec succès');
        csrfTokenRetrieved = true;
        
        // Réinitialiser après 30 minutes
        setTimeout(() => {
          csrfTokenRetrieved = false;
        }, 30 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Erreur CSRF:', error.response?.status, error.message);
        csrfTokenRetrieved = false;
        throw error;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  
  return csrfPromise;
};

// Instance Axios pour l'API
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // ESSENTIEL pour Sanctum
});

// Intercepteur de requête - OPTIMISÉ
axiosClient.interceptors.request.use(
  async (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Obtenir CSRF pour les méthodes mutatives
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      try {
        await getCsrfToken();
      } catch (error) {
        console.warn('⚠️ CSRF non disponible, tentative sans...');
      }
    }
    
    // Ajouter le token d'authentification
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter le header X-CSRF-TOKEN si disponible
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (csrfCookie) {
      const csrfToken = csrfCookie.split('=')[1];
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - OPTIMISÉ
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ ${error.response?.status || 'Network'} ${error.config?.url}`);
    
    // Si erreur 419 (CSRF token mismatch)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 CSRF token expiré, nouvel essai...');
      
      // Réinitialiser le flag CSRF
      csrfTokenRetrieved = false;
      
      // Attendre un peu avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réessayer la requête
      return axiosClient(originalRequest);
    }
    
    // Si erreur 401 (non authentifié)
    if (error.response?.status === 401) {
      console.log('🔒 Session expirée, redirection vers login...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Ne rediriger que si on n'est pas déjà sur la page de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Si erreur 422 (validation)
    if (error.response?.status === 422) {
      console.log('📝 Erreur de validation:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;