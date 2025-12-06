// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification.types';
import { notificationService } from '../services/api/notification.service';
import { useAuth } from './AuthContext';

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
        notificationService.getAll(),
        notificationService.getCount()
      ]);
      
      setNotifications(allNotifications);
      setUnreadCount(countData.count);
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
      await refreshNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await refreshNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage de tout comme lu:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.delete(id);
      await refreshNotifications();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAll();
      await refreshNotifications();
    } catch (error) {
      console.error('Erreur lors de la suppression de tout:', error);
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