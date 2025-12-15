// src/services/api/pharmacy.service.ts
import axiosClient from './axiosClient';
import { Pharmacy } from '../../types/pharmacy.types';

// Paramètres optionnels pour la récupération des pharmacies
export interface PharmacyParams {
  garde?: boolean;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  per_page?: number;
  page?: number;
}

export const pharmacyService = {


  // GET /pharmacies avec paramètres optionnels de requête
  getAll: async (params?: PharmacyParams): Promise<Pharmacy[]> => {
    try {
      const response = await axiosClient.get('/pharmacies', { params });

      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as Pharmacy[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const data = (response.data as any).data;
        if (Array.isArray(data)) {
          return data as Pharmacy[];
        }
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as Pharmacy[];
      }

      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const pharmacies = Object.values(response.data);
        if (Array.isArray(pharmacies) && pharmacies.length > 0) {
          return pharmacies as Pharmacy[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      return [];
    }
  },

  // GET /pharmacies/:id pour obtenir une pharmacie par ID
  getById: async (id: number): Promise<Pharmacy> => {
    const response = await axiosClient.get(`/pharmacies/${id}`);
    return response.data;
  },

  // Ajoutez cette méthode à pharmacy.service.ts
  getByUserId: async (userId: number): Promise<Pharmacy | null> => {
    try {
      const response = await axiosClient.get(`/pharmacies/user/${userId}`);
      return response.data.pharmacy;
    } catch (error) {
      console.error('Error fetching pharmacy by user ID:', error);
      return null;
    }
  },


  // POST /pharmacies pour créer une nouvelle pharmacie
  create: async (data: FormData | Partial<Pharmacy>): Promise<Pharmacy> => {
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await axiosClient.post('/pharmacies', data, { headers });

    console.log('Pharmacy create response:', response.data);
    return response.data.pharmacy || response.data;
  },

  // PUT /pharmacies/:id pour mettre à jour une pharmacie existante
  update: async (id: number, data: FormData | Partial<Pharmacy>): Promise<Pharmacy> => {
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await axiosClient.put(`/pharmacies/${id}`, data, { headers });
    return response.data;
  },

  // PATCH /pharmacies/:id/toggle-garde pour basculer le statut de garde
  toggleGarde: async (id: number): Promise<{ message: string; is_garde: boolean }> => {
    const response = await axiosClient.patch(`/pharmacies/${id}/toggle-garde`);
    return response.data;
  },

  // PUT /pharmacies/:id/toggle-active pour basculer le statut actif
  toggleActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    const response = await axiosClient.put(`/pharmacies/${id}/toggle-active`);
    return response.data;
  },


  // GET /pharmacies/pending pour obtenir les pharmacies en attente de validation
  getPending: async (): Promise<Pharmacy[]> => {
    try {
      const response = await axiosClient.get('/pharmacies/pending');

      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as Pharmacy[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Pharmacy[];
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as Pharmacy[];
      }

      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const pharmacies = Object.values(response.data);
        if (Array.isArray(pharmacies) && pharmacies.length > 0) {
          return pharmacies as Pharmacy[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching pending pharmacies:', error);
      return [];
    }
  }
};