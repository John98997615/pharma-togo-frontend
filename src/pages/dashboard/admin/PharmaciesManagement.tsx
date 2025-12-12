import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Building2, CheckCircle, XCircle, Eye,
  MapPin, Phone, Mail, Clock, Edit, Trash2
} from 'lucide-react';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { adminService } from '../../../services/api/admin.service';
import { Pharmacy } from '../../../types/pharmacy.types';

const PharmaciesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    garde: 'all'
  });

  // Récupérer toutes les pharmacies
  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['admin-pharmacies'],
    queryFn: () => adminService.getAllPharmacies(),
  });

  // Mutation pour activer/désactiver une pharmacie
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => adminService.togglePharmacyActive(id),
    onSuccess: () => {
      toast.success('Statut modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  // Filtrer les pharmacies
  const filteredPharmacies = pharmacies?.filter(pharmacy => {
    const matchesSearch = searchTerm === '' || 
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && pharmacy.is_active) ||
      (filters.status === 'inactive' && !pharmacy.is_active);
    
    const matchesGarde = filters.garde === 'all' ||
      (filters.garde === 'garde' && pharmacy.is_garde) ||
      (filters.garde === 'normal' && !pharmacy.is_garde);
    
    return matchesSearch && matchesStatus && matchesGarde;
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

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une pharmacie..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.garde}
              onChange={(e) => setFilters({...filters, garde: e.target.value})}
            >
              <option value="all">Toutes les gardes</option>
              <option value="garde">Pharmacies de garde</option>
              <option value="normal">Pharmacies normales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total pharmacies</p>
              <p className="text-2xl font-bold">{pharmacies?.length || 0}</p>
            </div>
            <Building2 className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pharmacies actives</p>
              <p className="text-2xl font-bold text-green-600">
                {pharmacies?.filter(p => p.is_active).length || 0}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pharmacies de garde</p>
              <p className="text-2xl font-bold text-red-600">
                {pharmacies?.filter(p => p.is_garde).length || 0}
              </p>
            </div>
            <Clock className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pharmacies inactives</p>
              <p className="text-2xl font-bold text-gray-600">
                {pharmacies?.filter(p => !p.is_active).length || 0}
              </p>
            </div>
            <XCircle className="h-10 w-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Liste des pharmacies */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horaires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statuts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPharmacies?.map((pharmacy) => (
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
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {pharmacy.address}
                        </div>
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
                          {pharmacy.email}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Propriétaire: {pharmacy.user?.name}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {pharmacy.opening_time} - {pharmacy.closing_time}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Créée le: {new Date(pharmacy.created_at).toLocaleDateString()}
                      </div>
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
                      >
                        {pharmacy.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </button>
                      
                      <button
                        onClick={() => handleToggleGarde(pharmacy.id)}
                        className={`block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                          pharmacy.is_garde
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
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
        
        {filteredPharmacies?.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune pharmacie trouvée</p>
            <p className="text-sm text-gray-400">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmaciesManagement;