import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification.types';
import { notificationService } from '../services/api/notification.service';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [allNotifications, countData] = await Promise.all([
        notificationService.getAll().catch(err => {
          console.error('Erreur chargement notifications:', err);
          toast.error('Erreur chargement notifications');
          return [];
        }),
        notificationService.getCount().catch(err => {
          console.error('Erreur comptage notifications:', err);
          return { count: 0 };
        })
      ]);
      
      setNotifications(allNotifications);
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
    
    // Polling pour les notifications (toutes les 30 secondes)
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      // Mettre à jour localement sans recharger toutes les notifications
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      toast.error('Erreur lors du marquage comme lu');
      throw error;
    }
  };

  const markAllAsRead = async () => {
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
    } catch (error) {
      console.error('Erreur lors du marquage de tout comme lu:', error);
      toast.error('Erreur lors du marquage de tout comme lu');
      throw error;
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.delete(id);
      // Supprimer localement
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Mettre à jour le compteur si la notification était non lue
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Toutes les notifications supprimées');
    } catch (error) {
      console.error('Erreur lors de la suppression de tout:', error);
      toast.error('Erreur lors de la suppression de tout');
      throw error;
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};