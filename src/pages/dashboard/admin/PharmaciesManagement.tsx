import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Building2, CheckCircle, XCircle, Eye, Clock,
  MapPin, Phone, Mail, Edit, Trash2, AlertCircle, User
} from 'lucide-react';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { adminService } from '../../../services/api/admin.service';
import { Pharmacy } from '../../../types/pharmacy.types';

const PharmaciesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  
  // Récupérer TOUTES les pharmacies (actives + inactives)
  const { data: allPharmacies = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-all-pharmacies'],
    queryFn: () => adminService.getAllPharmacies(),
  });

  // Récupérer les pharmacies en attente spécifiquement
  const { data: pendingPharmacies = [] } = useQuery({
    queryKey: ['pending-pharmacies'],
    queryFn: () => adminService.getPendingPharmacies(),
    enabled: activeTab === 'pending'
  });

  // Mutation pour activer/désactiver une pharmacie
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => adminService.togglePharmacyActive(id),
    onSuccess: (data, id) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-all-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pending-pharmacies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  // Mutation pour mettre à jour le statut de garde
  const toggleGardeMutation = useMutation({
    mutationFn: (id: number) => pharmacyService.toggleGarde(id),
    onSuccess: () => {
      toast.success('Statut de garde modifié');
      queryClient.invalidateQueries({ queryKey: ['admin-all-pharmacies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  // Déterminer quelles pharmacies afficher selon l'onglet
  const getDisplayPharmacies = () => {
    switch (activeTab) {
      case 'active':
        return allPharmacies.filter(p => p.is_active);
      case 'inactive':
        return allPharmacies.filter(p => !p.is_active);
      case 'pending':
        return pendingPharmacies;
      case 'all':
      default:
        return allPharmacies;
    }
  };

  const displayPharmacies = getDisplayPharmacies().filter((pharmacy: Pharmacy) => {
    const matchesSearch = searchTerm === '' || 
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleToggleActive = (id: number) => {
    if (window.confirm('Voulez-vous modifier le statut de cette pharmacie ?')) {
      toggleActiveMutation.mutate(id);
    }
  };

  const handleToggleGarde = (id: number) => {
    if (window.confirm('Voulez-vous modifier le statut de garde de cette pharmacie ?')) {
      toggleGardeMutation.mutate(id);
    }
  };

  // Statistiques
  const stats = {
    total: allPharmacies.length,
    active: allPharmacies.filter(p => p.is_active).length,
    inactive: allPharmacies.filter(p => !p.is_active).length,
    pending: pendingPharmacies.length,
    garde: allPharmacies.filter(p => p.is_garde).length
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Pharmacies</h1>
        <p className="text-gray-600">Gérez toutes les pharmacies de la plateforme</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Building2 className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">De garde</p>
              <p className="text-2xl font-bold text-red-600">{stats.garde}</p>
            </div>
            <Clock className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactives</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <XCircle className="h-10 w-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Actives ({stats.active})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'inactive'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inactives ({stats.inactive})
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, adresse ou propriétaire..."
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des pharmacies */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {displayPharmacies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune pharmacie trouvée</p>
            <p className="text-sm text-gray-400">Essayez de modifier vos filtres de recherche</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriétaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statuts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayPharmacies.map((pharmacy: Pharmacy | any) => (
                  <tr key={pharmacy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {pharmacy.logo ? (
                          <img
                            src={pharmacy.logo}
                            alt={pharmacy.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900">{pharmacy.name}</h3>
                            {pharmacy.is_garde && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Garde
                              </span>
                            )}
                            {!pharmacy.is_active && (
                              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-xs">{pharmacy.address}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{pharmacy.user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{pharmacy.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {pharmacy.phone}
                        </div>
                        {pharmacy.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-xs">{pharmacy.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleToggleActive(pharmacy.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            pharmacy.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {pharmacy.is_active ? '🟢 Active' : '🔴 Inactive'}
                          {toggleActiveMutation.isPending && '...'}
                        </button>
                        
                        <button
                          onClick={() => handleToggleGarde(pharmacy.id)}
                          className={`block px-3 py-1 rounded-full text-sm font-medium ${
                            pharmacy.is_garde
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          disabled={toggleGardeMutation.isPending}
                        >
                          {pharmacy.is_garde ? 'Enlevé de garde' : 'Mettre en garde'}
                        </button>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          title="Voir détails"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmaciesManagement;