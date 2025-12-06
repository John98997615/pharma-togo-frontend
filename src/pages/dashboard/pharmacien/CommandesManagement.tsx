import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, Clock, CheckCircle, Package, Truck, XCircle, 
  Filter, Search, Eye, MapPin, Phone, User 
} from 'lucide-react';
import { commandeService } from '../../../services/api/commande.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CommandesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommande, setSelectedCommande] = useState<any>(null);

  // Récupérer les commandes de la pharmacie
  const { data: commandes, isLoading } = useQuery({
    queryKey: ['pharmacien-commandes', statusFilter, searchTerm],
    queryFn: () => commandeService.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      commandeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacien-commandes'] });
      toast.success('Statut de la commande mis à jour');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_attente': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmee': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'en_cours': return <Package className="h-5 w-5 text-green-500" />;
      case 'livree': return <Truck className="h-5 w-5 text-green-600" />;
      case 'annulee': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <ShoppingCart className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_cours': 'En cours',
      'livree': 'Livrée',
      'annulee': 'Annulée',
    };
    return statusMap[status] || status;
  };

  const handleCancelOrder = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await commandeService.cancel(id);
        toast.success('Commande annulée avec succès');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Commandes</h1>
        <p className="text-gray-600">Gérez les commandes reçues dans votre pharmacie</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total commandes</p>
              <p className="text-2xl font-bold">{commandes?.data?.length || 0}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {commandes?.data?.filter((c: any) => c.status === 'en_attente').length || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Confirmées</p>
              <p className="text-2xl font-bold text-blue-600">
                {commandes?.data?.filter((c: any) => c.status === 'confirmee').length || 0}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Livrées</p>
              <p className="text-2xl font-bold text-green-600">
                {commandes?.data?.filter((c: any) => c.status === 'livree').length || 0}
              </p>
            </div>
            <Truck className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de commande ou client..."
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
                <option value="confirmee">Confirmées</option>
                <option value="en_cours">En cours</option>
                <option value="livree">Livrées</option>
                <option value="annulee">Annulées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              ) : commandes?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune commande trouvée</p>
                  </td>
                </tr>
              ) : (
                commandes?.data?.map((commande: any) => (
                  <tr key={commande.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(commande.status)}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{commande.numero_commande}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(commande.created_at), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {commande.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">{commande.user?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">
                        {commande.total_amount?.toLocaleString()} FCFA
                      </div>
                      <div className="text-sm text-gray-500">
                        {commande.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(commande.status)}`}>
                        {getStatusText(commande.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(commande.created_at), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCommande(commande)}
                          className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </button>
                        
                        {commande.status === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(commande.id, 'confirmee')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => handleCancelOrder(commande.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                        
                        {commande.status === 'confirmee' && (
                          <button
                            onClick={() => handleUpdateStatus(commande.id, 'en_cours')}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Préparer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détail de commande */}
      {selectedCommande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">Commande {selectedCommande.numero_commande}</h3>
                  <p className="text-gray-600">
                    {format(new Date(selectedCommande.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCommande(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Informations client</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{selectedCommande.user?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{selectedCommande.delivery_phone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <span>{selectedCommande.delivery_address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Informations commande</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Statut:</span>
                      <span className={`font-medium ${getStatusColor(selectedCommande.status)} px-2 py-1 rounded`}>
                        {getStatusText(selectedCommande.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paiement:</span>
                      <span>{selectedCommande.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut paiement:</span>
                      <span className={`${
                        selectedCommande.payment_status === 'paye' ? 'text-green-600' :
                        selectedCommande.payment_status === 'en_attente' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedCommande.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold text-lg">
                        {selectedCommande.total_amount?.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles de la commande */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Articles commandés</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médicament</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sous-total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedCommande.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {item.medicament?.image && (
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/storage/${item.medicament.image}`}
                                  alt={item.medicament.name}
                                  className="h-10 w-10 rounded mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.medicament?.name}</div>
                                <div className="text-sm text-gray-500">{item.medicament?.dosage}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.unit_price?.toLocaleString()} FCFA</td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3 font-medium">
                            {(item.unit_price * item.quantity)?.toLocaleString()} FCFA
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.medicament?.quantity >= item.quantity
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.medicament?.quantity || 0} disponible(s)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedCommande.notes && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Notes du client</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedCommande.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCommande(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
                
                {selectedCommande.status === 'en_attente' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedCommande.id, 'confirmee');
                        setSelectedCommande(null);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Confirmer la commande
                    </button>
                    <button
                      onClick={() => {
                        handleCancelOrder(selectedCommande.id);
                        setSelectedCommande(null);
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Annuler la commande
                    </button>
                  </>
                )}
                
                {selectedCommande.status === 'confirmee' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedCommande.id, 'en_cours');
                      setSelectedCommande(null);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Commencer la préparation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandesManagement;