// src/pages/public/SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, MapPin, Building2, Package,
  Star, Clock, Navigation, ShoppingCart, Heart,
  Phone
} from 'lucide-react';
import { medicamentService } from '../../services/api/medicament.service';
import { pharmacyService } from '../../services/api/pharmacy.service';
import { categoryService } from '../../services/api/category.service';
import { Medicament } from '../../types/medicament.types';
import { Pharmacy } from '../../types/pharmacy.types';
import { Category } from '../../types/category.types';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  garde: boolean;
  openNow: boolean;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'medicaments' | 'pharmacies'>('medicaments');
  
  const initialFilters: SearchFilters = {
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    garde: searchParams.get('garde') === 'true',
    openNow: searchParams.get('openNow') === 'true',
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Récupérer les résultats de recherche pour les médicaments
  const { 
    data: medicamentsResponse, 
    isLoading: medicamentsLoading 
  } = useQuery({
    queryKey: ['search-medicaments', filters.query, filters.category, filters.minPrice, filters.maxPrice],
    queryFn: () => {
      const params: any = {};
      if (filters.query) params.search = filters.query;
      if (filters.category) params.category_id = parseInt(filters.category);
      if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
      
      return medicamentService.getAll(params);
    },
    enabled: searchType === 'medicaments',
  });

  // Récupérer les résultats de recherche pour les pharmacies
  const { 
    data: pharmaciesResponse, 
    isLoading: pharmaciesLoading 
  } = useQuery({
    queryKey: ['search-pharmacies', filters.query, filters.garde, filters.openNow],
    queryFn: () => {
      const params: any = {};
      if (filters.query) params.search = filters.query;
      if (filters.garde) params.garde = true;
      if (filters.openNow) params.open_now = true;
      
      return pharmacyService.getAll(params);
    },
    enabled: searchType === 'pharmacies',
  });

  // Récupérer les catégories
  const { 
    data: categoriesResponse, 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Extraire les données des réponses de manière sécurisée
  const medicaments: Medicament[] = (() => {
    if (!medicamentsResponse) return [];
    
    // Si la réponse a une propriété 'data', utilisez-la
    if (Array.isArray(medicamentsResponse)) {
      return medicamentsResponse;
    }
    
    if (medicamentsResponse && typeof medicamentsResponse === 'object' && 'data' in medicamentsResponse) {
      const response = medicamentsResponse as { data?: Medicament[] | any };
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  })();

  const pharmacies: Pharmacy[] = (() => {
    if (!pharmaciesResponse) return [];
    
    if (Array.isArray(pharmaciesResponse)) {
      return pharmaciesResponse;
    }
    
    if (pharmaciesResponse && typeof pharmaciesResponse === 'object' && 'data' in pharmaciesResponse) {
      const response = pharmaciesResponse as { data?: Pharmacy[] | any };
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  })();

  // Gestion sécurisée des catégories
  const categories: Category[] = (() => {
    if (categoriesLoading) return [];
    if (!categoriesResponse) return [];
    
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    
    if (categoriesResponse && typeof categoriesResponse === 'object') {
      // Essayez différentes structures de réponse
      if ('data' in categoriesResponse && Array.isArray(categoriesResponse.data)) {
        return categoriesResponse.data;
      }
      
      // Si c'est un objet avec des propriétés qui ressemblent à un tableau
      const values = Object.values(categoriesResponse);
      if (values.length > 0 && Array.isArray(values[0])) {
        return values[0];
      }
    }
    
    return [];
  })();

  // Mettre à jour les paramètres d'URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query.trim()) params.set('q', filters.query.trim());
    if (filters.category.trim()) params.set('category', filters.category.trim());
    if (filters.location.trim()) params.set('location', filters.location.trim());
    if (filters.minPrice.trim()) params.set('minPrice', filters.minPrice.trim());
    if (filters.maxPrice.trim()) params.set('maxPrice', filters.maxPrice.trim());
    if (filters.garde) params.set('garde', 'true');
    if (filters.openNow) params.set('openNow', 'true');
    
    // Ne mettre à jour que si les paramètres ont changé
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [filters, searchParams, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche se déclenche automatiquement via les query params
  };

  const handleAddToCart = (medicament: Medicament) => {
    // TODO: Implémenter l'ajout au panier
    console.log('Ajouter au panier:', medicament);
    // Exemple: addToCart(medicament);
  };

  const handleGetDirections = (pharmacy: Pharmacy) => {
    if (pharmacy.latitude && pharmacy.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('Adresse GPS non disponible pour cette pharmacie');
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Fonction pour vérifier si une pharmacie est ouverte maintenant
  const isPharmacyOpenNow = (pharmacy: Pharmacy): boolean => {
    if (!pharmacy.is_active || !pharmacy.opening_time || !pharmacy.closing_time) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    try {
      const [openingHours, openingMinutes] = pharmacy.opening_time.split(':').map(Number);
      const [closingHours, closingMinutes] = pharmacy.closing_time.split(':').map(Number);

      const openingTime = openingHours * 60 + openingMinutes;
      const closingTime = closingHours * 60 + closingMinutes;

      return currentTime >= openingTime && currentTime <= closingTime;
    } catch (error) {
      console.error('Erreur de parsing des horaires:', error);
      return false;
    }
  };

  // Filtrer les pharmacies ouvertes maintenant si le filtre est activé
  const filteredPharmacies = filters.openNow
    ? pharmacies.filter(isPharmacyOpenNow)
    : pharmacies;

  const isLoading = searchType === 'medicaments' ? medicamentsLoading : pharmaciesLoading;
  const resultsCount = searchType === 'medicaments' 
    ? medicaments.length 
    : filteredPharmacies.length;

  // Fonction pour afficher les options de catégorie
  const renderCategoryOptions = () => {
    if (categoriesLoading) {
      return <option value="">Chargement des catégories...</option>;
    }

    if (categories.length === 0) {
      return <option value="">Aucune catégorie disponible</option>;
    }

    return (
      <>
        <option value="">Toutes catégories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id.toString()}>
            {category.name}
          </option>
        ))}
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Barre de recherche principale */}
      <div className="mb-8">
        <form onSubmit={handleSearch}>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Type de recherche */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSearchType('medicaments')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchType === 'medicaments'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Médicaments
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('pharmacies')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchType === 'pharmacies'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Pharmacies
                </button>
              </div>

              {/* Recherche textuelle */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      searchType === 'medicaments'
                        ? "Rechercher un médicament..."
                        : "Rechercher une pharmacie..."
                    }
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  />
                </div>
              </div>

              {/* Bouton de recherche */}
              <div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Filtres avancés */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              {searchType === 'medicaments' ? (
                <>
                  <div>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      disabled={categoriesLoading}
                    >
                      {renderCategoryOptions()}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Prix min (FCFA)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      min="0"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Prix max (FCFA)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      min={filters.minPrice || "0"}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Localisation..."
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.garde}
                        onChange={(e) => setFilters({ ...filters, garde: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${filters.garde ? 'bg-red-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.garde ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-700">Pharmacies de garde</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.openNow}
                        onChange={(e) => setFilters({ ...filters, openNow: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${filters.openNow ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.openNow ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-700">Ouvertes maintenant</span>
                    </label>
                  </div>
                </>
              )}

              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Résultats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {resultsCount} résultat{resultsCount !== 1 ? 's' : ''} trouvé{resultsCount !== 1 ? 's' : ''}
          </h2>
          {filters.query && (
            <div className="text-sm text-gray-500">
              Recherche : "<span className="font-medium">{filters.query}</span>"
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
          </div>
        ) : resultsCount === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche ou de filtres
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : searchType === 'medicaments' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicaments.map((medicament) => (
              <div 
                key={medicament.id} 
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{medicament.name}</h3>
                      <p className="text-sm text-gray-500">
                        {medicament.pharmacy?.name || 'Pharmacie inconnue'}
                      </p>
                    </div>
                    {medicament.requires_prescription && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        Ordonnance
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {medicament.description || 'Pas de description disponible'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{medicament.form || 'Forme non spécifiée'}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xl font-bold text-green-600">
                      {medicament.price?.toLocaleString('fr-FR') || '0'} FCFA
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      medicament.quantity > 10 
                        ? 'bg-green-100 text-green-800' 
                        : medicament.quantity > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {medicament.quantity > 0 ? 'En stock' : 'Rupture'}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAddToCart(medicament)}
                      disabled={medicament.quantity === 0}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                        medicament.quantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ajouter
                    </button>
                    <button 
                      className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPharmacies.map((pharmacy) => (
              <div 
                key={pharmacy.id} 
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                    {pharmacy.logo ? (
                      <img
                        src={pharmacy.logo}
                        alt={pharmacy.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-48 bg-blue-100 rounded-lg flex items-center justify-center ${pharmacy.logo ? 'hidden' : ''}`}>
                      <Building2 className="h-20 w-20 text-blue-600" />
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="md:w-3/4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pharmacy.name}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{pharmacy.address}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{pharmacy.phone}</span>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0">
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">4.5 (128 avis)</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {pharmacy.is_garde && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                              Pharmacie de garde
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            pharmacy.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pharmacy.is_active ? 'Ouverte' : 'Fermée'}
                          </span>
                          {isPharmacyOpenNow(pharmacy) && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Ouverte maintenant
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Horaires et services */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Horaires</p>
                          <p className="font-medium text-gray-900">
                            {pharmacy.opening_time} - {pharmacy.closing_time}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Services</p>
                        <p className="font-medium text-gray-900">Livraison disponible</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Médicaments</p>
                        <p className="font-medium text-gray-900">
                          {pharmacy.medicaments?.length || 0} produits
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Voir la pharmacie
                      </button>
                      <button
                        onClick={() => handleGetDirections(pharmacy)}
                        disabled={!pharmacy.latitude || !pharmacy.longitude}
                        className={`px-4 py-2 border rounded-lg flex items-center transition-colors ${
                          pharmacy.latitude && pharmacy.longitude
                            ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                            : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Itinéraire
                      </button>
                      <button 
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;