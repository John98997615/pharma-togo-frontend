import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag, Package, Truck, CheckCircle, Clock,
  XCircle, Eye, Download, Filter, Search
} from 'lucide-react';
import { commandeService } from '../../../services/api/commande.service';
import { Commande, CommandeStatus } from '../../../types/commande.types';

// Type pour les filtres
type FilterStatus = CommandeStatus | 'all';

interface Filters {
  status: FilterStatus;
  search: string;
}

const CommandesPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    search: ''
  });

  // Construire les paramètres de requête
  const getQueryParams = () => {
    const params: { status?: CommandeStatus } = {};
    
    if (filters.status !== 'all') {
      params.status = filters.status;
    }
    
    return params;
  };

  const { data: commandes, isLoading, refetch } = useQuery({
    queryKey: ['client-commandes', filters.status],
    queryFn: () => commandeService.getAll(getQueryParams()),
  });

  const handleCancelOrder = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment annuler cette commande ?')) {
      try {
        await commandeService.cancel(id);
        toast.success('Commande annulée avec succès');
        refetch();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
      }
    }
  };

  const filteredCommandes = commandes?.data?.filter(commande => 
    filters.search === '' ||
    commande.numero_commande.toLowerCase().includes(filters.search.toLowerCase()) ||
    commande.pharmacy?.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  const getStatusIcon = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'confirmee': return <Package className="h-5 w-5 text-blue-600" />;
      case 'en_cours': return <Truck className="h-5 w-5 text-green-600" />;
      case 'livree': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'annulee': return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
    }
  };

  // Gestionnaire pour le changement de statut
  const handleStatusChange = (value: string) => {
    // Valider que la valeur est un statut valide ou 'all'
    const validStatuses: FilterStatus[] = ['all', 'en_attente', 'confirmee', 'en_cours', 'livree', 'annulee'];
    
    if (validStatuses.includes(value as FilterStatus)) {
      setFilters({...filters, status: value as FilterStatus});
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
        <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
        <p className="text-gray-600">Suivez toutes vos commandes passées</p>
      </div>

      {/* Filtres et statistiques */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
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
              <option value="confirmee">Confirmée</option>
              <option value="en_cours">En cours</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Nouvelle commande
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600">En attente</p>
                <p className="text-xl font-bold">
                  {commandes?.data?.filter(c => c.status === 'en_attente').length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600">En cours</p>
                <p className="text-xl font-bold">
                  {commandes?.data?.filter(c => c.status === 'en_cours').length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600">Livrées</p>
                <p className="text-xl font-bold">
                  {commandes?.data?.filter(c => c.status === 'livree').length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-red-600">Total</p>
                <p className="text-xl font-bold">{commandes?.data?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredCommandes?.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune commande trouvée</p>
            <p className="text-sm text-gray-400">Passez votre première commande !</p>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Commander maintenant
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCommandes?.map((commande) => (
              <div key={commande.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center mb-4 md:mb-0">
                    {getStatusIcon(commande.status)}
                    <div className="ml-3">
                      <h3 className="text-lg font-bold">{commande.numero_commande}</h3>
                      <p className="text-sm text-gray-500">
                        Pharmacie: {commande.pharmacy?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(commande.status)}`}>
                      {commande.status.replace('_', ' ')}
                    </span>
                    <span className="text-xl font-bold">
                      {commande.total_amount.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(commande.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Méthode de paiement</p>
                    <p className="font-medium capitalize">{commande.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut paiement</p>
                    <p className={`font-medium ${
                      commande.payment_status === 'paye' ? 'text-green-600' :
                      commande.payment_status === 'en_attente' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {commande.payment_status}
                    </p>
                  </div>
                </div>
                
                {/* Articles de la commande */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Articles :</p>
                  <div className="space-y-2">
                    {commande.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.medicament?.name} x {item.quantity}</span>
                        <span>{(item.unit_price * item.quantity).toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">
                      {commande.items?.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </button>
                    
                    {commande.status === 'en_attente' && (
                      <button
                        onClick={() => handleCancelOrder(commande.id)}
                        className="flex items-center px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Annuler
                      </button>
                    )}
                    
                    {commande.status === 'livree' && (
                      <button className="flex items-center px-3 py-2 text-green-600 hover:text-green-800">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger reçu
                      </button>
                    )}
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

export default CommandesPage;