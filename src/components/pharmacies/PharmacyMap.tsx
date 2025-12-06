// src/components/pharmacies/PharmacyMap.tsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Phone, Star } from 'lucide-react';
import { Pharmacy } from '../../types/pharmacy.types';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 6.1725,
  lng: 1.2314
};

const defaultZoom = 12;

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacy?: Pharmacy | null;
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
  userLocation?: { lat: number; lng: number };
  showOnlyGarde?: boolean;
}

const PharmacyMap: React.FC<PharmacyMapProps> = ({
  pharmacies,
  selectedPharmacy,
  onPharmacySelect,
  userLocation,
  showOnlyGarde = false,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Pharmacy | null>(null);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);

  // Filtrer les pharmacies
  useEffect(() => {
    if (showOnlyGarde) {
      setFilteredPharmacies(pharmacies.filter(p => p.is_garde));
    } else {
      setFilteredPharmacies(pharmacies);
    }
  }, [pharmacies, showOnlyGarde]);

  // Centrer la carte sur la pharmacie sélectionnée ou toutes les pharmacies
  useEffect(() => {
    if (map) {
      if (selectedPharmacy) {
        map.setCenter({
          lat: selectedPharmacy.latitude,
          lng: selectedPharmacy.longitude
        });
        map.setZoom(15);
      } else if (filteredPharmacies.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        filteredPharmacies.forEach(pharmacy => {
          bounds.extend({
            lat: pharmacy.latitude,
            lng: pharmacy.longitude
          });
        });
        if (userLocation) {
          bounds.extend(userLocation);
        }
        map.fitBounds(bounds);
      }
    }
  }, [map, selectedPharmacy, filteredPharmacies, userLocation]);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const handleMarkerClick = (pharmacy: Pharmacy) => {
    setSelectedMarker(pharmacy);
    if (onPharmacySelect) {
      onPharmacySelect(pharmacy);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const handleGetDirections = (pharmacy: Pharmacy) => {
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

  const getMarkerIcon = (pharmacy: Pharmacy) => {
    if (pharmacy.is_garde) {
      return {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      };
    }
    return {
      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new window.google.maps.Size(28, 28)
    };
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
        {/* Marqueurs des pharmacies */}
        {filteredPharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            position={{
              lat: pharmacy.latitude,
              lng: pharmacy.longitude
            }}
            icon={getMarkerIcon(pharmacy)}
            onClick={() => handleMarkerClick(pharmacy)}
          />
        ))}

        {/* Marqueur de l'utilisateur */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )}

        {/* Fenêtre d'information */}
        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.latitude,
              lng: selectedMarker.longitude
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-xs">
              <div className="mb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {selectedMarker.is_garde && (
                      <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                    )}
                    <h3 className="font-bold text-gray-900">{selectedMarker.name}</h3>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs ml-1">4.8</span>
                  </div>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{selectedMarker.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{selectedMarker.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>
                      {selectedMarker.opening_time.slice(0, 5)} - {selectedMarker.closing_time.slice(0, 5)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleGetDirections(selectedMarker)}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center justify-center"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Itinéraire
                </button>
                <a
                  href={`/pharmacies/${selectedMarker.id}`}
                  className="flex-1 px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 text-center"
                >
                  Voir détails
                </a>
              </div>
              
              {selectedMarker.is_garde && (
                <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded text-center">
                  🚨 PHARMACIE DE GARDE
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm">Pharmacie normale</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm">Pharmacie de garde</span>
          </div>
          {userLocation && (
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Ma position</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {filteredPharmacies.length} pharmacie{filteredPharmacies.length !== 1 ? 's' : ''}
          </div>
          {showOnlyGarde && (
            <div className="text-xs text-red-600 font-medium">
              🚨 De garde seulement
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyMap;