// src/services/api/category.service.ts
import axiosClient from './axiosClient';
import { Category } from '../../types/category.types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await axiosClient.get('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data;
  }
};