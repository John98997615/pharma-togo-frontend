import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, MapPin, Clock, CheckCircle, XCircle, Filter, Search, Navigation } from 'lucide-react';
import { livraisonService } from '../../../services/api/livraison.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const LivraisonsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer les livraisons
  const { data: livraisons, isLoading } = useQuery({
    queryKey: ['livreur-livraisons', statusFilter, searchTerm],
    queryFn: () => livraisonService.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      livraisonService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-livraisons'] });
      toast.success('Statut mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleUpdateStatus = (id: number, status: string) => {
    if (window.confirm(`Changer le statut en "${status}" ?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'en_cours': { color: 'bg-blue-100 text-blue-800', icon: Navigation },
      'livree': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'annulee': { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} flex items-center`}>
        <Icon className="h-4 w-4 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Livraisons</h1>
        <p className="text-gray-600">Gérez et suivez vos livraisons</p>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de suivi..."
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="livree">Livrées</option>
                <option value="annulee">Annulées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des livraisons */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des livraisons...</p>
          </div>
        ) : livraisons?.data?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-600">Aucune livraison trouvée</p>
          </div>
        ) : (
          livraisons?.data?.map((livraison: any) => (
            <div key={livraison.id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <Truck className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-lg">Livraison {livraison.tracking_number}</h3>
                        {getStatusBadge(livraison.status)}
                      </div>
                      <p className="text-gray-600">
                        Commande: {livraison.commande?.numero_commande}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Créée le {format(new Date(livraison.created_at), 'dd/MM/yyyy à HH:mm')}
                  </div>
                </div>

                {/* Détails de la livraison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Adresse de livraison</h4>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-900">{livraison.delivery_address}</p>
                        {livraison.delivery_lat && livraison.delivery_lng && (
                          <p className="text-sm text-gray-500 mt-1">
                            Coordonnées: {livraison.delivery_lat}, {livraison.delivery_lng}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Informations client</h4>
                    <div className="space-y-1">
                      <p className="text-gray-900">{livraison.commande?.user?.name}</p>
                      <p className="text-gray-600">Tél: {livraison.commande?.delivery_phone}</p>
                      <p className="text-gray-600">Montant: {livraison.commande?.total_amount?.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>

                {/* Informations de suivi */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-700 mb-4">Suivi de la livraison</h4>
                  <div className="flex flex-wrap gap-4">
                    {livraison.estimated_delivery_time && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Livraison estimée</p>
                        <p className="font-medium">
                          {format(new Date(livraison.estimated_delivery_time), 'dd/MM/yyyy à HH:mm')}
                        </p>
                      </div>
                    )}
                    
                    {livraison.actual_delivery_time && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Livrée le</p>
                        <p className="font-medium">
                          {format(new Date(livraison.actual_delivery_time), 'dd/MM/yyyy à HH:mm')}
                        </p>
                      </div>
                    )}
                    
                    {livraison.delivery_time && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Temps de livraison</p>
                        <p className="font-medium">{livraison.delivery_time}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-3">
                    {livraison.status === 'en_attente' && (
                      <button
                        onClick={() => handleUpdateStatus(livraison.id, 'en_cours')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Démarrer la livraison
                      </button>
                    )}
                    
                    {livraison.status === 'en_cours' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(livraison.id, 'livree')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Marquer comme livrée
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(livraison.id, 'annulee')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Annuler la livraison
                        </button>
                      </>
                    )}
                    
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Voir sur la carte
                    </button>
                    
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Détails de la commande
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LivraisonsPage;