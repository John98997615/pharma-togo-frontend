import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package, CheckCircle, Clock, Truck, XCircle, Filter, Search } from 'lucide-react';
import { commandeService } from '../../../services/api/commande.service';
import { Commande, CommandeStatus } from '../../../types/commande.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CommandesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<CommandeStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer les commandes du client
  const { data: commandes, isLoading } = useQuery({
    queryKey: ['client-commandes', statusFilter, searchTerm],
    queryFn: () => commandeService.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  const getStatusIcon = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmee': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'en_cours': return <Package className="h-5 w-5 text-green-500" />;
      case 'livree': return <Truck className="h-5 w-5 text-green-600" />;
      case 'annulee': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <ShoppingCart className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: CommandeStatus) => {
    const statusMap = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_cours': 'En cours',
      'livree': 'Livrée',
      'annulee': 'Annulée',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async (commandeId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await commandeService.cancel(commandeId);
        // Le query client va automatiquement rafraîchir les données
      } catch (error) {
        alert('Impossible d\'annuler cette commande');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Commandes</h1>
        <p className="text-gray-600">Consultez l'historique de vos commandes</p>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de commande..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CommandeStatus | 'all')}
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

      {/* Liste des commandes */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos commandes...</p>
          </div>
        ) : commandes?.data?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-600">Vous n'avez pas encore de commandes</p>
            <p className="text-gray-500">Commencez vos achats dès maintenant !</p>
          </div>
        ) : (
          commandes?.data?.map((commande: Commande) => (
            <div key={commande.id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow">
              {/* En-tête de la commande */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(commande.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-lg">Commande {commande.numero_commande}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(commande.status)}`}>
                          {getStatusText(commande.status)}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Pharmacie: {commande.pharmacy?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {commande.total_amount.toLocaleString()} FCFA
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(commande.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails de la commande */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Adresse de livraison</h4>
                    <p className="text-gray-900">{commande.delivery_address}</p>
                    <p className="text-gray-600">Tél: {commande.delivery_phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Paiement</h4>
                    <div className="space-y-1">
                      <p className="text-gray-900">Méthode: {commande.payment_method}</p>
                      <p className={`font-medium ${
                        commande.payment_status === 'paye' ? 'text-green-600' :
                        commande.payment_status === 'en_attente' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        Statut: {commande.payment_status}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Suivi</h4>
                    {commande.livraison ? (
                      <div className="space-y-1">
                        <p className="text-gray-900">N°: {commande.livraison.tracking_number}</p>
                        <p className="text-gray-600">Statut: {commande.livraison.status}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucun suivi disponible</p>
                    )}
                  </div>
                </div>

                {/* Articles de la commande */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-700 mb-4">Articles commandés</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médicament</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sous-total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {commande.items.map((item) => (
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
                            <td className="px-4 py-3">{item.unit_price.toLocaleString()} FCFA</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3 font-medium">
                              {(item.unit_price * item.quantity).toLocaleString()} FCFA
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  {commande.status === 'en_attente' && (
                    <button
                      onClick={() => handleCancelOrder(commande.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Annuler la commande
                    </button>
                  )}
                  
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Télécharger la facture
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Voir les détails
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

export default CommandesPage;