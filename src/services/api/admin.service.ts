// src/services/api/admin.service.ts
import axiosClient from './axiosClient';
import { User, UserRole } from '../../types/user.types';
import { Category } from '../../types/category.types';
import { Pharmacy } from '../../types/pharmacy.types';

export const adminService = {
  // Gestion des utilisateurs
  getAllUsers: async (params?: { role?: UserRole; search?: string }): Promise<User[]> => {
    const response = await axiosClient.get('/users', { params });
    return response.data;
  },

  toggleUserActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
    const response = await axiosClient.put(`/users/${id}/toggle-active`);
    return response.data;
  },

  updateUserRole: async (id: number, role: UserRole): Promise<User> => {
    const response = await axiosClient.put(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },

  // NOUVELLES MÉTHODES POUR LES PHARMACIES
  getAllPharmacies: async (params?: {
    status?: 'active' | 'inactive';
    garde?: boolean;
    search?: string;
  }): Promise<Pharmacy[]> => {
    const response = await axiosClient.get('/pharmacies', { params });
    return response.data;
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
  createCategory: async (data: FormData): Promise<Category> => {
    const response = await axiosClient.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

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

  // Statistiques
  getStatistics: async (): Promise<any> => {
    const response = await axiosClient.get('/statistics');
    return response.data;
  },

  getRecentOrders: async (): Promise<any> => {
    const response = await axiosClient.get('/recent-orders');
    return response.data;
  }
};