// src/pages/public/PharmaciesPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PharmacyList from '../../components/pharmacies/PharmacyList';
import { Filter, MapPin, Search } from 'lucide-react';

const PharmaciesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    garde: searchParams.get('garde') === 'true',
    search: searchParams.get('search') || '',
    latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
    longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
    radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
  });

  useEffect(() => {
    // Mettre à jour les paramètres d'URL quand les filtres changent
    const params: any = {};
    if (filters.garde) params.garde = 'true';
    if (filters.search) params.search = filters.search;
    if (filters.latitude) params.latitude = filters.latitude.toString();
    if (filters.longitude) params.longitude = filters.longitude.toString();
    if (filters.radius) params.radius = filters.radius.toString();
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: 5, // 5km par défaut
          }));
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position. Veuillez vérifier les permissions.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pharmacies au Togo
          </h1>
          <p className="text-gray-600">
            Trouvez la pharmacie la plus proche de vous, disponible 24h/24
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche par nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Rechercher une pharmacie
              </label>
              <input
                type="text"
                placeholder="Nom de la pharmacie..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Filtre de garde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Statut
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setFilters({ ...filters, garde: !filters.garde })}
                  className={`px-4 py-2 rounded-lg font-medium ${filters.garde ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {filters.garde ? '🚨 De garde' : 'Toutes'}
                </button>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Localisation
              </label>
              <button
                onClick={handleLocationClick}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Trouver près de moi
              </button>
            </div>
          </div>

          {/* Indicateurs de filtre */}
          {(filters.garde || filters.search || filters.latitude) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.garde && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                    De garde
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Recherche: {filters.search}
                  </span>
                )}
                {filters.latitude && filters.longitude && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Proche de ma position
                  </span>
                )}
                <button
                  onClick={() => setFilters({ garde: false, search: '', latitude: undefined, longitude: undefined, radius: undefined })}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Effacer tous les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des pharmacies */}
        <PharmacyList />
      </div>
    </div>
  );
};

export default PharmaciesPage;