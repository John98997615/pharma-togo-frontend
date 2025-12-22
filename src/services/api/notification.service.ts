// src/services/api/notification.service.ts
import axiosClient from './axiosClient';
import { Notification } from '../../types/notification.types';

export const notificationService = {
  getAll: async (params?: { read?: boolean }): Promise<Notification[]> => {
    try {
      const response = await axiosClient.get('/notifications', { params });
      console.log('Réponse notifications:', response.data);
      
      // Gérer différents formats de réponse API
      if (response.data && response.data.success && response.data.notifications) {
        return response.data.notifications as Notification[];
      }
      
      if (response.data && Array.isArray(response.data)) {
        return response.data as Notification[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Notification[];
      }

      console.warn('Format de réponse inattendu pour notifications:', response.data);
      return [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      throw error;
    }
  },

  getUnread: async (): Promise<Notification[]> => {
    try {
      const response = await axiosClient.get('/notifications/unread');
      console.log('Réponse notifications non lues:', response.data);
      
      if (response.data && response.data.success && response.data.notifications) {
        return response.data.notifications as Notification[];
      }
      
      if (response.data && Array.isArray(response.data)) {
        return response.data as Notification[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Notification[];
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching unread notifications:', error.response?.data || error.message);
      throw error;
    }
  },

  getCount: async (): Promise<{ count: number }> => {
    try {
      const response = await axiosClient.get('/notifications/count');
      console.log('Réponse count notifications:', response.data);
      
      // Gérer différents formats
      if (response.data && response.data.success) {
        return { count: response.data.unread_count || 0 };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notification count:', error.response?.data || error.message);
      return { count: 0 };
    }
  },

  getStatistics: async (): Promise<any> => {
    try {
      const response = await axiosClient.get('/notifications/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notification statistics:', error.response?.data || error.message);
      throw error;
    }
  },

  markAsRead: async (id: number): Promise<Notification> => {
    try {
      // NOTE: Votre route API est PUT /notifications/{notification}/read
      const response = await axiosClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      // NOTE: Votre route API est PUT /notifications/read-all
      const response = await axiosClient.put('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
    } catch (error: any) {
      console.error('Error deleting notification:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      await axiosClient.delete('/notifications');
    } catch (error: any) {
      console.error('Error deleting all notifications:', error.response?.data || error.message);
      throw error;
    }
  }
};