// src/services/api/livraison.service.ts
import axiosClient from './axiosClient';
import { Livraison, LivraisonStatus } from '../../types/livraison.types';

export interface UpdatePositionData {
  latitude: number;
  longitude: number;
}

export interface AssignLivreurData {
  livreur_id: number;
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

  // AJOUTEZ CETTE MÉTHODE POUR L'ASSIGNATION DES LIVREURS
  assignLivreur: async (commandeId: number, livreurId: number): Promise<Livraison> => {
    try {
      const response = await axiosClient.post(`/commandes/${commandeId}/assign-livreur`, {
        livreur_id: livreurId
      });

      // Gérer différents formats de réponse API
      if (response.data && typeof response.data === 'object') {
        if ('livraison' in response.data) {
          return response.data.livraison as Livraison;
        }
        if ('data' in response.data) {
          return response.data.data as Livraison;
        }
        return response.data as Livraison;
      }

      throw new Error('Format de réponse inattendu');
    } catch (error: any) {
      console.error('Error assigning livreur:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'assignation du livreur');
    }
  },

  // AUTRE VERSION PLUS SIMPLE SI L'API RENVOIE DIRECTEMENT LA LIVRAISON
  assignLivreurSimple: async (commandeId: number, livreurId: number): Promise<Livraison> => {
    const response = await axiosClient.post(`/commandes/${commandeId}/assign-livreur`, {
      livreur_id: livreurId
    });
    return response.data.livraison;
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
  },

  // AJOUTEZ CES MÉTHODES SI ELLES EXISTENT DANS VOTRE API LARAVEL
  getByCommandeId: async (commandeId: number): Promise<Livraison | null> => {
    try {
      const response = await axiosClient.get(`/livraisons?commande_id=${commandeId}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0] as Livraison;
      }
      
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data[0] as Livraison;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching livraison by commande:', error);
      return null;
    }
  },

  getByLivreur: async (livreurId: number): Promise<Livraison[]> => {
    try {
      const response = await axiosClient.get(`/livraisons?livreur_id=${livreurId}`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching livraisons by livreur:', error);
      return [];
    }
  }
};