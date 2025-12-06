// src/components/notifications/NotificationList.tsx
import React from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  compact?: boolean;
  filter?: 'all' | 'unread';
  limit?: number;
}

const NotificationList: React.FC<NotificationListProps> = ({
  compact = false,
  filter = 'all',
  limit,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  // Filtrer les notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = [...notifications];
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read_at);
    }
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [notifications, filter, limit]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Erreur lors du marquage de tout comme lu:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) {
      try {
        await deleteAllNotifications();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des notifications...</p>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
        </h3>
        <p className="text-gray-600">
          {filter === 'unread' 
            ? 'Vous avez lu toutes vos notifications.' 
            : 'Vous n\'avez pas encore de notifications.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec actions */}
      {!compact && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              Notifications ({filteredNotifications.length})
            </span>
            {unreadCount > 0 && filter === 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <Check className="h-4 w-4 mr-1" />
                Tout marquer comme lu
              </button>
            )}
            <button
              onClick={handleDeleteAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Tout supprimer
            </button>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className={compact ? '' : 'space-y-3'}>
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            compact={compact}
          />
        ))}
      </div>

      {/* Voir plus */}
      {limit && filteredNotifications.length >= limit && !compact && (
        <div className="text-center pt-4">
          <a
            href="/notifications"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir toutes les notifications →
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationList;