import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Package, TrendingUp, Star,
  ShoppingCart, Heart, Eye, Grid, List
} from 'lucide-react';
import { medicamentService } from '../../services/api/medicament.service';
import { categoryService } from '../../services/api/category.service';
import { Medicament } from '../../types/medicament.types';

const MedicamentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'popular',
  });

  // Récupérer les médicaments
  const { data: medicaments, isLoading } = useQuery({
    queryKey: ['medicaments-search', filters],
    queryFn: () => medicamentService.getAll({
      search: filters.search || undefined,
      category_id: filters.category ? parseInt(filters.category) : undefined,
      available: true,
    }),
  });

  // Récupérer les catégories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Mettre à jour les filtres et l'URL
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    if (updated.search) params.set('search', updated.search);
    if (updated.category) params.set('category', updated.category);
    if (updated.minPrice) params.set('minPrice', updated.minPrice);
    if (updated.maxPrice) params.set('maxPrice', updated.maxPrice);
    if (updated.sortBy !== 'popular') params.set('sortBy', updated.sortBy);
    setSearchParams(params);
  };

  // Trier les médicaments
  const sortedMedicaments = React.useMemo(() => {
    if (!medicaments) return [];
    
    const sorted = [...(medicaments?.data || [])];
    switch (filters.sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted; // Par défaut, les plus populaires
    }
  }, [medicaments, filters.sortBy]);

  // Filtrer par prix
  const filteredMedicaments = sortedMedicaments.filter(medicament => {
    if (filters.minPrice && medicament.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && medicament.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    return true;
  });

  const handleAddToCart = (medicament: Medicament) => {
    // TODO: Implémenter l'ajout au panier
    console.log('Ajouter au panier:', medicament);
  };

  const handleAddToWishlist = (medicament: Medicament) => {
    // TODO: Implémenter l'ajout à la liste de souhaits
    console.log('Ajouter à la liste de souhaits:', medicament);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos Médicaments</h1>
        <p className="text-gray-600">
          Trouvez les médicaments dont vous avez besoin parmi notre large sélection
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
            >
              <option value="">Toutes les catégories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-3 border border-gray-300 rounded-lg"
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
            >
              <option value="popular">Les plus populaires</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name_asc">Nom A-Z</option>
              <option value="name_desc">Nom Z-A</option>
            </select>
          </div>
        </div>

        {/* Filtres de prix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix minimum (FCFA)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix maximum (FCFA)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="100000"
              value={filters.maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            />
          </div>
          
          <div className="flex items-end space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {filteredMedicaments.length} médicament(s) trouvé(s)
          </h2>
          <div className="text-sm text-gray-500">
            {filters.search && `Recherche: "${filters.search}"`}
            {filters.category && categories?.find(c => c.id === parseInt(filters.category))?.name && 
              ` • Catégorie: ${categories.find(c => c.id === parseInt(filters.category))?.name}`
            }
          </div>
        </div>

        {/* Liste des médicaments */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedicaments.map((medicament) => (
              <div key={medicament.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                <div className="relative">
                  {medicament.image ? (
                    <img
                      src={medicament.image}
                      alt={medicament.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-blue-100 rounded-t-xl flex items-center justify-center">
                      <Package className="h-20 w-20 text-blue-600" />
                    </div>
                  )}
                  
                  {medicament.requires_prescription && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Ordonnance
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleAddToWishlist(medicament)}
                    className="absolute top-2 left-2 p-2 bg-white rounded-full hover:bg-gray-100"
                  >
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate">{medicament.name}</h3>
                    <span className="text-sm text-gray-500">{medicament.form}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {medicament.description || 'Pas de description'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">4.5</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {medicament.pharmacy?.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      {medicament.price.toLocaleString()} FCFA
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      medicament.quantity > 10 ? 'bg-green-100 text-green-800' :
                      medicament.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {medicament.quantity > 0 ? `Stock: ${medicament.quantity}` : 'Rupture'}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(medicament)}
                      disabled={medicament.quantity === 0}
                      className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center ${
                        medicament.quantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ajouter
                    </button>
                    <button className="p-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMedicaments.map((medicament) => (
              <div key={medicament.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex">
                  <div className="w-32 h-32 mr-6">
                    {medicament.image ? (
                      <img
                        src={medicament.image}
                        alt={medicament.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-16 w-16 text-blue-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{medicament.name}</h3>
                        <p className="text-gray-600">{medicament.pharmacy?.name}</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {medicament.price.toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{medicament.description}</p>
                    
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{medicament.form} • {medicament.dosage}</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${
                          medicament.quantity > 10 ? 'text-green-600' :
                          medicament.quantity > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {medicament.quantity > 0 ? `${medicament.quantity} en stock` : 'Rupture de stock'}
                        </span>
                      </div>
                      {medicament.requires_prescription && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Ordonnance requise
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>4.5 (124 avis)</span>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAddToWishlist(medicament)}
                          className="p-2 text-gray-600 hover:text-red-600"
                        >
                          <Heart className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(medicament)}
                          disabled={medicament.quantity === 0}
                          className={`px-6 py-2 rounded-lg font-medium ${
                            medicament.quantity === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <ShoppingCart className="inline h-4 w-4 mr-2" />
                          Ajouter au panier
                        </button>
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMedicaments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun médicament trouvé</h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche ou de filtres
            </p>
            <button
              onClick={() => updateFilters({
                search: '',
                category: '',
                minPrice: '',
                maxPrice: '',
              })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicamentsPage;