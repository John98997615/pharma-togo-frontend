// src/services/api/user.service.ts
import axiosClient from './axiosClient';
import { User } from '../../types/user.types';

export const userService = {
  getLivreurs: async (): Promise<User[]> => {
    try {
      console.log('📡 Récupération des livreurs...');
      
      // Essayer différentes structures de réponse
      const response = await axiosClient.get('/users', { 
        params: { 
          role: 'livreur',
          is_active: true 
        } 
      });
      
      console.log('📊 Réponse API livreurs:', response.data);
      
      // Gérer différentes structures de réponse
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        return response.data.users;
      } else if (response.data.livreurs && Array.isArray(response.data.livreurs)) {
        return response.data.livreurs;
      }
      
      console.warn('⚠️ Structure de réponse inattendue:', response.data);
      return [];
      
    } catch (error: any) {
      console.error('❌ Erreur récupération livreurs:', error);
      
      // Fallback: tester différentes routes
      try {
        const fallbackResponse = await axiosClient.get('/livreurs');
        console.log('📊 Réponse fallback livreurs:', fallbackResponse.data);
        
        if (Array.isArray(fallbackResponse.data)) {
          return fallbackResponse.data;
        } else if (fallbackResponse.data.data) {
          return fallbackResponse.data.data;
        }
      } catch (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError);
      }
      
      return [];
    }
  },

  getLivreursDisponibles: async (): Promise<User[]> => {
    try {
      // Route spécifique pour les livreurs disponibles
      const response = await axiosClient.get('/livreurs/disponibles');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Erreur récupération livreurs disponibles:', error);
      return userService.getLivreurs(); // Fallback sur la méthode générale
    }
  },

  getById: async (id: number): Promise<User> => {
    const response = await axiosClient.get(`/users/${id}`);
    return response.data;
  }
};