// src/components/livraisons/LivraisonStatus.tsx
import React from 'react';
import { 
  Clock, 
  Truck, 
  Package, 
  XCircle,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { LivraisonStatus as LivraisonStatusType } from '../../types/livraison.types';

interface LivraisonStatusProps {
  status: LivraisonStatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const LivraisonStatus: React.FC<LivraisonStatusProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const config = {
    en_attente: {
      icon: Clock,
      label: 'En attente',
      color: 'text-yellow-600 bg-yellow-100',
      iconColor: 'text-yellow-500',
    },
    en_cours: {
      icon: Truck,
      label: 'En cours',
      color: 'text-blue-600 bg-blue-100',
      iconColor: 'text-blue-500',
    },
    livree: {
      icon: Package,
      label: 'Livrée',
      color: 'text-green-600 bg-green-100',
      iconColor: 'text-green-500',
    },
    annulee: {
      icon: XCircle,
      label: 'Annulée',
      color: 'text-red-600 bg-red-100',
      iconColor: 'text-red-500',
    },
  };

  const { icon: Icon, label, color, iconColor } = config[status];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className={`inline-flex items-center rounded-full ${sizeClasses[size]} ${color}`}>
      {showIcon && <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />}
      <span className="font-medium">{label}</span>
    </div>
  );
};

// Composant pour afficher la progression d'une livraison
export const LivraisonProgress: React.FC<{ 
  status: LivraisonStatusType;
  estimatedTime?: string;
  actualTime?: string;
}> = ({ status, estimatedTime, actualTime }) => {
  const steps = [
    { key: 'en_attente', label: 'Préparation' },
    { key: 'en_cours', label: 'En route' },
    { key: 'livree', label: 'Livrée' },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const isDelivered = status === 'livree';
  const isCancelled = status === 'annulee';

  if (isCancelled) {
    return (
      <div className="text-center py-4">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 font-bold">Livraison annulée</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`flex flex-col items-center ${
              index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${
                index <= currentStepIndex
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}
            >
              {index <= currentStepIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            <span className="text-xs font-medium">{step.label}</span>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>

      <div className="mt-6 space-y-2">
        {estimatedTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Livraison estimée:</span>
            <span className="font-medium">
              {new Date(estimatedTime).toLocaleTimeString()} - 
              {new Date(estimatedTime).toLocaleDateString('fr-FR', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}

        {actualTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Livrée le:</span>
            <span className="font-medium text-green-600">
              {new Date(actualTime).toLocaleTimeString()} - 
              {new Date(actualTime).toLocaleDateString('fr-FR', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}

        {isDelivered && actualTime && (
          <div className="mt-2 p-2 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                Livraison effectuée avec succès
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivraisonStatus;