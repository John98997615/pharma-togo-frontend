
// src/services/api/category.service.ts
import axiosClient from './axiosClient';
import { Category } from '../../types/category.types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await axiosClient.get('/categories');


      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as Category[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Category[];
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as Category[];
      }


      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const categories = Object.values(response.data);
        if (Array.isArray(categories) && categories.length > 0) {
          return categories as Category[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Category> => {
    try {
      const response = await axiosClient.get(`/categories/${id}`);

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }
};
