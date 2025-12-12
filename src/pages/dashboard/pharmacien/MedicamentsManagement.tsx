import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Search, Filter, Plus, Package, AlertTriangle,
  Edit, Trash2, Eye, TrendingUp, BarChart3
} from 'lucide-react';
import { medicamentService } from '../../../services/api/medicament.service';
import { useAuth } from '../../../context/AuthContext';
import { Medicament } from '../../../types/medicament.types';

const MedicamentsManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    availability: 'all'
  });
  const [showForm, setShowForm] = useState(false); // AJOUTEZ CETTE LIGNE

  // Récupérer les médicaments de la pharmacie
  const { data: medicamentsData, isLoading } = useQuery({
    queryKey: ['pharmacy-medicaments-management', user?.pharmacy?.id],
    queryFn: () => medicamentService.getAll({ pharmacy_id: user?.pharmacy?.id }),
    enabled: !!user?.pharmacy,
  });

  // Récupérer le tableau des médicaments depuis data.data
  const medicaments = medicamentsData?.data || [];

  // Mutation pour supprimer un médicament
  const deleteMutation = useMutation({
    mutationFn: (id: number) => medicamentService.delete(id),
    onSuccess: () => {
      toast.success('Médicament supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['pharmacy-medicaments-management'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  // Mutation pour ajuster le stock
  const adjustStockMutation = useMutation({
    mutationFn: ({ id, adjustment }: { id: number; adjustment: number }) =>
      medicamentService.adjustStock(id, adjustment),
    onSuccess: () => {
      toast.success('Stock mis à jour');
      queryClient.invalidateQueries({ queryKey: ['pharmacy-medicaments-management'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce médicament ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAdjustStock = (id: number, adjustment: number) => {
    adjustStockMutation.mutate({ id, adjustment });
  };

  // Filtrer les médicaments
  const filteredMedicaments = medicaments.filter((medicament: Medicament) => {
    const matchesSearch = filters.search === '' ||
      medicament.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      medicament.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesAvailability = filters.availability === 'all' ||
      (filters.availability === 'in_stock' && medicament.quantity > 0) ||
      (filters.availability === 'out_of_stock' && medicament.quantity === 0) ||
      (filters.availability === 'low_stock' && medicament.quantity > 0 && medicament.quantity < 10);
    
    return matchesSearch && matchesAvailability;
  });

  // Statistiques
  const stats = {
    total: medicaments.length || 0,
    inStock: medicaments.filter((m: Medicament) => m.quantity > 0).length || 0,
    outOfStock: medicaments.filter((m: Medicament) => m.quantity === 0).length || 0,
    lowStock: medicaments.filter((m: Medicament) => m.quantity > 0 && m.quantity < 10).length || 0,
  };

  if (!user?.pharmacy) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-center text-lg font-bold text-yellow-800 mb-2">
            Aucune pharmacie associée
          </h3>
          <p className="text-center text-yellow-700">
            Vous devez avoir une pharmacie pour gérer les médicaments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Médicaments</h1>
          <p className="text-gray-600">Gérez le stock de votre pharmacie {user.pharmacy.name}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un médicament
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total médicaments</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Package className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rupture de stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock faible</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.availability}
              onChange={(e) => setFilters({...filters, availability: e.target.value})}
            >
              <option value="all">Tous les statuts</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Rupture de stock</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">Toutes catégories</option>
              {/* Ajouter les catégories ici */}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des médicaments */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médicament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicaments.map((medicament: Medicament) => (
                <tr key={medicament.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {medicament.image ? (
                        <img
                          src={medicament.image}
                          alt={medicament.name}
                          className="h-10 w-10 rounded object-cover mr-4"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center mr-4">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{medicament.name}</h4>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {medicament.description || 'Pas de description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {medicament.category?.name || 'Non catégorisé'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${
                        medicament.quantity === 0 ? 'text-red-600' :
                        medicament.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {medicament.quantity}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleAdjustStock(medicament.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleAdjustStock(medicament.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="font-bold">{medicament.price.toLocaleString()} FCFA</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      medicament.quantity === 0 ? 'bg-red-100 text-red-800' :
                      medicament.quantity < 10 ? 'bg-yellow-100 text-yellow-800' :
                      medicament.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {medicament.quantity === 0 ? 'Rupture' :
                       medicament.quantity < 10 ? 'Stock faible' :
                       medicament.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(medicament.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredMedicaments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun médicament trouvé</p>
            <p className="text-sm text-gray-400">Ajoutez votre premier médicament</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MedicamentsManagement;