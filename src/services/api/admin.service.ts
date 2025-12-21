// src/services/api/admin.service.ts
import axiosClient from './axiosClient';
import { User, UserRole } from '../../types/user.types';
import { Category } from '../../types/category.types';
import { Pharmacy } from '../../types/pharmacy.types';
import { pharmacyService } from './pharmacy.service';

export const adminService = {

  // Dans src/services/api/admin.service.ts, ajoutez cette fonction
  createUser: async (userData: any): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('phone', userData.phone);
      formData.append('password', userData.password);
      formData.append('password_confirmation', userData.password_confirmation);
      formData.append('role', userData.role);
      formData.append('address', userData.address || '');

      if (userData.photo instanceof File) {
        formData.append('photo', userData.photo);
      }

      const response = await axiosClient.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.user;
    } catch (error: any) {
      console.error('Erreur création utilisateur:', error.response?.data);
      throw error;
    }
  },

  // Gestion des utilisateurs
  getAllUsers: async (params?: { role?: UserRole; search?: string }): Promise<User[]> => {
    try {
      const response = await axiosClient.get('/users', { params });

      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as User[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as User[];
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as User[];
      }

      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const users = Object.values(response.data);
        if (Array.isArray(users) && users.length > 0) {
          return users as User[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  },

  // PUT /api/users/{user}/toggle-active
  toggleUserActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    const response = await axiosClient.put(`/users/${id}/toggle-active`);
    return response.data;
  },

  // PUT /api/users/{user}/role
  updateUserRole: async (id: number, role: UserRole): Promise<User> => {
    const response = await axiosClient.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // DELETE /api/users/{user}
  deleteUser: async (id: number): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },


  // Récupérer TOUTES les pharmacies (actives + inactives)
  getAllPharmacies: async (): Promise<Pharmacy[]> => {
    try {
      // Essayer d'abord la route admin spécifique
      try {
        const response = await axiosClient.get('/admin/pharmacies/all');
        return response.data.data || response.data;
      } catch (adminError) {
        console.log('Route admin spécifique non disponible, tentative standard...');
      }

      // Fallback: utiliser la route standard avec paramètre
      const response = await axiosClient.get('/pharmacies', {
        params: {
          all: true, // Paramètre pour indiquer qu'on veut tout
          include_inactive: true
        }
      });

      // Si toujours vide, essayer les pharmacies en attente
      if (!response.data || response.data.length === 0 ||
        (response.data.data && response.data.data.length === 0)) {
        console.log('Route standard vide, tentative pharmacies/pending...');
        const pendingResponse = await axiosClient.get('/pharmacies/pending');
        const pendingPharms = pendingResponse.data.data || pendingResponse.data;

        // Récupérer aussi les pharmacies actives
        const activeResponse = await axiosClient.get('/pharmacies');
        const activePharms = activeResponse.data.data || activeResponse.data;

        // Fusionner
        return [...activePharms, ...pendingPharms];
      }

      // Gérer différents formats de réponse
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Erreur getAllPharmacies:', error.response?.data || error.message);
      return [];
    }
  },

  // Dans src/services/api/admin.service.ts, ajoutez cette fonction
  deletePharmacy: async (id: number): Promise<void> => {
    try {
      await axiosClient.delete(`/pharmacies/${id}`);
    } catch (error: any) {
      console.error('Erreur suppression pharmacie:', error.response?.data);
      throw error;
    }
  },

  approvePharmacy: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    try {
      // Utilisez togglePharmacyActive qui active la pharmacie
      const response = await adminService.togglePharmacyActive(id);
      return {
        message: 'Pharmacie activée avec succès',
        is_active: true
      };
    } catch (error: any) {
      console.error('Erreur approbation pharmacie:', error.response?.data);
      throw error;
    }
  },

  // GET /api/pharmacies/pending
  // Dans admin.service.ts
  getPendingPharmacies: async (): Promise<Pharmacy[]> => {
    try {
      const response = await axiosClient.get('/pharmacies/pending');

      // Si la réponse est un tableau, retournez-le
      if (Array.isArray(response.data)) {
        return response.data as Pharmacy[];
      }

      // Si la réponse a une propriété 'data' qui est un tableau
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data as Pharmacy[];
      }

      // Si c'est un objet avec les pharmacies dedans
      if (response.data && typeof response.data === 'object') {
        // Essayez de trouver un tableau dans l'objet
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            return response.data[key] as Pharmacy[];
          }
        }
      }

      console.warn('Format de réponse inattendu pour pending pharmacies:', response.data);
      return [];
    } catch (error: any) {
      console.error('Erreur getPendingPharmacies:', error.response?.data || error.message);
      return [];
    }
  },

  togglePharmacyActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    const response = await axiosClient.put(`/pharmacies/${id}/toggle-active`);
    return response.data;
  },

  getPharmacyStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    withGarde: number;
  }> => {
    const response = await axiosClient.get('/pharmacies/stats');
    return response.data;
  },

  // Gestion des catégories
  // POST /api/categories
  createCategory: async (data: FormData): Promise<Category> => {
    const response = await axiosClient.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // UPDATE /api/categories/{category}
  updateCategory: async (id: number, data: FormData | Partial<Category>): Promise<Category> => {
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await axiosClient.put(`/categories/${id}`, data, { headers });
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete(`/categories/${id}`);
  },

  getCategoryStatistics: async (id: number): Promise<any> => {
    const response = await axiosClient.get(`/categories/${id}/statistics`);
    return response.data;
  },

  // GET /api/statistics
  getStatistics: async (): Promise<any> => {
    const response = await axiosClient.get('/statistics');
    return response.data;
  },

  // GET /api/recent-orders
  getRecentOrders: async (): Promise<any> => {
    const response = await axiosClient.get('/recent-orders');
    return response.data;
  }
};