// src/components/livraisons/LivraisonMap.tsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { Livraison } from '../../types/livraison.types';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 6.1725,
  lng: 1.2314
};

const defaultZoom = 12;

interface LivraisonMapProps {
  livraison?: Livraison;
  livreurPosition?: { lat: number; lng: number; timestamp: string };
  showRoute?: boolean;
  onPositionUpdate?: (lat: number, lng: number) => void;
}

const LivraisonMap: React.FC<LivraisonMapProps> = ({ 
  livraison, 
  livreurPosition,
  showRoute = true,
  onPositionUpdate 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Définir les positions
  const destination = livraison ? {
    lat: livraison.delivery_lat || 6.1725,
    lng: livraison.delivery_lng || 1.2314
  } : null;

  // Obtenir la position actuelle
  useEffect(() => {
    if (onPositionUpdate) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(pos);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [onPositionUpdate]);

  // Centrer la carte sur la route
  useEffect(() => {
    if (map && destination && (livreurPosition || currentPosition)) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(destination);
      if (livreurPosition) {
        bounds.extend({ lat: livreurPosition.lat, lng: livreurPosition.lng });
      }
      if (currentPosition) {
        bounds.extend(currentPosition);
      }
      map.fitBounds(bounds);
    }
  }, [map, destination, livreurPosition, currentPosition]);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const handleMarkerClick = (markerId: string) => {
    setSelectedMarker(markerId);
  };

  const handleUpdatePosition = () => {
    if (navigator.geolocation && onPositionUpdate) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onPositionUpdate(
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

  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Clé Google Maps non configurée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={handleMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {/* Marqueur de destination */}
        {destination && (
          <Marker
            position={destination}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
            onClick={() => handleMarkerClick('destination')}
          />
        )}

        {/* Marqueur du livreur */}
        {livreurPosition && (
          <Marker
            position={{ lat: livreurPosition.lat, lng: livreurPosition.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }}
            onClick={() => handleMarkerClick('livreur')}
          />
        )}

        {/* Marqueur de position actuelle */}
        {currentPosition && onPositionUpdate && (
          <Marker
            position={currentPosition}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
            onClick={() => handleMarkerClick('current')}
          />
        )}

        {/* Ligne de route */}
        {showRoute && destination && (livreurPosition || currentPosition) && (
          <Polyline
            path={[
              livreurPosition || currentPosition || defaultCenter,
              destination
            ]}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 3,
            }}
          />
        )}

        {/* Fenêtres d'information */}
        {selectedMarker === 'destination' && destination && (
          <InfoWindow
            position={destination}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-red-500 mr-2" />
                <span className="font-bold">Adresse de livraison</span>
              </div>
              <p className="text-sm text-gray-700">{livraison?.delivery_address}</p>
              {livraison?.estimated_delivery_time && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Estimation: {new Date(livraison.estimated_delivery_time).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </InfoWindow>
        )}

        {selectedMarker === 'livreur' && livreurPosition && (
          <InfoWindow
            position={{ lat: livreurPosition.lat, lng: livreurPosition.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <div className="flex items-center mb-2">
                <Navigation className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-bold">Position du livreur</span>
              </div>
              <p className="text-sm text-gray-700">
                Mise à jour: {new Date(livreurPosition.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Bouton de mise à jour de position */}
      {onPositionUpdate && (
        <button
          onClick={handleUpdatePosition}
          className="absolute top-4 right-4 px-4 py-2 bg-white rounded-lg shadow-md flex items-center space-x-2 hover:bg-gray-50"
        >
          <Navigation className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Mettre à jour ma position</span>
        </button>
      )}

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm">Destination</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Livreur</span>
          </div>
          {onPositionUpdate && (
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm">Ma position</span>
            </div>
          )}
          <div className="flex items-center">
            <div className="h-1 w-6 bg-blue-500 mr-2"></div>
            <span className="text-sm">Itinéraire</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivraisonMap;