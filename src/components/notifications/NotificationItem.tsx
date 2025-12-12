// src/components/notifications/NotificationItem.tsx
import React from 'react';
import { 
  Bell, 
  ShoppingCart, 
  Package, 
  Truck, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Notification } from '../../types/notification.types';
import { X } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
}) => {
  const getIcon = () => {
    const data = notification.data;
    if (!data) return Bell;

    switch (data.type) {
      case 'commande':
        return ShoppingCart;
      case 'livraison':
        return Truck;
      case 'paiement':
        return DollarSign;
      case 'stock':
        return Package;
      case 'user':
        return User;
      case 'alert':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getColor = () => {
    const data = notification.data;
    if (!data) return 'bg-blue-100 text-blue-600';

    switch (data.type) {
      case 'commande':
        return 'bg-purple-100 text-purple-600';
      case 'livraison':
        return 'bg-green-100 text-green-600';
      case 'paiement':
        return 'bg-yellow-100 text-yellow-600';
      case 'stock':
        return 'bg-red-100 text-red-600';
      case 'alert':
        return 'bg-red-100 text-red-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr,
      });
    } catch {
      return '';
    }
  };

  const Icon = getIcon();
  const isRead = !!notification.read_at;

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
          !isRead ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* Icône */}
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor()}`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {notification.data?.title || 'Notification'}
            </p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {notification.data?.message || ''}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatTime(notification.created_at)}
              </span>
              {!isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all ${
        !isRead ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Icône */}
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getColor()}`}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Contenu */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900">
                {notification.data?.title || 'Notification'}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {formatTime(notification.created_at)}
                </span>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 mt-2">
              {notification.data?.message || ''}
            </p>

            {/* Actions */}
            {notification.data?.actions && (
              <div className="flex flex-wrap gap-2 mt-3">
                {notification.data.actions.map((action: any, index: number) => (
                  <a
                    key={index}
                    href={action.url}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            )}

            {/* Métadonnées */}
            {notification.data?.metadata && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(notification.data.metadata).map(([key, value]) => (
                    <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;