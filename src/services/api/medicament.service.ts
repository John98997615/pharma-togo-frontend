// src/services/api/medicament.service.ts
import axiosClient from './axiosClient';
import { Medicament } from '../../types/medicament.types';

export interface MedicamentParams {
  search?: string;
  category_id?: number;
  pharmacy_id?: number;
  available?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  per_page?: number;
  min_price?: number;
  max_price?: number;
  requires_prescription?: boolean;
  is_active?: boolean;
  garde?: boolean;
}

// Fonction utilitaire pour formater les URLs d'image
const formatImageUrl = (imageUrl: any): string | undefined => {
  if (!imageUrl) return undefined;
  
  let url = imageUrl;
  
  // Si c'est un objet Laravel avec des propriétés d'URL
  if (typeof imageUrl === 'object') {
    if (imageUrl.url) {
      url = imageUrl.url;
    } else if (imageUrl.path) {
      url = imageUrl.path;
    }
  }
  
  // Si c'est une chaîne
  if (typeof url === 'string') {
    // Si c'est déjà une URL complète ou une URL de données
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // Si c'est un chemin absolu commençant par /
    if (url.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
      return `${baseUrl}${url}`;
    }
    
    // Sinon, supposer que c'est un chemin de stockage Laravel
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
    
    // Nettoyer le chemin (enlever storage/ en double si présent)
    const cleanPath = url.replace(/^storage\//, '');
    
    return `${baseUrl}/storage/${cleanPath}`;
  }
  
  return undefined;
};

// Fonction pour extraire et formater les données de médicament
const formatMedicamentData = (data: any): Medicament => {
  return {
    id: data.id || 0,
    name: data.name || '',
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    quantity: parseInt(data.quantity) || 0,
    image: formatImageUrl(data.image),
    form: data.form || '',
    dosage: data.dosage || '',
    requires_prescription: Boolean(data.requires_prescription),
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    category_id: data.category_id || data.category?.id || 0,
    pharmacy_id: data.pharmacy_id || data.pharmacy?.id || 0,
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    
    // Relations (si présentes)
    category: data.category ? {
      id: data.category.id,
      name: data.category.name,
      description: data.category.description,
      icon: data.category.icon,
      color: data.category.color,
      is_active: Boolean(data.category.is_active),
      created_at: data.category.created_at,
      updated_at: data.category.updated_at
    } : undefined,
    
    pharmacy: data.pharmacy ? {
      id: data.pharmacy.id,
      name: data.pharmacy.name,
      description: data.pharmacy.description,
      address: data.pharmacy.address,
      latitude: parseFloat(data.pharmacy.latitude) || 0,
      longitude: parseFloat(data.pharmacy.longitude) || 0,
      phone: data.pharmacy.phone,
      email: data.pharmacy.email,
      logo: formatImageUrl(data.pharmacy.logo),
      is_garde: Boolean(data.pharmacy.is_garde),
      opening_time: data.pharmacy.opening_time,
      closing_time: data.pharmacy.closing_time,
      is_active: Boolean(data.pharmacy.is_active),
      user_id: data.pharmacy.user_id,
      created_at: data.pharmacy.created_at,
      updated_at: data.pharmacy.updated_at
    } : undefined
  };
};

// Fonction pour extraire les données de la réponse API
const extractResponseData = (response: any): any => {
  // Priorité 1: response.data.data (format Laravel avec pagination)
  if (response.data && response.data.data !== undefined) {
    return response.data;
  }
  
  // Priorité 2: response.data (format direct)
  if (response.data) {
    return response.data;
  }
  
  // Priorité 3: La réponse elle-même
  return response;
};

export const medicamentService = {
  // GET /api/medicaments - Récupérer tous les médicaments
  getAll: async (params?: MedicamentParams): Promise<{ data: Medicament[]; meta?: any }> => {
    try {
      console.log('Fetching medicaments with params:', params);
      
      const response = await axiosClient.get('/medicaments', { params });
      const responseData = extractResponseData(response);
      
      console.log('API Response structure:', {
        hasData: !!responseData.data,
        isArray: Array.isArray(responseData.data),
        fullResponse: responseData
      });
      
      let medicamentsArray: any[] = [];
      
      // Extraire le tableau de médicaments
      if (responseData.data && Array.isArray(responseData.data)) {
        medicamentsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        medicamentsArray = responseData;
      } else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        // Si c'est un objet unique, le mettre dans un tableau
        medicamentsArray = [responseData];
      }
      
      // Formater chaque médicament
      const formattedMedicaments = medicamentsArray.map(formatMedicamentData);
      
      // Extraire les métadonnées de pagination
      const meta = responseData.meta || {
        current_page: 1,
        total: formattedMedicaments.length,
        per_page: params?.per_page || 15,
        last_page: 1
      };
      
      return {
        data: formattedMedicaments,
        meta
      };
      
    } catch (error: any) {
      console.error('Error fetching medicaments:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        data: [],
        meta: {
          current_page: 1,
          total: 0,
          per_page: params?.per_page || 15,
          last_page: 1
        }
      };
    }
  },

  // GET /api/medicaments/{id} - Récupérer un médicament par ID
  getById: async (id: number): Promise<Medicament> => {
    try {
      console.log(`Fetching medicament with ID: ${id}`);
      
      const response = await axiosClient.get(`/medicaments/${id}`);
      const responseData = extractResponseData(response);
      
      console.log('Medicament API response:', responseData);
      
      // Essayer différents chemins pour trouver les données
      const medicamentData = 
        responseData.data?.medicament || 
        responseData.medicament || 
        responseData.data || 
        responseData;
      
      return formatMedicamentData(medicamentData);
      
    } catch (error: any) {
      console.error(`Error fetching medicament ${id}:`, {
        error: error.message,
        response: error.response?.data
      });
      
      throw new Error(error.response?.data?.message || `Failed to fetch medicament ${id}`);
    }
  },

  // POST /api/medicaments - Créer un nouveau médicament
  create: async (formData: FormData): Promise<Medicament> => {
    try {
      console.log('Creating new medicament');
      
      // Log du contenu du FormData (pour débogage)
      const entries = Array.from(formData.entries());
      console.log('FormData entries:', entries.map(([key, value]) => ({
        key,
        value: value instanceof File ? `File: ${value.name}` : value
      })));
      
      const response = await axiosClient.post('/medicaments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      const responseData = extractResponseData(response);
      console.log('Create response:', responseData);
      
      const medicamentData = 
        responseData.data?.medicament || 
        responseData.medicament || 
        responseData.data || 
        responseData;
      
      return formatMedicamentData(medicamentData);
      
    } catch (error: any) {
      console.error('Error creating medicament:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extraire les messages d'erreur de validation Laravel
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create medicament');
    }
  },

  // PUT /api/medicaments/{id} - Mettre à jour un médicament
  update: async (id: number, data: FormData | Partial<Medicament>): Promise<Medicament> => {
    try {
      console.log(`Updating medicament ${id}`, data);
      
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        // Pour FormData (avec image), utiliser POST avec _method=PUT
        const formData = data as FormData;
        
        // Ajouter _method=PUT si pas déjà présent
        if (!formData.has('_method')) {
          formData.append('_method', 'PUT');
        }
        
        console.log('Sending FormData with entries:', 
          Array.from(formData.entries()).map(([key, value]) => ({
            key,
            value: value instanceof File ? `File: ${value.name}` : value
          }))
        );
        
        const response = await axiosClient.post(`/medicaments/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        const responseData = extractResponseData(response);
        console.log('Update response (FormData):', responseData);
        
        const medicamentData = 
          responseData.data?.medicament || 
          responseData.medicament || 
          responseData.data || 
          responseData;
        
        return formatMedicamentData(medicamentData);
        
      } else {
        // Pour les données JSON normales, utiliser PUT
        const jsonData = data as Partial<Medicament>;
        
        console.log('Sending JSON data:', jsonData);
        
        const response = await axiosClient.put(`/medicaments/${id}`, jsonData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const responseData = extractResponseData(response);
        console.log('Update response (JSON):', responseData);
        
        const medicamentData = 
          responseData.data?.medicament || 
          responseData.medicament || 
          responseData.data || 
          responseData;
        
        return formatMedicamentData(medicamentData);
      }
      
    } catch (error: any) {
      console.error(`Error updating medicament ${id}:`, {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extraire les messages d'erreur de validation Laravel
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(error.response?.data?.message || `Failed to update medicament ${id}`);
    }
  },

  // DELETE /api/medicaments/{id} - Supprimer un médicament
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log(`Deleting medicament ${id}`);
      
      await axiosClient.delete(`/medicaments/${id}`);
      
      return {
        success: true,
        message: 'Medicament deleted successfully'
      };
      
    } catch (error: any) {
      console.error(`Error deleting medicament ${id}:`, {
        error: error.message,
        response: error.response?.data
      });
      
      return {
        success: false,
        message: error.response?.data?.message || `Failed to delete medicament ${id}`
      };
    }
  },

  // PATCH /api/medicaments/{id}/stock - Ajuster le stock
  adjustStock: async (id: number, adjustment_value: number): Promise<Medicament> => {
    try {
      console.log(`Adjusting stock for medicament ${id} by ${adjustment_value}`);
      
      const response = await axiosClient.patch(`/medicaments/${id}/stock`, { 
        adjustment_value 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const responseData = extractResponseData(response);
      console.log('Adjust stock response:', responseData);
      
      const medicamentData = 
        responseData.data?.medicament || 
        responseData.medicament || 
        responseData.data || 
        responseData;
      
      return formatMedicamentData(medicamentData);
      
    } catch (error: any) {
      console.error(`Error adjusting stock for medicament ${id}:`, {
        error: error.message,
        response: error.response?.data
      });
      
      throw new Error(error.response?.data?.message || `Failed to adjust stock for medicament ${id}`);
    }
  },

  // Recherche avancée de médicaments
  search: async (params: {
    name?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    requires_prescription?: boolean;
    pharmacy_id?: number;
    latitude?: number;
    longitude?: number;
    radius?: number; // en kilomètres
  }): Promise<{ data: Medicament[]; meta?: any }> => {
    try {
      console.log('Searching medicaments with params:', params);
      
      const response = await axiosClient.get('/medicaments', { params });
      const responseData = extractResponseData(response);
      
      let medicamentsArray: any[] = [];
      
      if (responseData.data && Array.isArray(responseData.data)) {
        medicamentsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        medicamentsArray = responseData;
      }
      
      const formattedMedicaments = medicamentsArray.map(formatMedicamentData);
      
      return {
        data: formattedMedicaments,
        meta: responseData.meta
      };
      
    } catch (error: any) {
      console.error('Error searching medicaments:', {
        error: error.message,
        response: error.response?.data
      });
      
      return {
        data: [],
        meta: {
          current_page: 1,
          total: 0,
          per_page: 15,
          last_page: 1
        }
      };
    }
  },

  // Récupérer les médicaments d'une pharmacie spécifique
  getByPharmacy: async (pharmacyId: number, params?: Omit<MedicamentParams, 'pharmacy_id'>): Promise<{ data: Medicament[]; meta?: any }> => {
    return medicamentService.getAll({
      ...params,
      pharmacy_id: pharmacyId
    });
  },

  // Récupérer les médicaments par catégorie
  getByCategory: async (categoryId: number, params?: Omit<MedicamentParams, 'category_id'>): Promise<{ data: Medicament[]; meta?: any }> => {
    return medicamentService.getAll({
      ...params,
      category_id: categoryId
    });
  },

  // Vérifier la disponibilité d'un médicament
  checkAvailability: async (id: number, quantity: number): Promise<{ available: boolean; message?: string }> => {
    try {
      const medicament = await medicamentService.getById(id);
      
      if (medicament.quantity >= quantity) {
        return {
          available: true,
          message: 'Médicament disponible'
        };
      } else {
        return {
          available: false,
          message: `Stock insuffisant. Disponible: ${medicament.quantity}, Demandé: ${quantity}`
        };
      }
      
    } catch (error: any) {
      console.error(`Error checking availability for medicament ${id}:`, error);
      
      return {
        available: false,
        message: 'Erreur lors de la vérification de disponibilité'
      };
    }
  },

  // Mettre à jour uniquement le statut d'un médicament
  updateStatus: async (id: number, is_active: boolean): Promise<Medicament> => {
    try {
      console.log(`Updating status for medicament ${id} to ${is_active}`);
      
      const response = await axiosClient.patch(`/medicaments/${id}/status`, { 
        is_active 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const responseData = extractResponseData(response);
      console.log('Update status response:', responseData);
      
      const medicamentData = 
        responseData.data?.medicament || 
        responseData.medicament || 
        responseData.data || 
        responseData;
      
      return formatMedicamentData(medicamentData);
      
    } catch (error: any) {
      console.error(`Error updating status for medicament ${id}:`, {
        error: error.message,
        response: error.response?.data
      });
      
      throw new Error(error.response?.data?.message || `Failed to update status for medicament ${id}`);
    }
  }
};