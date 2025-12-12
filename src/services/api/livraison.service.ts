
// src/services/api/livraison.service.ts

import axiosClient from './axiosClient';
import { Livraison, LivraisonStatus } from '../../types/livraison.types';

export interface UpdatePositionData {
  latitude: number;
  longitude: number;
}

export const livraisonService = {
  getAll: async (params?: { status?: LivraisonStatus; livreur_id?: number }): Promise<Livraison[]> => {
    try {
      const response = await axiosClient.get('/livraisons', { params });

      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as Livraison[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Livraison[];
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as Livraison[];
      }

      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const livraisons = Object.values(response.data);
        if (Array.isArray(livraisons) && livraisons.length > 0) {
          return livraisons as Livraison[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching livraisons:', error);
      return [];
    }
  },

  getLivreurStatistics: async (): Promise<any> => {
    try {
      const response = await axiosClient.get('/livraisons/statistics/livreur');
      return response.data;
    } catch (error) {
      console.error('Error fetching livreur statistics:', error);
      return {};
    }
  },

  updateStatus: async (id: number, status: LivraisonStatus): Promise<Livraison> => {
    try {
      const response = await axiosClient.put(`/livraisons/${id}/status`, { status });

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }

      return response.data;
    } catch (error) {
      console.error('Error updating livraison status:', error);
      throw error;
    }
  },

  updatePosition: async (id: number, data: UpdatePositionData): Promise<Livraison> => {
    try {
      const response = await axiosClient.put(`/livraisons/${id}/position`, data);

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }

      return response.data;
    } catch (error) {
      console.error('Error updating livraison position:', error);
      throw error;
    }
  }
};
