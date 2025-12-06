import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Navigation, MapPin, Clock, Package, Truck, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { livraisonService } from '../../../services/api/livraison.service';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 6.1375, // Lomé, Togo
  lng: 1.2123,
};

const MapTrackingPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLivraison, setSelectedLivraison] = useState<any>(null);
  const [directions, setDirections] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  // Récupérer les livraisons en cours
  const { data: livraisons } = useQuery({
    queryKey: ['livraisons-map'],
    queryFn: () => livraisonService.getAll({ status: 'en_cours' }),
  });

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  }, []);

  // Calculer l'itinéraire
  const calculateRoute = (destination: { lat: number; lng: number }) => {
    if (!userLocation || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        }
      }
    );
  };

  const getMarkerIcon = (status: string) => {
    const icons = {
      'en_attente': '🟡',
      'en_cours': '🔵',
      'livree': '🟢',
      'annulee': '🔴',
    };
    return icons[status as keyof typeof icons] || '⚫';
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Carte de Suivi des Livraisons</h1>
        <p className="text-gray-600">Visualisez et gérez vos livraisons en temps réel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Position actuelle</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Livraison en cours</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Point de livraison</span>
                </div>
              </div>
              
              <button
                onClick={() => userLocation && map?.panTo(userLocation)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Centrer sur moi
              </button>
            </div>

            <div className="relative">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={13}
                center={userLocation || defaultCenter}
                onLoad={(map) => setMap(map)}
                options={{
                  zoomControl: true,
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: true,
                }}
              >
                {/* Marqueur position utilisateur */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23007bff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                    title="Votre position"
                  />
                )}

                {/* Marqueurs des livraisons */}
                {livraisons?.data?.map((livraison: any) => (
                  <Marker
                    key={livraison.id}
                    position={{
                      lat: livraison.delivery_lat || 6.1375,
                      lng: livraison.delivery_lng || 1.2123,
                    }}
                    icon={{
                      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${livraison.status === 'en_cours' ? '%2328a745' : '%23dc3545'}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                    onClick={() => {
                      setSelectedLivraison(livraison);
                      calculateRoute({
                        lat: livraison.delivery_lat || 6.1375,
                        lng: livraison.delivery_lng || 1.2123,
                      });
                    }}
                    title={`Livraison ${livraison.tracking_number}`}
                  />
                ))}

                {/* Itinéraire */}
                {directions && <DirectionsRenderer directions={directions} />}

                {/* InfoWindow pour la livraison sélectionnée */}
                {selectedLivraison && (
                  <InfoWindow
                    position={{
                      lat: selectedLivraison.delivery_lat || 6.1375,
                      lng: selectedLivraison.delivery_lng || 1.2123,
                    }}
                    onCloseClick={() => setSelectedLivraison(null)}
                  >
                    <div className="p-4 max-w-xs">
                      <div className="flex items-center mb-3">
                        <Package className="h-6 w-6 text-blue-500 mr-2" />
                        <h3 className="font-bold text-lg">Livraison {selectedLivraison.tracking_number}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedLivraison.delivery_address}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Commande: {selectedLivraison.commande?.numero_commande}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Statut: {selectedLivraison.status}</span>
                        </div>
                        
                        {directions?.routes[0]?.legs[0] && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span>Distance:</span>
                              <span className="font-medium">
                                {formatDistance(directions.routes[0].legs[0].distance.value)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Durée estimée:</span>
                              <span className="font-medium">
                                {formatDuration(directions.routes[0].legs[0].duration.value)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            // Logique pour démarrer la livraison
                            setSelectedLivraison(null);
                          }}
                          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Démarrer cette livraison
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          </div>
        </div>

        {/* Liste des livraisons */}
        <div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              Livraisons à proximité
            </h3>
            
            <div className="space-y-4">
              {livraisons?.data?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune livraison en cours</p>
                </div>
              ) : (
                livraisons?.data?.map((livraison: any) => (
                  <div
                    key={livraison.id}
                    className={`p-4 rounded-lg border cursor-pointer hover:border-blue-500 transition-colors ${
                      selectedLivraison?.id === livraison.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedLivraison(livraison)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          livraison.status === 'en_cours' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="font-medium">{livraison.tracking_number}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        livraison.status === 'en_cours'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {livraison.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {livraison.delivery_address}
                    </p>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{livraison.commande?.numero_commande}</span>
                      <span>{livraison.commande?.total_amount?.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-xl shadow p-6">
            <h4 className="font-bold text-blue-800 mb-3">Instructions</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  1
                </div>
                <span>Sélectionnez une livraison sur la carte ou dans la liste</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  2
                </div>
                <span>L'itinéraire optimal sera calculé automatiquement</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  3
                </div>
                <span>Cliquez sur "Démarrer cette livraison" pour commencer</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  4
                </div>
                <span>Suivez les instructions de navigation en temps réel</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTrackingPage;