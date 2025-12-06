// src/services/api/auth.service.ts
import axiosClient from './axiosClient';
import { User, AuthResponse } from '../../types/user.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'client' | 'pharmacien' | 'livreur';
  address: string;
  photo?: File;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('role', data.role);
    formData.append('address', data.address);
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    
    const response = await axiosClient.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post('/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosClient.get('/user');
    return response.data;
  },

  updateProfile: async (id: number, data: Partial<User>): Promise<User> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.photo && data.photo instanceof File) {
      formData.append('photo', data.photo);
    }
    
    const response = await axiosClient.put(`/user/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};