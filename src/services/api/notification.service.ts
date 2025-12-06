// src/services/api/notification.service.ts
import axiosClient from './axiosClient';
import { Notification } from '../../types/notification.types';

export const notificationService = {
  getAll: async (params?: { read?: boolean }): Promise<Notification[]> => {
    const response = await axiosClient.get('/notifications', { params });
    return response.data;
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await axiosClient.get('/notifications/unread');
    return response.data;
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