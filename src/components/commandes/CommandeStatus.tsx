// src/components/commandes/CommandeStatus.tsx
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { CommandeStatus as CommandeStatusType } from '../../types/commande.types';

interface CommandeStatusProps {
  status: CommandeStatusType;
  size?: 'sm' | 'md' | 'lg';
}

const CommandeStatus: React.FC<CommandeStatusProps> = ({ status, size = 'md' }) => {
  const config = {
    en_attente: {
      icon: Clock,
      label: 'En attente',
      color: 'text-yellow-600 bg-yellow-100',
      iconColor: 'text-yellow-500',
    },
    confirmee: {
      icon: CheckCircle,
      label: 'Confirmée',
      color: 'text-blue-600 bg-blue-100',
      iconColor: 'text-blue-500',
    },
    en_cours: {
      icon: Truck,
      label: 'En cours',
      color: 'text-green-600 bg-green-100',
      iconColor: 'text-green-500',
    },
    livree: {
      icon: Package,
      label: 'Livrée',
      color: 'text-purple-600 bg-purple-100',
      iconColor: 'text-purple-500',
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
      <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />
      <span className="font-medium">{label}</span>
    </div>
  );
};

// Composant pour afficher la progression d'une commande
export const CommandeProgress: React.FC<{ status: CommandeStatusType }> = ({ status }) => {
  const steps = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'confirmee', label: 'Confirmée' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'livree', label: 'Livrée' },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  
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
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Statut actuel: <span className="font-bold">{config[status].label}</span>
        </p>
      </div>
    </div>
  );
};

export default CommandeStatus;