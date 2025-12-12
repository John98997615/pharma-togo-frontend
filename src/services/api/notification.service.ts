// src/services/api/notification.service.ts
import axiosClient from './axiosClient';
import { Notification } from '../../types/notification.types';

export const notificationService = {

  getAll: async (params?: { read?: boolean }): Promise<Notification[]> => {
    try {
      const response = await axiosClient.get('/notifications', { params });

      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as Notification[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Notification[];
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as Notification[];
      }

      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const notifications = Object.values(response.data);
        if (Array.isArray(notifications) && notifications.length > 0) {
          return notifications as Notification[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getUnread: async (): Promise<Notification[]> => {
    try {
      const response = await axiosClient.get('/notifications/unread');

      // Gérer différents formats de réponse API
      if (response.data && Array.isArray(response.data)) {
        return response.data as Notification[];
      }

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as Notification[];
      }

      // Si la réponse directe est un tableau
      if (Array.isArray(response.data)) {
        return response.data as Notification[];
      }

      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      if (response.data && typeof response.data === 'object') {
        const notifications = Object.values(response.data);
        if (Array.isArray(notifications) && notifications.length > 0) {
          return notifications as Notification[];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  },

  getCount: async (): Promise<{ count: number }> => {
    const response = await axiosClient.get('/notifications/count');
    return response.data;
  },

  getStatistics: async (): Promise<any> => {
    const response = await axiosClient.get('/notifications/statistics');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await axiosClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await axiosClient.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/notifications/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await axiosClient.delete('/notifications');
  }
};