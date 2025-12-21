// src/components/pharmacies/PharmacyCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  AlertTriangle,
  Navigation,
  Building,
  Package
} from 'lucide-react';
import { Pharmacy } from '../../types/pharmacy.types';

// Fonction SIMPLIFIÉE pour obtenir l'URL de l'image
const getImageUrl = (logo: any): string => {
  if (!logo) return '';
  
  // Si c'est une URL complète
  if (typeof logo === 'string') {
    if (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('blob:')) {
      return logo;
    }
    
    // Si c'est un chemin relatif, construire l'URL complète
    if (logo.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
      return `${baseUrl}${logo}`;
    }
    
    // Sinon, supposer que c'est un chemin de stockage
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${logo.replace(/^storage\//, '')}`;
  }
  
  // Si c'est un objet, prendre l'URL ou le chemin
  if (typeof logo === 'object') {
    if (logo.url) return getImageUrl(logo.url);
    if (logo.path) return getImageUrl(logo.path);
  }
  
  return '';
};

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  showActions?: boolean;
  onEdit?: (pharmacy: Pharmacy) => void;
  onToggleGarde?: (id: number) => void;
  onToggleActive?: (id: number) => void;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  showActions = false,
  onEdit,
  onToggleGarde,
  onToggleActive,
}) => {
  const formatHours = (opening: string, closing: string) => {
    return `${opening.slice(0, 5)} - ${closing.slice(0, 5)}`;
  };

  const handleGetDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${position.coords.latitude},${position.coords.longitude}&destination=${pharmacy.latitude},${pharmacy.longitude}`;
        window.open(url, '_blank');
      });
    } else {
      const url = `https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Obtenir l'URL de l'image UNE FOIS
  const logoUrl = getImageUrl(pharmacy.logo);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* En-tête avec image - SIMPLIFIÉ */}
      <div className="h-48 relative bg-gradient-to-r from-blue-500 to-blue-700">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={pharmacy.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // En cas d'erreur, afficher l'icône à la place
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        
        {/* Icône de secours si pas d'image ou image échouée */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Building className="h-16 w-16 text-white opacity-80" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {pharmacy.is_garde && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white">
              <AlertTriangle className="h-4 w-4 mr-1" />
              DE GARDE
            </span>
          )}
          {!pharmacy.is_active && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-600 text-white">
              FERMÉE
            </span>
          )}
        </div>

        {/* Statut */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            pharmacy.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {pharmacy.is_active ? '🟢 OUVERTE' : '🔴 FERMÉE'}
          </span>
        </div>
      </div>

      {/* Le reste du code reste inchangé... */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{pharmacy.name}</h3>
          {pharmacy.description && (
            <p className="text-gray-600 line-clamp-2">{pharmacy.description}</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{pharmacy.address}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{pharmacy.phone}</span>
          </div>
          {pharmacy.email && (
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{pharmacy.email}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatHours(pharmacy.opening_time, pharmacy.closing_time)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 mr-1" />
              <p className="text-2xl font-bold text-blue-600">
                {pharmacy.medicaments?.length || 0}
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-1">Médicaments</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500 mr-1" />
              <p className="text-2xl font-bold text-green-600">4.8</p>
            </div>
            <p className="text-xs text-gray-600 mt-1">Note</p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <Link
              to={`/pharmacies/${pharmacy.id}`}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 text-center"
            >
              Voir détails
            </Link>
            
            <button
              onClick={handleGetDirections}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Itinéraire
            </button>
          </div>

          {showActions && (
            <div className="grid grid-cols-2 gap-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(pharmacy)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Modifier
                </button>
              )}
              
              {onToggleGarde && (
                <button
                  onClick={() => onToggleGarde(pharmacy.id)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    pharmacy.is_garde
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pharmacy.is_garde ? 'Retirer garde' : 'Mettre en garde'}
                </button>
              )}

              {onToggleActive && (
                <button
                  onClick={() => onToggleActive(pharmacy.id)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    pharmacy.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {pharmacy.is_active ? 'Désactiver' : 'Activer'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;