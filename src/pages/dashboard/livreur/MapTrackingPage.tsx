import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import {
  Navigation, Target, Clock, MapPin, Truck,
  Package, Phone, User, Navigation2
} from 'lucide-react';
import { livraisonService } from '../../../services/api/livraison.service';
import { toast } from 'react-hot-toast';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 6.1375,
  lng: 1.2123
};

const MapTrackingPage: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeLivraison, setActiveLivraison] = useState<any>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Récupérer les livraisons en cours
  const { data: livraisons } = useQuery({
    queryKey: ['livraisons-en-cours'],
    queryFn: () => livraisonService.getAll({ status: 'en_cours' }),
  });

  // Obtenir la position de l'utilisateur
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
          toast.error('Impossible d\'obtenir votre position');
        }
      );
    }
  }, []);

  // Calculer l'itinéraire
  const calculateRoute = () => {
    if (!activeLivraison || !userLocation) return;

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination: new google.maps.LatLng(
          activeLivraison.delivery_lat || defaultCenter.lat,
          activeLivraison.delivery_lng || defaultCenter.lng
        ),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          toast.error('Impossible de calculer l\'itinéraire');
        }
      }
    );
  };

  // Mettre à jour la position du livreur
  const updatePosition = () => {
    if (!userLocation || !activeLivraison) return;

    toast.promise(
      livraisonService.updatePosition(activeLivraison.id, {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      }),
      {
        loading: 'Mise à jour de la position...',
        success: 'Position mise à jour',
        error: 'Erreur lors de la mise à jour',
      }
    );
  };

  // Effet pour calculer l'itinéraire quand la livraison active ou la position change
  useEffect(() => {
    if (activeLivraison && userLocation && isLoaded) {
      calculateRoute();
    }
  }, [activeLivraison, userLocation, isLoaded]);

  // Sélectionner la première livraison en cours par défaut
  useEffect(() => {
    if (livraisons && livraisons.length > 0 && !activeLivraison) {
      setActiveLivraison(livraisons[0]);
    }
  }, [livraisons, activeLivraison]);

  if (loadError) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <Navigation className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">Erreur de chargement de la carte</h3>
          <p className="text-red-600">
            Impossible de charger Google Maps. Vérifiez votre connexion internet et votre clé API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des Livraisons</h1>
        <p className="text-gray-600">Suivez vos livraisons en temps réel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-bold">Carte de suivi</h3>
              </div>
              <button
                onClick={updatePosition}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
              >
                <Target className="h-4 w-4 mr-2" />
                Mettre à jour ma position
              </button>
            </div>
            
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation || defaultCenter}
                zoom={14}
                onLoad={setMap}
              >
                {/* Marqueur de l'utilisateur */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#3B82F6',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    title="Votre position"
                  />
                )}

                {/* Marqueur de destination */}
                {activeLivraison && (
                  <Marker
                    position={{
                      lat: activeLivraison.delivery_lat || defaultCenter.lat,
                      lng: activeLivraison.delivery_lng || defaultCenter.lng,
                    }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#EF4444',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    title="Destination de livraison"
                  />
                )}

                {/* Itinéraire */}
                {directions && (
                  <DirectionsRenderer directions={directions} />
                )}
              </GoogleMap>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement de la carte...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liste des livraisons */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Livraisons en cours
            </h3>
            
            <div className="space-y-4">
              {livraisons?.map((livraison) => (
                <div
                  key={livraison.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    activeLivraison?.id === livraison.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setActiveLivraison(livraison)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">#{livraison.tracking_number}</p>
                      <p className="text-sm text-gray-600">
                        {livraison.commande?.user?.name}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      En cours
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{livraison.delivery_address}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Package className="h-4 w-4 mr-1" />
                    <span>{livraison.commande?.items?.length || 0} articles</span>
                  </div>
                </div>
              ))}
              
              {(!livraisons || livraisons.length === 0) && (
                <div className="text-center py-6 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune livraison en cours</p>
                </div>
              )}
            </div>
          </div>

          {/* Détails de la livraison active */}
          {activeLivraison && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Détails de la livraison
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Client</h4>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{activeLivraison.commande?.user?.name}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{activeLivraison.commande?.delivery_phone || activeLivraison.commande?.user?.phone}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Adresse</h4>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{activeLivraison.delivery_address}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Heure estimée</h4>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {activeLivraison.estimated_delivery_time
                        ? new Date(activeLivraison.estimated_delivery_time).toLocaleTimeString()
                        : 'Non spécifiée'}
                    </span>
                  </div>
                </div>
                
                {directions?.routes[0]?.legs[0] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Distance et durée</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Distance:</span>{' '}
                        {directions.routes[0].legs[0].distance?.text}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Durée:</span>{' '}
                        {directions.routes[0].legs[0].duration?.text}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center">
                    <Navigation2 className="h-5 w-5 mr-2" />
                    Marquer comme livré
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapTrackingPage;