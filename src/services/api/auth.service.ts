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

// Interface pour la mise à jour du profil
export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  photo?: File | null | string; // string pour l'URL existante, null pour supprimer
}

export const authService = {
  // POST /api/register - CORRIGÉ
  register: async (data: RegisterData): Promise<{ user: User; access_token: string }> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('role', data.role);
    formData.append('address', data.address);
    
    // Gestion correcte du fichier photo
    if (data.photo instanceof File) {
      formData.append('photo', data.photo);
    }
    
    const response = await axiosClient.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
    
    // Stockage sécurisé
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // POST /api/login - SIMPLIFIÉ
  login: async (credentials: LoginCredentials): Promise<{ user: User; access_token: string }> => {
    const response = await axiosClient.post('/login', credentials);
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // POST /api/logout - SIMPLIFIÉ
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/logout');
    } catch (error) {
      console.log('Erreur lors de la déconnexion, nettoyage local...');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  // GET /api/user
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosClient.get('/user');
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  // PUT /api/user/{id}
  updateProfile: async (id: number, data: UpdateProfileData): Promise<User> => {
    const formData = new FormData();
    
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.email !== undefined) formData.append('email', data.email);
    if (data.phone !== undefined) formData.append('phone', data.phone);
    if (data.address !== undefined) formData.append('address', data.address);
    
    // Gestion de la photo
    if (data.photo instanceof File) {
      formData.append('photo', data.photo);
    } else if (data.photo === null) {
      // Pour supprimer la photo
      formData.append('photo', '');
    } else if (data.photo === '') {
      // Chaîne vide pour indiquer la suppression
      formData.append('photo', '');
    }
    // Si data.photo est une string (URL), on ne l'envoie pas (c'est l'URL existante)
    
    const response = await axiosClient.put(`/user/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  // Vérification simple
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Récupérer l'utilisateur depuis localStorage
  getStoredUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};