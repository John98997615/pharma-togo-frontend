// src/components/medicaments/MedicamentList.tsx
import React, { useState } from 'react';
import { Medicament } from '../../types/medicament.types';
import MedicamentCard from './MedicamentCard';
import { Filter, Search, Package, Grid, List } from 'lucide-react';

interface MedicamentListProps {
  medicaments: Medicament[];
  loading: boolean;
  error?: string;
  showActions?: boolean;
  onAddToCart?: (medicament: Medicament) => void;
  onEdit?: (medicament: Medicament) => void;
  onDelete?: (id: number) => void;
  onStockAdjust?: (id: number, adjustment: number) => void;
  onFilterChange?: (filters: any) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const MedicamentList: React.FC<MedicamentListProps> = ({
  medicaments,
  loading,
  error,
  showActions,
  onAddToCart,
  onEdit,
  onDelete,
  onStockAdjust,
  onFilterChange,
  pagination,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extraire les catégories uniques
  const categories = React.useMemo(() => {
    const uniqueCategories: { id: number; name: string }[] = [];
    medicaments.forEach(medicament => {
      if (medicament.category && !uniqueCategories.find(c => c.id === medicament.category!.id)) {
        uniqueCategories.push({
          id: medicament.category.id,
          name: medicament.category.name
        });
      }
    });
    return uniqueCategories;
  }, [medicaments]);

  // Filtrer les médicaments
  const filteredMedicaments = React.useMemo(() => {
    let filtered = [...medicaments];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(medicament =>
        medicament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicament.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(medicament =>
        medicament.category && medicament.category.id === parseInt(categoryFilter)
      );
    }

    // Filtre par stock
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'in_stock':
          filtered = filtered.filter(m => m.quantity > 0);
          break;
        case 'low_stock':
          filtered = filtered.filter(m => m.quantity > 0 && m.quantity < 10);
          break;
        case 'out_of_stock':
          filtered = filtered.filter(m => m.quantity === 0);
          break;
        case 'requires_prescription':
          filtered = filtered.filter(m => m.requires_prescription);
          break;
      }
    }

    return filtered;
  }, [medicaments, searchTerm, categoryFilter, stockFilter]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des médicaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-700">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (medicaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun médicament</h3>
        <p className="text-gray-600">Aucun médicament trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et contrôles */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Toutes catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tout le stock</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
                <option value="requires_prescription">Ordonnance requise</option>
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compteur de résultats */}
      <div className="text-sm text-gray-600">
        {filteredMedicaments.length} médicament{filteredMedicaments.length !== 1 ? 's' : ''} trouvé{filteredMedicaments.length !== 1 ? 's' : ''}
        {searchTerm && ` pour "${searchTerm}"`}
      </div>

      {/* Liste des médicaments */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicaments.map((medicament) => (
            <MedicamentCard
              key={medicament.id}
              medicament={medicament}
              showActions={showActions}
              onAddToCart={onAddToCart}
              onEdit={onEdit}
              onDelete={onDelete}
              onStockAdjust={onStockAdjust}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedicaments.map((medicament) => (
            <div key={medicament.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Image */}
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                  {medicament.image ? (
                    <img
                      src={medicament.image}
                      alt={medicament.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{medicament.name}</h3>
                      {medicament.pharmacy && (
                        <p className="text-sm text-gray-600">{medicament.pharmacy.name}</p>
                      )}
                    </div>
                    <p className="text-xl font-bold">{medicament.price.toLocaleString()} FCFA</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    {medicament.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {medicament.category.name}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      medicament.quantity === 0 ? 'bg-red-100 text-red-800' :
                      medicament.quantity < 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Stock: {medicament.quantity}
                    </span>
                    {medicament.requires_prescription && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Ordonnance requise
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  {!showActions && onAddToCart && medicament.quantity > 0 && (
                    <button
                      onClick={() => onAddToCart(medicament)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Ajouter
                    </button>
                  )}
                  {showActions && onEdit && (
                    <button
                      onClick={() => onEdit(medicament)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => pagination.onPageChange(page)}
                className={`px-3 py-1 rounded-lg ${
                  page === pagination.currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicamentList;