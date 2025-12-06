import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, CheckCircle, XCircle, MapPin, Phone, Mail, Clock, Filter, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../services/api/admin.service';
import { Pharmacy } from '../../../types/pharmacy.types';
import { format } from 'date-fns';

const PharmaciesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Récupérer toutes les pharmacies
  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['admin-pharmacies', statusFilter, searchTerm],
    queryFn: () => adminService.getPharmacies({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined,
    }),
  });

  // Mutation pour activer/désactiver une pharmacie
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => adminService.togglePharmacyActive(id),
    onSuccess: (_, pharmacyId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] });
      toast.success('Statut de la pharmacie mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Mutation pour récupérer les pharmacies en attente
  const { data: pendingPharmacies } = useQuery({
    queryKey: ['pending-pharmacies'],
    queryFn: () => adminService.getPendingPharmacies(),
  });

  const handleToggleActive = (pharmacyId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir changer le statut de cette pharmacie ?')) {
      toggleActiveMutation.mutate(pharmacyId);
    }
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getGardeBadge = (isGarde: boolean) => (
    isGarde && (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium ml-2">
        🚨 Garde
      </span>
    )
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Pharmacies</h1>
        <p className="text-gray-600">Gérez et supervisez toutes les pharmacies de la plateforme</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pharmacies</p>
              <p className="text-2xl font-bold">{pharmacies?.total || 0}</p>
            </div>
            <Building className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Actives</p>
              <p className="text-2xl font-bold text-green-600">
                {pharmacies?.data?.filter(p => p.is_active).length || 0}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inactives</p>
              <p className="text-2xl font-bold text-red-600">
                {pharmacies?.data?.filter(p => !p.is_active).length || 0}
              </p>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingPharmacies?.total || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une pharmacie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives seulement</option>
                <option value="inactive">Inactives seulement</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des pharmacies */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : pharmacies?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune pharmacie trouvée</p>
                  </td>
                </tr>
              ) : (
                pharmacies?.data?.map((pharmacy: Pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {pharmacy.logo ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={`${process.env.REACT_APP_API_URL}/storage/${pharmacy.logo}`}
                              alt={pharmacy.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Building className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pharmacy.name}
                            {getGardeBadge(pharmacy.is_garde)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {pharmacy.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pharmacy.user?.name}</div>
                      <div className="text-sm text-gray-500">{pharmacy.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {pharmacy.phone}
                        </div>
                        {pharmacy.email && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {pharmacy.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(pharmacy.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(pharmacy.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleActive(pharmacy.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            pharmacy.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {pharmacy.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                          Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PharmaciesManagement;