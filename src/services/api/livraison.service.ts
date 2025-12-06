// src/services/api/livraison.service.ts
import axiosClient from './axiosClient';
import { Livraison, LivraisonStatus } from '../../types/livraison.types';

export interface UpdatePositionData {
  latitude: number;
  longitude: number;
}

export const livraisonService = {
  getAll: async (params?: { status?: LivraisonStatus; livreur_id?: number }): Promise<Livraison[]> => {
    const response = await axiosClient.get('/livraisons', { params });
    return response.data;
  },

  getLivreurStatistics: async (): Promise<any> => {
    const response = await axiosClient.get('/livraisons/statistics/livreur');
    return response.data;
  },

  updateStatus: async (id: number, status: LivraisonStatus): Promise<Livraison> => {
    const response = await axiosClient.put(`/livraisons/${id}/status`, { status });
    return response.data;
  },

  updatePosition: async (id: number, data: UpdatePositionData): Promise<Livraison> => {
    const response = await axiosClient.put(`/livraisons/${id}/position`, data);
    return response.data;
  }
};