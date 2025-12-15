// src/services/api/auth.service.ts
import axiosClient from './axiosClient';
import { User } from '../../types/user.types';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  photo?: File | null;
  phone: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'client' | 'pharmacien' | 'livreur';
  address: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  photo?: File | null | string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export const authService = {
  // POST /api/register
  register: async (data: RegisterData): Promise<{ user: User; access_token: string }> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('role', data.role);
    formData.append('address', data.address);

    if (data.photo instanceof File) {
      formData.append('photo', data.photo);
    }

    const response = await axiosClient.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const responseData = response.data;

    if (responseData.access_token) {
      localStorage.setItem('access_token', responseData.access_token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }

    return responseData;
  },

  // POST /api/login
  login: async (credentials: LoginCredentials): Promise<{ user: User; access_token: string }> => {
    const response = await axiosClient.post('/login', credentials);

    const responseData = response.data;

    if (responseData.access_token) {
      localStorage.setItem('access_token', responseData.access_token);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      // Si remember est true, stocker aussi dans sessionStorage pour persistance
      if (credentials.remember) {
        sessionStorage.setItem('remembered_token', responseData.access_token);
      }
    }

    return responseData;
  },

  // POST /api/logout
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/logout');
    } catch (error) {
      console.log('Logout API error, proceeding with local cleanup...');
    } finally {
      // Nettoyer tous les tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('remembered_token');
    }
  },

  // GET /api/user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await axiosClient.get('/user');
      const userData = response.data;

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return userData;
    } catch (error: any) {
      // Si erreur 401, nettoyer et lancer l'erreur
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  },

  // PUT /api/user/{id} - CORRIGÉ POUR BIEN GÉRER FORM_DATA
  // Dans auth.service.ts - Ajoutez cette fonction
  updateProfile: async (id: number, data: UpdateProfileData | FormData): Promise<User> => {
    try {
      let requestData: FormData | UpdateProfileData;
      let headers = {};

      if (data instanceof FormData) {
        requestData = data;
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        const formData = new FormData();

        if (data.name !== undefined) formData.append('name', data.name);
        if (data.email !== undefined) formData.append('email', data.email);
        if (data.phone !== undefined) formData.append('phone', data.phone);
        if (data.address !== undefined) formData.append('address', data.address);
        if (data.current_password !== undefined) formData.append('current_password', data.current_password);
        if (data.password !== undefined) formData.append('password', data.password);
        if (data.password_confirmation !== undefined) formData.append('password_confirmation', data.password_confirmation);

        if (data.photo instanceof File) {
          formData.append('photo', data.photo);
        } else if (data.photo === null || data.photo === '') {
          formData.append('photo', '');
        }

        requestData = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await axiosClient.put(`/user/${id}`, requestData, { headers });
      const responseData = response.data;

      // IMPORTANT: Vérifier si l'API retourne un user ou un objet avec user/token
      if (responseData.user) {
        // Format: { user: User, access_token?: string }
        const updatedUser = responseData.user;

        if (responseData.access_token) {
          localStorage.setItem('access_token', responseData.access_token);
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        // Format: User direct
        localStorage.setItem('user', JSON.stringify(responseData));
        return responseData;
      }
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token && token !== 'undefined' && token !== 'null';
  },

  // Récupérer l'utilisateur stocké
  getStoredUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      // Validation basique
      if (!user || typeof user !== 'object' || !user.id || !user.email) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Rafraîchir le token (si votre API le supporte)
  refreshToken: async (): Promise<string | null> => {
    try {
      const response = await axiosClient.post('/refresh');
      const { access_token } = response.data;

      if (access_token) {
        localStorage.setItem('access_token', access_token);
        return access_token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
};