// src/components/medicaments/MedicamentSearch.tsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Medicament } from '../../types/medicament.types';
import { Category } from '../../types/category.types';
import { medicamentService } from '../../services/api/medicament.service';
import { categoryService } from '../../services/api/category.service';

interface MedicamentSearchProps {
  onSearchResults: (medicaments: Medicament[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  initialSearch?: string;
}

const MedicamentSearch: React.FC<MedicamentSearchProps> = ({
  onSearchResults,
  onLoadingChange,
  initialSearch = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [requiresPrescription, setRequiresPrescription] = useState<boolean | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [useLocation, setUseLocation] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = async () => {
    if (onLoadingChange) onLoadingChange(true);

    try {
      const params: any = {
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        available: inStockOnly || undefined,
        requires_prescription: requiresPrescription || undefined,
      };

      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      if (useLocation && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        params.latitude = position.coords.latitude;
        params.longitude = position.coords.longitude;
        params.radius = 10; // 10km
      }

      const response = await medicamentService.getAll(params);
      onSearchResults(response.data || []);

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      onSearchResults([]);
    } finally {
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setRequiresPrescription(null);
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setUseLocation(false);
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Champ de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3">
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
            
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {filtersVisible && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordonnance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordonnance
                </label>
                <select
                  value={requiresPrescription === null ? '' : requiresPrescription.toString()}
                  onChange={(e) => setRequiresPrescription(
                    e.target.value === '' ? null : e.target.value === 'true'
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="true">Ordonnance requise</option>
                  <option value="false">Sans ordonnance</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix min (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix max (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Options supplémentaires */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">En stock seulement</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useLocation}
                      onChange={(e) => setUseLocation(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Près de moi
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions des filtres */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser les filtres
              </button>
              
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tags de filtres actifs */}
      {(searchTerm || selectedCategory || requiresPrescription !== null || inStockOnly || minPrice || maxPrice || useLocation) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Recherche: {searchTerm}
            </span>
          )}
          
          {selectedCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Catégorie: {categories.find(c => c.id === selectedCategory)?.name}
            </span>
          )}
          
          {requiresPrescription !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
              {requiresPrescription ? 'Ordonnance requise' : 'Sans ordonnance'}
            </span>
          )}
          
          {inStockOnly && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              En stock seulement
            </span>
          )}
          
          {minPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              Prix min: {parseInt(minPrice).toLocaleString()} FCFA
            </span>
          )}
          
          {maxPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              Prix max: {parseInt(maxPrice).toLocaleString()} FCFA
            </span>
          )}
          
          {useLocation && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              <MapPin className="h-3 w-3 mr-1" />
              Près de moi
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicamentSearch;