// src/components/commandes/CommandeCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Calendar, MapPin, User, Package } from 'lucide-react';
import { Commande } from '../../types/commande.types';
import CommandeStatus from './CommandeStatus';

interface CommandeCardProps {
  commande: Commande;
  showActions?: boolean;
  onStatusUpdate?: (id: number, status: string) => void;
}

const CommandeCard: React.FC<CommandeCardProps> = ({ 
  commande, 
  showActions = false,
  onStatusUpdate 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusActions = () => {
    switch (commande.status) {
      case 'en_attente':
        return [
          { label: 'Confirmer', status: 'confirmee', color: 'bg-green-600 hover:bg-green-700' },
          { label: 'Annuler', status: 'annulee', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'confirmee':
        return [
          { label: 'Mettre en cours', status: 'en_cours', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'Annuler', status: 'annulee', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'en_cours':
        return [
          { label: 'Marquer comme livrée', status: 'livree', color: 'bg-purple-600 hover:bg-purple-700' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold">Commande #{commande.numero_commande}</h3>
            </div>
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(commande.created_at)}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {commande.user?.name || 'Client'}
              </div>
              {commande.pharmacy && (
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  {commande.pharmacy.name}
                </div>
              )}
            </div>
          </div>
          <CommandeStatus status={commande.status} />
        </div>

        {/* Détails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-2xl font-bold text-gray-900">
              {commande.total_amount.toLocaleString()} FCFA
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Méthode de paiement</p>
            <p className="font-medium capitalize">
              {commande.payment_method.replace('_', ' ')}
            </p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              commande.payment_status === 'paye' ? 'bg-green-100 text-green-800' :
              commande.payment_status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {commande.payment_status}
            </span>
          </div>
          {commande.delivery_address && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Adresse de livraison</p>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700">{commande.delivery_address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Produits commandés</h4>
          <div className="space-y-3">
            {commande.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.medicament?.image ? (
                    <img
                      src={item.medicament.image}
                      alt={item.medicament.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.medicament?.name || 'Produit'}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {item.unit_price.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                <p className="font-bold">
                  {(item.quantity * item.unit_price).toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {commande.notes && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note :</span> {commande.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Link
            to={`/commandes/${commande.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir les détails →
          </Link>
          
          {showActions && onStatusUpdate && (
            <div className="flex space-x-2">
              {getStatusActions().map((action) => (
                <button
                  key={action.status}
                  onClick={() => onStatusUpdate(commande.id, action.status)}
                  className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandeCard;