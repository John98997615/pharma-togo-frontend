// src/pages/dashboard/livreur/LivraisonsPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Truck, Package, CheckCircle, Clock, MapPin,
  User, Phone, DollarSign, Filter, Search,
  Navigation
} from 'lucide-react';
import { livraisonService } from '../../../services/api/livraison.service';
import { Livraison, LivraisonStatus } from '../../../types/livraison.types';

// Type pour les filtres
interface Filters {
  status: LivraisonStatus | 'all';
  search: string;
  date: string;
}

// Type pour les items de commande
interface CommandeItem {
  id: number;
  medicament?: {
    name: string;
  };
  quantity: number;
  unit_price: number;
}

const LivraisonsPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    search: '',
    date: ''
  });

  // Construire les paramètres de requête
  const getQueryParams = () => {
    const params: { status?: LivraisonStatus } = {};
    
    if (filters.status !== 'all') {
      params.status = filters.status;
    }
    
    return params;
  };

  const { data: livraisons, isLoading, refetch } = useQuery({
    queryKey: ['livreur-all-livraisons', filters.status],
    queryFn: () => livraisonService.getAll(getQueryParams()),
  });

  const handleUpdateStatus = async (livraisonId: number, newStatus: LivraisonStatus) => {
    try {
      await livraisonService.updateStatus(livraisonId, newStatus);
      toast.success('Statut mis à jour avec succès');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // Gestionnaire pour le changement de statut
  const handleStatusChange = (value: string) => {
    const validStatuses: Array<LivraisonStatus | 'all'> = ['all', 'en_attente', 'en_cours', 'livree', 'annulee'];
    
    if (validStatuses.includes(value as any)) {
      setFilters({...filters, status: value as LivraisonStatus | 'all'});
    }
  };

  const filteredLivraisons = livraisons?.filter(livraison => {
    const matchesSearch = filters.search === '' ||
      livraison.tracking_number.toLowerCase().includes(filters.search.toLowerCase()) ||
      livraison.commande?.user?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      livraison.delivery_address.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: LivraisonStatus) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'livree': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Livraisons</h1>
        <p className="text-gray-600">Suivez et gérez toutes vos livraisons</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une livraison..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          
          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Liste des livraisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLivraisons?.map((livraison) => (
          <div key={livraison.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-bold text-lg">#{livraison.tracking_number}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(livraison.status)}`}>
                  {livraison.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Commande</p>
                <p className="font-bold">{livraison.commande?.numero_commande}</p>
              </div>
            </div>
            
            {/* Informations client */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{livraison.commande?.user?.name}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{livraison.commande?.delivery_phone || livraison.commande?.user?.phone}</span>
              </div>
            </div>
            
            {/* Adresse de livraison */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                <h4 className="font-bold">Adresse de livraison</h4>
              </div>
              <p className="text-gray-700">{livraison.delivery_address}</p>
              {livraison.delivery_lat && livraison.delivery_lng && (
                <button className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm">
                  <Navigation className="h-4 w-4 mr-1" />
                  Voir sur la carte
                </button>
              )}
            </div>
            
            {/* Détails commande */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Détails de la commande</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pharmacie</p>
                  <p className="font-medium">{livraison.commande?.pharmacy?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant total</p>
                  <p className="font-bold flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {livraison.commande?.total_amount.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
              
              {/* Articles */}
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Articles :</p>
                <div className="space-y-1">
                  {livraison.commande?.items?.slice(0, 3).map((item: CommandeItem, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.medicament?.name} x {item.quantity}</span>
                      <span>{(item.unit_price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                  {livraison.commande?.items && livraison.commande.items.length > 3 && (
                    <p className="text-sm text-gray-500">
                      + {livraison.commande.items.length - 3} autres articles
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Horaires */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Heure estimée</p>
                <p className="font-medium">
                  {livraison.estimated_delivery_time 
                    ? new Date(livraison.estimated_delivery_time).toLocaleTimeString()
                    : 'Non spécifiée'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Heure réelle</p>
                <p className="font-medium">
                  {livraison.actual_delivery_time 
                    ? new Date(livraison.actual_delivery_time).toLocaleTimeString()
                    : livraison.status === 'livree' ? 'Non enregistrée' : 'Non livrée'}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2">
              {livraison.status === 'en_cours' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(livraison.id, 'livree')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Marquer comme livré
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(livraison.id, 'annulee')}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Annuler
                  </button>
                </>
              )}
              
              {livraison.status === 'en_attente' && (
                <button
                  onClick={() => handleUpdateStatus(livraison.id, 'en_cours')}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Commencer la livraison
                </button>
              )}
              
              {livraison.status === 'livree' && (
                <button
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  disabled
                >
                  Livraison terminée
                </button>
              )}
              
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredLivraisons?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune livraison trouvée</p>
          <p className="text-sm text-gray-400">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
};

export default LivraisonsPage;