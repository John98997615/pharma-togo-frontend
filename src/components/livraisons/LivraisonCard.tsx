// src/components/livraisons/LivraisonCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  Navigation,
  CheckCircle
} from 'lucide-react';
import { Livraison, LivraisonStatus } from '../../types/livraison.types';
import LivraisonStatusComp from './LivraisonStatus';

interface LivraisonCardProps {
  livraison: Livraison;
  showActions?: boolean;
  onStatusUpdate?: (id: number, status: LivraisonStatus) => void;
  onPositionUpdate?: (id: number, lat: number, lng: number) => void;
}

const LivraisonCard: React.FC<LivraisonCardProps> = ({ 
  livraison, 
  showActions = false,
  onStatusUpdate,
  onPositionUpdate 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (estimatedTime?: string) => {
    if (!estimatedTime) return null;
    
    const now = new Date();
    const estimated = new Date(estimatedTime);
    const diffMs = estimated.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'En retard';
    if (diffHours > 0) return `Dans ${diffHours}h${diffMinutes > 0 ? `${diffMinutes}min` : ''}`;
    return `Dans ${diffMinutes}min`;
  };

  const handleStatusChange = (newStatus: LivraisonStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(livraison.id, newStatus);
    }
  };

  const handlePositionUpdate = () => {
    if (onPositionUpdate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onPositionUpdate(
            livraison.id,
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position');
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold">Livraison #{livraison.tracking_number}</h3>
            </div>
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Créée le {formatDate(livraison.created_at)}
              </div>
              {livraison.livreur && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {livraison.livreur.name}
                </div>
              )}
            </div>
          </div>
          <LivraisonStatusComp status={livraison.status} />
        </div>

        {/* Détails de la commande */}
        {livraison.commande && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Commande #{livraison.commande.numero_commande}</p>
                <p className="text-sm text-gray-600">
                  {livraison.commande.total_amount.toLocaleString()} FCFA • 
                  {livraison.commande.user?.name || 'Client'}
                </p>
              </div>
              <Link
                to={`/commandes/${livraison.commande.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir la commande →
              </Link>
            </div>
          </div>
        )}

        {/* Informations de livraison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Adresse de livraison</p>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-700">{livraison.delivery_address}</p>
              </div>
            </div>
            
            {livraison.delivery_lat && livraison.delivery_lng && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Coordonnées GPS</p>
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-mono">
                    {livraison.delivery_lat.toFixed(6)}, {livraison.delivery_lng.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Temps estimé</p>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-700">
                  {livraison.estimated_delivery_time 
                    ? formatDate(livraison.estimated_delivery_time)
                    : 'Non défini'
                  }
                </span>
              </div>
              {livraison.estimated_delivery_time && (
                <p className="text-sm text-blue-600 mt-1">
                  {getTimeRemaining(livraison.estimated_delivery_time)}
                </p>
              )}
            </div>

            {livraison.actual_delivery_time && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Livrée le</p>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">
                    {formatDate(livraison.actual_delivery_time)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {livraison.notes && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note :</span> {livraison.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <Link
              to={`/livraisons/${livraison.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Détails complets →
            </Link>
            {livraison.delivery_lat && livraison.delivery_lng && (
              <Link
                to={`/map?lat=${livraison.delivery_lat}&lng=${livraison.delivery_lng}`}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Voir sur la carte →
              </Link>
            )}
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {livraison.status === 'en_attente' && (
                <button
                  onClick={() => handleStatusChange('en_cours')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Commencer la livraison
                </button>
              )}
              
              {livraison.status === 'en_cours' && (
                <>
                  <button
                    onClick={handlePositionUpdate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Mettre à jour la position
                  </button>
                  <button
                    onClick={() => handleStatusChange('livree')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Marquer comme livrée
                  </button>
                </>
              )}
              
              {(livraison.status === 'en_attente' || livraison.status === 'en_cours') && (
                <button
                  onClick={() => handleStatusChange('annulee')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Annuler
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivraisonCard;