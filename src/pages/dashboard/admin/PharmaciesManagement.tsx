import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Search, Filter, Building2, CheckCircle, XCircle, Eye, Clock,
  MapPin, Phone, Mail, Edit, Trash2, AlertCircle, User, Save
} from 'lucide-react';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { adminService } from '../../../services/api/admin.service';
import { Pharmacy } from '../../../types/pharmacy.types';

const PharmaciesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    opening_time: '',
    closing_time: '',
    is_garde: false
  });

  // Récupérer TOUTES les pharmacies (actives + inactives)
  const {
    data: allPharmacies = [],
    isLoading,
    error: pharmaciesError
  } = useQuery({
    queryKey: ['admin-all-pharmacies'],
    queryFn: () => adminService.getAllPharmacies(),
  });

  // Récupérer les pharmacies en attente spécifiquement
  const {
    data: pendingPharmaciesData = [],
    error: pendingError
  } = useQuery({
    queryKey: ['pending-pharmacies'],
    queryFn: () => adminService.getPendingPharmacies(),
    enabled: activeTab === 'pending'
  });

  // Extraire les données des pharmacies en attente selon le format de réponse
  const pendingPharmacies = Array.isArray(pendingPharmaciesData)
    ? pendingPharmaciesData
    : ((pendingPharmaciesData as any)?.data || []);

  // Mutation pour activer/désactiver une pharmacie
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => adminService.togglePharmacyActive(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Statut modifié avec succès');
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

  // Mutation pour supprimer une pharmacie
  const deletePharmacyMutation = useMutation({
    mutationFn: (id: number) => adminService.deletePharmacy(id),
    onSuccess: () => {
      toast.success('Pharmacie supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-all-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pending-pharmacies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  // Mutation pour mettre à jour une pharmacie
  const updatePharmacyMutation = useMutation({
    mutationFn: (data: { id: number; formData: any }) =>
      pharmacyService.update(data.id, data.formData),
    onSuccess: () => {
      toast.success('Pharmacie mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-all-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['pending-pharmacies'] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  // Gérer le format de réponse pour pendingPharmacies
  const getPendingPharmaciesArray = () => {
    if (!pendingPharmaciesData) return [];
    
    // Si c'est déjà un tableau
    if (Array.isArray(pendingPharmaciesData)) {
      return pendingPharmaciesData as Pharmacy[];
    }
    
    // Si c'est un objet avec une propriété 'data'
    if (pendingPharmaciesData && typeof pendingPharmaciesData === 'object' && 'data' in pendingPharmaciesData) {
      return Array.isArray((pendingPharmaciesData as any).data) 
        ? (pendingPharmaciesData as any).data 
        : [];
    }
    
    // Sinon retourner un tableau vide
    return [];
  };

  // Déterminer quelles pharmacies afficher selon l'onglet
  const getDisplayPharmacies = () => {
    switch (activeTab) {
      case 'active':
        return allPharmacies.filter((p: Pharmacy) => p.is_active);
      case 'inactive':
        return allPharmacies.filter((p: Pharmacy) => !p.is_active);
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
      pharmacy.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Fonction pour voir les détails (redirige vers la page publique)
  const handleViewDetails = (pharmacyId: number) => {
    navigate(`/pharmacies/${pharmacyId}`);
  };

  // Fonction pour ouvrir le modal de modification
  const handleEditPharmacy = (pharmacy: Pharmacy) => {
    setEditingPharmacy(pharmacy);
    setEditFormData({
      name: pharmacy.name,
      phone: pharmacy.phone,
      email: pharmacy.email || '',
      opening_time: pharmacy.opening_time,
      closing_time: pharmacy.closing_time,
      is_garde: pharmacy.is_garde
    });
    setIsEditModalOpen(true);
  };

  // Fonction pour supprimer une pharmacie
  const handleDeletePharmacy = async (pharmacyId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pharmacie ? Cette action est irréversible et supprimera également tous les médicaments associés.')) {
      deletePharmacyMutation.mutate(pharmacyId);
    }
  };

  // Fonction pour approuver une pharmacie en attente
  const handleApprovePharmacy = async (pharmacyId: number) => {
    if (window.confirm('Approuver cette pharmacie ? Elle deviendra active sur la plateforme.')) {
      // Pour l'approbation, on active simplement la pharmacie
      toggleActiveMutation.mutate(pharmacyId);
    }
  };

  // Fonction pour gérer les changements dans le formulaire de modification
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Fonction pour soumettre le formulaire de modification
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacy) return;

    const formData = new FormData();
    formData.append('name', editFormData.name);
    formData.append('phone', editFormData.phone);
    formData.append('email', editFormData.email);
    formData.append('opening_time', editFormData.opening_time);
    formData.append('closing_time', editFormData.closing_time);
    formData.append('is_garde', editFormData.is_garde ? '1' : '0');

    updatePharmacyMutation.mutate({
      id: editingPharmacy.id,
      formData
    });
  };

  // Statistiques
  const stats = {
    total: allPharmacies.length,
    active: allPharmacies.filter((p: Pharmacy) => p.is_active).length,
    inactive: allPharmacies.filter((p: Pharmacy) => !p.is_active).length,
    pending: pendingPharmacies.length,
    garde: allPharmacies.filter((p: Pharmacy) => p.is_garde).length
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pharmaciesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Erreur lors du chargement des pharmacies: {(pharmaciesError as Error).message}
          </p>
        </div>
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
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'active'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Actives ({stats.active})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'inactive'
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
                {displayPharmacies.map((pharmacy: Pharmacy) => (
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${pharmacy.is_active
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
                          className={`block px-3 py-1 rounded-full text-sm font-medium ${pharmacy.is_garde
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
                        {/* Bouton Voir détails */}
                        <button
                          onClick={() => handleViewDetails(pharmacy.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {/* Bouton Modifier */}
                        <button
                          onClick={() => handleEditPharmacy(pharmacy)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </button>

                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => handleDeletePharmacy(pharmacy.id)}
                          disabled={deletePharmacyMutation.isPending}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        {/* Bouton supplémentaire pour les pharmacies en attente */}
                        {activeTab === 'pending' && !pharmacy.is_active && (
                          <button
                            onClick={() => handleApprovePharmacy(pharmacy.id)}
                            disabled={toggleActiveMutation.isPending}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approuver"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de modification de pharmacie */}
      {isEditModalOpen && editingPharmacy && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsEditModalOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto z-10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Modifier la pharmacie</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    disabled={updatePharmacyMutation.isPending}
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la pharmacie *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horaires d'ouverture *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="time"
                          name="opening_time"
                          value={editFormData.opening_time}
                          onChange={handleEditFormChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <span className="py-2">à</span>
                        <input
                          type="time"
                          name="closing_time"
                          value={editFormData.closing_time}
                          onChange={handleEditFormChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_garde"
                        checked={editFormData.is_garde}
                        onChange={handleEditFormChange}
                        id="is_garde"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_garde" className="ml-2 text-sm font-medium text-gray-700">
                        Pharmacie de garde
                      </label>
                    </div>

                    <div className="pt-4 border-t flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        disabled={updatePharmacyMutation.isPending}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={updatePharmacyMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatePharmacyMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmaciesManagement;