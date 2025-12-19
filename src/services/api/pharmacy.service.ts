// src/services/api/pharmacy.service.ts
import axiosClient from './axiosClient';
import { Pharmacy } from '../../types/pharmacy.types';

// Fonction utilitaire pour formater les URLs d'image
const formatImageUrl = (imageUrl: any): string => {
  if (!imageUrl) return '';
  
  let url = imageUrl;
  
  // Si c'est un objet Laravel
  if (typeof imageUrl === 'object' && imageUrl.url) {
    url = imageUrl.url;
  } else if (typeof imageUrl === 'object' && imageUrl.path) {
    url = imageUrl.path;
  }
  
  // Si c'est une chaîne
  if (typeof url === 'string') {
    // Si c'est déjà une URL complète
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // Si c'est un chemin absolu
    if (url.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
      return `${baseUrl}${url}`;
    }
    
    // Sinon, supposer que c'est un chemin de stockage
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
    const cleanPath = url.replace(/^storage\//, '');
    return `${baseUrl}/storage/${cleanPath}`;
  }
  
  return '';
};

// Fonction pour formater les données de pharmacie
const formatPharmacyData = (data: any): Pharmacy => {
  return {
    id: data.id || 0,
    name: data.name || '',
    description: data.description || '',
    address: data.address || '',
    latitude: parseFloat(data.latitude) || 0,
    longitude: parseFloat(data.longitude) || 0,
    phone: data.phone || '',
    email: data.email || '',
    logo: formatImageUrl(data.logo),
    is_garde: Boolean(data.is_garde),
    opening_time: data.opening_time || '08:00',
    closing_time: data.closing_time || '20:00',
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    user_id: data.user_id || 0,
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    user: data.user || undefined
  };
};

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
      console.log('Fetching pharmacies with params:', params);
      
      const response = await axiosClient.get('/pharmacies', { params });
      console.log('Pharmacies API response:', response.data);

      let pharmaciesArray: any[] = [];

      // Extraire les données de la réponse
      if (response.data && Array.isArray(response.data)) {
        pharmaciesArray = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const data = (response.data as any).data;
        if (Array.isArray(data)) {
          pharmaciesArray = data;
        }
      }

      // Formater les pharmacies
      const formattedPharmacies = pharmaciesArray.map(formatPharmacyData);
      
      return formattedPharmacies;
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      return [];
    }
  },

  // GET /pharmacies/:id pour obtenir une pharmacie par ID
  getById: async (id: number): Promise<Pharmacy> => {
    try {
      console.log(`Fetching pharmacy with ID: ${id}`);
      
      const response = await axiosClient.get(`/pharmacies/${id}`);
      console.log('Pharmacy API response:', response.data);
      
      const pharmacyData = response.data.pharmacy || response.data.data || response.data;
      return formatPharmacyData(pharmacyData);
    } catch (error) {
      console.error(`Error fetching pharmacy ${id}:`, error);
      throw error;
    }
  },

  // GET /pharmacies/user/:userId - obtenir la pharmacie d'un utilisateur
  getByUserId: async (userId: number): Promise<Pharmacy | null> => {
    try {
      const response = await axiosClient.get(`/pharmacies/user/${userId}`);
      const pharmacyData = response.data.pharmacy || response.data.data || response.data;
      
      if (!pharmacyData) return null;
      return formatPharmacyData(pharmacyData);
    } catch (error) {
      console.error('Error fetching pharmacy by user ID:', error);
      return null;
    }
  },

  // POST /pharmacies pour créer une nouvelle pharmacie
  create: async (data: FormData | Partial<Pharmacy>): Promise<Pharmacy> => {
    try {
      console.log('Creating pharmacy with data:', data);
      
      const isFormData = data instanceof FormData;
      const headers = isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await axiosClient.post('/pharmacies', data, { headers });
      console.log('Pharmacy create response:', response.data);
      
      const pharmacyData = response.data.pharmacy || response.data.data || response.data;
      return formatPharmacyData(pharmacyData);
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      throw error;
    }
  },

  // PUT /pharmacies/:id pour mettre à jour une pharmacie existante - CORRECTION CRITIQUE
  update: async (id: number, data: FormData | Partial<Pharmacy>): Promise<Pharmacy> => {
    try {
      console.log(`Updating pharmacy ${id} with data:`, data);
      
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        // POUR FormData (avec fichiers) : utiliser POST avec _method=PUT
        const formData = data as FormData;
        
        // Ajouter _method=PUT pour Laravel
        if (!formData.has('_method')) {
          formData.append('_method', 'PUT');
        }
        
        console.log('Sending FormData with entries:', 
          Array.from(formData.entries()).map(([key, value]) => ({
            key,
            value: value instanceof File ? `File: ${value.name}` : value
          }))
        );
        
        const response = await axiosClient.post(`/pharmacies/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log('Update response (FormData):', response.data);
        
        const pharmacyData = response.data.pharmacy || response.data.data || response.data;
        return formatPharmacyData(pharmacyData);
        
      } else {
        // POUR les données JSON normales : utiliser PUT normal
        const jsonData = data as Partial<Pharmacy>;
        
        console.log('Sending JSON data:', jsonData);
        
        const response = await axiosClient.put(`/pharmacies/${id}`, jsonData, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Update response (JSON):', response.data);
        
        const pharmacyData = response.data.pharmacy || response.data.data || response.data;
        return formatPharmacyData(pharmacyData);
      }
      
    } catch (error: any) {
      console.error(`Error updating pharmacy ${id}:`, {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extraire les erreurs de validation Laravel
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(error.response?.data?.message || `Failed to update pharmacy ${id}`);
    }
  },

  // PATCH /pharmacies/:id/toggle-garde pour basculer le statut de garde
  toggleGarde: async (id: number): Promise<{ message: string; is_garde: boolean }> => {
    try {
      console.log(`Toggling garde for pharmacy ${id}`);
      
      const response = await axiosClient.patch(`/pharmacies/${id}/toggle-garde`);
      console.log('Toggle garde response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling garde for pharmacy ${id}:`, error);
      throw error;
    }
  },

  // PUT /pharmacies/:id/toggle-active pour basculer le statut actif
  toggleActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    try {
      console.log(`Toggling active for pharmacy ${id}`);
      
      const response = await axiosClient.put(`/pharmacies/${id}/toggle-active`);
      console.log('Toggle active response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling active for pharmacy ${id}:`, error);
      throw error;
    }
  },

  // GET /pharmacies/pending pour obtenir les pharmacies en attente de validation
  getPending: async (): Promise<Pharmacy[]> => {
    try {
      console.log('Fetching pending pharmacies');
      
      const response = await axiosClient.get('/pharmacies/pending');
      console.log('Pending pharmacies response:', response.data);

      let pharmaciesArray: any[] = [];

      if (response.data && Array.isArray(response.data)) {
        pharmaciesArray = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const data = (response.data as any).data;
        if (Array.isArray(data)) {
          pharmaciesArray = data;
        }
      }

      const formattedPharmacies = pharmaciesArray.map(formatPharmacyData);
      return formattedPharmacies;
      
    } catch (error) {
      console.error('Error fetching pending pharmacies:', error);
      return [];
    }
  },

  // Recherche de pharmacies avec filtres avancés
  search: async (params: {
    search?: string;
    garde?: boolean;
    is_active?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number; // en kilomètres
    per_page?: number;
    page?: number;
  }): Promise<{ data: Pharmacy[]; meta?: any }> => {
    try {
      console.log('Searching pharmacies with params:', params);
      
      const response = await axiosClient.get('/pharmacies', { params });
      const responseData = response.data;
      
      let pharmaciesArray: any[] = [];
      
      if (responseData.data && Array.isArray(responseData.data)) {
        pharmaciesArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        pharmaciesArray = responseData;
      }
      
      const formattedPharmacies = pharmaciesArray.map(formatPharmacyData);
      
      return {
        data: formattedPharmacies,
        meta: responseData.meta || {
          current_page: 1,
          total: formattedPharmacies.length,
          per_page: params.per_page || 15,
          last_page: 1
        }
      };
      
    } catch (error) {
      console.error('Error searching pharmacies:', error);
      return {
        data: [],
        meta: {
          current_page: 1,
          total: 0,
          per_page: params.per_page || 15,
          last_page: 1
        }
      };
    }
  },

  // Mettre à jour uniquement le logo
  updateLogo: async (id: number, logoFile: File): Promise<Pharmacy> => {
    try {
      console.log(`Updating logo for pharmacy ${id}`);
      
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('_method', 'PUT');
      
      const response = await axiosClient.post(`/pharmacies/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const pharmacyData = response.data.pharmacy || response.data.data || response.data;
      return formatPharmacyData(pharmacyData);
      
    } catch (error: any) {
      console.error(`Error updating logo for pharmacy ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une pharmacie (attention: action irréversible)
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log(`Deleting pharmacy ${id}`);
      
      await axiosClient.delete(`/pharmacies/${id}`);
      
      return {
        success: true,
        message: 'Pharmacie supprimée avec succès'
      };
      
    } catch (error: any) {
      console.error(`Error deleting pharmacy ${id}:`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || `Erreur lors de la suppression de la pharmacie ${id}`
      };
    }
  }
};