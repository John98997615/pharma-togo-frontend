// src/hooks/useNotifications.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Notification } from '../types/notification.types';
import { notificationService } from '../services/api/notification.service';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getAll(params);
      setNotifications(data);
      
      // Compter les notifications non lues
      const unread = data.filter(n => !n.read_at).length;
      setUnreadCount(unread);
      
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      setError(message);
      console.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getUnread();
      setNotifications(data);
      setUnreadCount(data.length);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des notifications non lues';
      setError(message);
      console.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getCount();
      setUnreadCount(data.count);
      return data.count;
    } catch (err: any) {
      console.error('Erreur lors du comptage des notifications non lues:', err);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const updatedNotification = await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? updatedNotification : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return updatedNotification;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du marquage comme lu';
      toast.error(message);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Mettre à jour localement toutes les notifications comme lues
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du marquage de tout comme lu';
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Mettre à jour le compteur si la notification était non lue
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification supprimée');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
      throw err;
    }
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Toutes les notifications supprimées');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression de tout';
      toast.error(message);
      throw err;
    }
  }, []);

  const getNotificationStatistics = useCallback(async () => {
    try {
      const data = await notificationService.getStatistics();
      return data;
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
      throw err;
    }
  }, []);

  // Polling automatique pour les nouvelles notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getNotificationStatistics,
    setNotifications,
    setLoading,
    setError,
    setUnreadCount,
  };
};