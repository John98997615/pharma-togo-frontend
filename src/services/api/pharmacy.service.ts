// src/services/api/pharmacy.service.ts
import axiosClient from './axiosClient';
import { Pharmacy } from '../../types/pharmacy.types';

// Constante pour l'URL de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * FONCTION CRITIQUE : Nettoie les chemins Windows problématiques
 * Transforme C:\xampp\tmp\php2740.tmp → http://localhost:8000/storage/php2740.tmp
 */
export const formatImageUrl = (imageData: any): string => {
  // Si vide/null
  if (!imageData) return '';
  
  console.log('🖼️ Image data to format:', imageData);
  
  // Cas 1: Déjà une URL complète (http, https, blob, data)
  if (typeof imageData === 'string') {
    const str = imageData.trim();
    
    // ⚠️ CRITIQUE : Détecter et corriger les chemins Windows
    if (str.includes('\\') || str.includes('C:\\') || str.includes('C:/') || str.includes('xampp')) {
      console.warn('⚠️ Windows path detected, cleaning:', str);
      
      // Extraire le nom de fichier du chemin Windows
      let filename = '';
      
      // Chercher après le dernier backslash ou slash
      const backslashIndex = str.lastIndexOf('\\');
      const slashIndex = str.lastIndexOf('/');
      const lastSeparator = Math.max(backslashIndex, slashIndex);
      
      if (lastSeparator !== -1) {
        filename = str.substring(lastSeparator + 1);
      } else {
        filename = str;
      }
      
      // Nettoyer le nom de fichier
      filename = filename.replace(/[^\w\d.-]/g, '_');
      
      console.log('📄 Extracted filename:', filename);
      
      // Retourner l'URL publique correcte
      const publicUrl = `${API_BASE_URL}/storage/${filename}`;
      console.log('✅ Converted to public URL:', publicUrl);
      return publicUrl;
    }
    
    // URL complète
    if (str.startsWith('http://') || str.startsWith('https://')) {
      return str;
    }
    
    // URL blob ou data URL
    if (str.startsWith('blob:') || str.startsWith('data:')) {
      return str;
    }
    
    // Chemin absolu (/storage/...)
    if (str.startsWith('/')) {
      // Éviter les doublons d'URL
      if (str.startsWith('/api/')) {
        const cleanPath = str.replace('/api/', '/');
        return `${API_BASE_URL}${cleanPath}`;
      }
      return `${API_BASE_URL}${str}`;
    }
    
    // Chemin relatif (storage/... ou public/...)
    if (str.startsWith('storage/') || str.startsWith('public/')) {
      return `${API_BASE_URL}/storage/${str.replace(/^(storage\/|public\/)/, '')}`;
    }
    
    // Nom simple de fichier
    return `${API_BASE_URL}/storage/${str}`;
  }
  
  // Cas 2: Objet Laravel (avec url, path, etc.)
  if (typeof imageData === 'object' && imageData !== null) {
    // Priorité 1: url complète
    if (imageData.url && typeof imageData.url === 'string') {
      return formatImageUrl(imageData.url);
    }
    
    // Priorité 2: path
    if (imageData.path && typeof imageData.path === 'string') {
      return formatImageUrl(imageData.path);
    }
    
    // Priorité 3: file_path
    if (imageData.file_path && typeof imageData.file_path === 'string') {
      return formatImageUrl(imageData.file_path);
    }
    
    // Priorité 4: filename
    if (imageData.filename && typeof imageData.filename === 'string') {
      return formatImageUrl(imageData.filename);
    }
    
    // Chercher dans toutes les propriétés string
    for (const key in imageData) {
      if (typeof imageData[key] === 'string') {
        const result = formatImageUrl(imageData[key]);
        if (result && !result.includes('C:\\')) {
          return result;
        }
      }
    }
  }
  
  return '';
};

/**
 * Fonction pour formater complètement une pharmacie
 */
const formatPharmacyData = (data: any): Pharmacy => {
  if (!data) {
    return {
      id: 0,
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      phone: '',
      is_garde: false,
      opening_time: '08:00',
      closing_time: '20:00',
      is_active: true,
      user_id: 0,
      created_at: '',
      updated_at: '',
    };
  }

  // Formater l'URL du logo AVANT de créer l'objet
  const logoUrl = formatImageUrl(data.logo);
  
  console.log('🏥 Formatting pharmacy data:', {
    id: data.id,
    name: data.name,
    originalLogo: data.logo,
    formattedLogo: logoUrl
  });

  return {
    id: Number(data.id) || 0,
    name: String(data.name || ''),
    description: data.description ? String(data.description) : undefined,
    address: String(data.address || ''),
    latitude: parseFloat(data.latitude) || 0,
    longitude: parseFloat(data.longitude) || 0,
    phone: String(data.phone || ''),
    email: data.email ? String(data.email) : undefined,
    logo: logoUrl, // Utiliser l'URL formatée
    is_garde: Boolean(data.is_garde),
    opening_time: String(data.opening_time || '08:00'),
    closing_time: String(data.closing_time || '20:00'),
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    user_id: Number(data.user_id) || 0,
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || ''),
    user: data.user || undefined,
    medicaments: data.medicaments || [],
  };
};

// Paramètres pour les pharmacies
export interface PharmacyParams {
  garde?: boolean;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  per_page?: number;
  page?: number;
  is_active?: boolean;
}

export const pharmacyService = {
  /**
   * Récupérer toutes les pharmacies
   */
  getAll: async (params?: PharmacyParams): Promise<Pharmacy[]> => {
    try {
      console.log('📡 Fetching pharmacies with params:', params);
      
      const response = await axiosClient.get('/pharmacies', { params });
      console.log('📦 Pharmacies API response structure:', {
        isArray: Array.isArray(response.data),
        hasData: 'data' in response.data,
        keys: Object.keys(response.data)
      });

      // Extraire le tableau de pharmacies de la réponse
      let pharmaciesArray: any[] = [];
      
      if (Array.isArray(response.data)) {
        pharmaciesArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Format Laravel typique: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          pharmaciesArray = response.data.data;
        }
        // Format alternatif: { pharmacies: [...] }
        else if ('pharmacies' in response.data && Array.isArray(response.data.pharmacies)) {
          pharmaciesArray = response.data.pharmacies;
        }
        // Format direct
        else if ('data' in response.data && response.data.data) {
          const data = response.data.data;
          if (Array.isArray(data)) {
            pharmaciesArray = data;
          }
        }
        // Essayer de trouver un tableau dans l'objet
        else {
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              pharmaciesArray = response.data[key];
              break;
            }
          }
        }
      }

      console.log(`✅ Found ${pharmaciesArray.length} pharmacies`);
      
      // Formater chaque pharmacie avec logs détaillés
      const formattedPharmacies = pharmaciesArray.map((pharmacy, index) => {
        console.log(`🔍 Pharmacy ${index + 1} raw data:`, {
          name: pharmacy.name,
          logoRaw: pharmacy.logo,
          logoType: typeof pharmacy.logo
        });
        
        const formatted = formatPharmacyData(pharmacy);
        
        console.log(`✅ Pharmacy ${index + 1} formatted:`, {
          name: formatted.name,
          logo: formatted.logo,
          logoValid: formatted.logo && !formatted.logo.includes('C:\\')
        });
        
        return formatted;
      });

      return formattedPharmacies;
      
    } catch (error: any) {
      console.error('❌ Error fetching pharmacies:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return [];
    }
  },

  /**
   * Récupérer une pharmacie par ID
   */
  getById: async (id: number): Promise<Pharmacy> => {
    try {
      console.log(`📡 Fetching pharmacy with ID: ${id}`);
      
      const response = await axiosClient.get(`/pharmacies/${id}`);
      console.log('📦 Pharmacy API response:', response.data);
      
      // Extraire les données de la pharmacie
      let pharmacyData: any;
      
      if (response.data.pharmacy) {
        pharmacyData = response.data.pharmacy;
      } else if (response.data.data) {
        pharmacyData = response.data.data;
      } else {
        pharmacyData = response.data;
      }
      
      const formattedPharmacy = formatPharmacyData(pharmacyData);
      console.log('✅ Formatted pharmacy:', {
        name: formattedPharmacy.name,
        logo: formattedPharmacy.logo,
        logoRaw: pharmacyData.logo,
        isWindowsPath: formattedPharmacy.logo?.includes('C:\\')
      });
      
      return formattedPharmacy;
      
    } catch (error: any) {
      console.error(`❌ Error fetching pharmacy ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  /**
   * Récupérer la pharmacie d'un utilisateur
   */
  getByUserId: async (userId: number): Promise<Pharmacy | null> => {
    try {
      const response = await axiosClient.get(`/pharmacies/user/${userId}`);
      
      let pharmacyData: any;
      if (response.data.pharmacy) {
        pharmacyData = response.data.pharmacy;
      } else if (response.data.data) {
        pharmacyData = response.data.data;
      } else if (response.data) {
        pharmacyData = response.data;
      } else {
        return null;
      }
      
      return formatPharmacyData(pharmacyData);
      
    } catch (error: any) {
      console.error('❌ Error fetching pharmacy by user ID:', error);
      return null;
    }
  },

  /**
   * Créer une nouvelle pharmacie
   */
  create: async (data: FormData | Partial<Pharmacy>): Promise<Pharmacy> => {
    try {
      console.log('📡 Creating pharmacy with data:', data);
      
      const isFormData = data instanceof FormData;
      const headers = isFormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await axiosClient.post('/pharmacies', data, { headers });
      console.log('✅ Pharmacy create response:', response.data);
      
      let pharmacyData: any;
      if (response.data.pharmacy) {
        pharmacyData = response.data.pharmacy;
      } else if (response.data.data) {
        pharmacyData = response.data.data;
      } else {
        pharmacyData = response.data;
      }
      
      return formatPharmacyData(pharmacyData);
      
    } catch (error: any) {
      console.error('❌ Error creating pharmacy:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une pharmacie
   */
  update: async (id: number, data: FormData | Partial<Pharmacy>): Promise<Pharmacy> => {
    try {
      console.log(`📡 Updating pharmacy ${id} with data:`, data);
      
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        // FormData: utiliser POST avec _method=PUT
        const formData = data as FormData;
        
        if (!formData.has('_method')) {
          formData.append('_method', 'PUT');
        }
        
        console.log('📦 Sending FormData with _method=PUT');
        
        const response = await axiosClient.post(`/pharmacies/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log('✅ Update response (FormData):', response.data);
        
        let pharmacyData: any;
        if (response.data.pharmacy) {
          pharmacyData = response.data.pharmacy;
        } else if (response.data.data) {
          pharmacyData = response.data.data;
        } else {
          pharmacyData = response.data;
        }
        
        return formatPharmacyData(pharmacyData);
        
      } else {
        // Données JSON: utiliser PUT normal
        const jsonData = data as Partial<Pharmacy>;
        
        console.log('📦 Sending JSON data via PUT');
        
        const response = await axiosClient.put(`/pharmacies/${id}`, jsonData, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Update response (JSON):', response.data);
        
        let pharmacyData: any;
        if (response.data.pharmacy) {
          pharmacyData = response.data.pharmacy;
        } else if (response.data.data) {
          pharmacyData = response.data.data;
        } else {
          pharmacyData = response.data;
        }
        
        return formatPharmacyData(pharmacyData);
      }
      
    } catch (error: any) {
      console.error(`❌ Error updating pharmacy ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(error.response?.data?.message || `Failed to update pharmacy ${id}`);
    }
  },

  /**
   * Basculer le statut de garde
   */
  toggleGarde: async (id: number): Promise<{ message: string; is_garde: boolean }> => {
    try {
      console.log(`📡 Toggling garde for pharmacy ${id}`);
      
      const response = await axiosClient.patch(`/pharmacies/${id}/toggle-garde`);
      console.log('✅ Toggle garde response:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error(`❌ Error toggling garde for pharmacy ${id}:`, error);
      throw error;
    }
  },

  /**
   * Basculer le statut actif
   */
  toggleActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    try {
      console.log(`📡 Toggling active for pharmacy ${id}`);
      
      const response = await axiosClient.put(`/pharmacies/${id}/toggle-active`);
      console.log('✅ Toggle active response:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error(`❌ Error toggling active for pharmacy ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les pharmacies en attente
   */
  getPending: async (): Promise<Pharmacy[]> => {
    try {
      console.log('📡 Fetching pending pharmacies');
      
      const response = await axiosClient.get('/pharmacies/pending');
      console.log('📦 Pending pharmacies response:', response.data);

      let pharmaciesArray: any[] = [];
      
      if (Array.isArray(response.data)) {
        pharmaciesArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray(response.data.data)) {
          pharmaciesArray = response.data.data;
        } else if ('pharmacies' in response.data && Array.isArray(response.data.pharmacies)) {
          pharmaciesArray = response.data.pharmacies;
        }
      }

      const formattedPharmacies = pharmaciesArray.map(formatPharmacyData);
      console.log(`✅ Found ${formattedPharmacies.length} pending pharmacies`);
      
      return formattedPharmacies;
      
    } catch (error: any) {
      console.error('❌ Error fetching pending pharmacies:', error);
      return [];
    }
  },

  /**
   * Recherche avancée de pharmacies
   */
  search: async (params: {
    search?: string;
    garde?: boolean;
    is_active?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number;
    per_page?: number;
    page?: number;
  }): Promise<{ data: Pharmacy[]; meta?: any }> => {
    try {
      console.log('🔍 Searching pharmacies with params:', params);
      
      const response = await axiosClient.get('/pharmacies', { params });
      const responseData = response.data;
      
      let pharmaciesArray: any[] = [];
      
      if (Array.isArray(responseData)) {
        pharmaciesArray = responseData;
      } else if (responseData && typeof responseData === 'object') {
        if ('data' in responseData && Array.isArray(responseData.data)) {
          pharmaciesArray = responseData.data;
        } else if ('pharmacies' in responseData && Array.isArray(responseData.pharmacies)) {
          pharmaciesArray = responseData.pharmacies;
        }
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
      
    } catch (error: any) {
      console.error('❌ Error searching pharmacies:', error);
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

  /**
   * Mettre à jour uniquement le logo
   */
  updateLogo: async (id: number, logoFile: File): Promise<Pharmacy> => {
    try {
      console.log(`📡 Updating logo for pharmacy ${id}`);
      
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('_method', 'PUT');
      
      const response = await axiosClient.post(`/pharmacies/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      let pharmacyData: any;
      if (response.data.pharmacy) {
        pharmacyData = response.data.pharmacy;
      } else if (response.data.data) {
        pharmacyData = response.data.data;
      } else {
        pharmacyData = response.data;
      }
      
      return formatPharmacyData(pharmacyData);
      
    } catch (error: any) {
      console.error(`❌ Error updating logo for pharmacy ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une pharmacie
   */
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log(`🗑️ Deleting pharmacy ${id}`);
      
      await axiosClient.delete(`/pharmacies/${id}`);
      
      return {
        success: true,
        message: 'Pharmacie supprimée avec succès'
      };
      
    } catch (error: any) {
      console.error(`❌ Error deleting pharmacy ${id}:`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || `Erreur lors de la suppression de la pharmacie ${id}`
      };
    }
  }
};