// src/pages/dashboard/pharmacien/CommandesManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Filter, Search, Eye, UserPlus,
  RefreshCw, XCircle, Package, CheckCircle, Truck
} from 'lucide-react';
import { commandeService } from '../../../services/api/commande.service';
import { livraisonService } from '../../../services/api/livraison.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Commande, CommandeStatus } from '../../../types/commande.types';

const CommandesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignLivreurModal, setAssignLivreurModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [selectedLivreur, setSelectedLivreur] = useState<number | null>(null);

  // Récupérer les commandes du pharmacien
  const { data: commandesData, isLoading, refetch } = useQuery({
    queryKey: ['pharmacien-commandes', statusFilter, searchTerm],
    queryFn: () => commandeService.getAll({
      status: statusFilter !== 'all' ? (statusFilter as CommandeStatus) : undefined,
      search: searchTerm || undefined,
      per_page: 20
    }),
  });

  // Récupérer les livreurs disponibles
  const { data: livreursData } = useQuery({
    queryKey: ['livreurs-disponibles'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/users?role=livreur&is_active=true', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const data = await response.json();
        return data.data || data || [];
      } catch (error) {
        console.error('Error fetching livreurs:', error);
        return [];
      }
    },
    enabled: assignLivreurModal,
  });

  // Mutation pour assigner un livreur
  const assignLivreurMutation = useMutation({
    mutationFn: ({ commandeId, livreurId }: { commandeId: number; livreurId: number }) =>
      livraisonService.assignLivreur(commandeId, livreurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacien-commandes'] });
      toast.success('Livreur assigné avec succès');
      setAssignLivreurModal(false);
      setSelectedCommande(null);
      setSelectedLivreur(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation');
    },
  });

  // Mutation pour changer le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CommandeStatus }) =>
      commandeService.updateStatus(id, status),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacien-commandes'] });
      toast.success(response?.message || 'Statut mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Déterminer la couleur selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-purple-100 text-purple-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      case 'livree': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Texte du statut
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_cours': 'En cours',
      'annulee': 'Annulée',
      'livree': 'Livrée',
    };
    return statusMap[status] || status;
  };

  // Vérifier si le pharmacien peut changer vers ce statut (selon API)
  const canPharmacienUpdateToStatus = (currentStatus: CommandeStatus, newStatus: CommandeStatus): boolean => {
    const allowedTransitions: Record<CommandeStatus, CommandeStatus[]> = {
      'en_attente': ['confirmee', 'annulee'],
      'confirmee': ['en_cours', 'annulee'],
      'en_cours': ['annulee'], // Pharmacien ne peut pas marquer comme livrée
      'annulee': [],
      'livree': [] // Pharmacien ne peut pas modifier une commande livrée
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  };

  // Gérer l'assignation d'un livreur
  const handleAssignLivreur = async () => {
    if (!selectedCommande || !selectedLivreur) {
      toast.error('Veuillez sélectionner un livreur');
      return;
    }

    try {
      await assignLivreurMutation.mutateAsync({
        commandeId: selectedCommande.id,
        livreurId: selectedLivreur
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Gérer la mise à jour du statut
  const handleUpdateStatus = (commande: Commande, newStatus: CommandeStatus) => {
    // Vérifier si le changement est autorisé
    if (!canPharmacienUpdateToStatus(commande.status, newStatus)) {
      toast.error('Changement de statut non autorisé');
      return;
    }

    const confirmMessages: Record<CommandeStatus, string> = {
      'confirmee': 'Confirmer cette commande ?',
      'en_cours': 'Marquer comme en cours ?',
      'annulee': 'Annuler cette commande ? Cette action est irréversible.',
      'en_attente': 'Remettre en attente ?',
      'livree': 'Marquer comme livrée ?'
    };

    if (window.confirm(confirmMessages[newStatus] || 'Confirmer cette action ?')) {
      updateStatusMutation.mutate({ id: commande.id, status: newStatus });
    }
  };

  const commandes = commandesData?.data || [];
  const livreurs = livreursData || [];

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Commandes</h1>
            <p className="text-gray-600">
              {commandes.length} commande(s) trouvée(s)
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, client..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="confirmee">Confirmées</option>
                <option value="en_cours">En cours</option>
                <option value="annulee">Annulées</option>
                <option value="livree">Livrées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : commandes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  Aucune commande trouvée
                </td>
              </tr>
            ) : (
              commandes.map((commande: Commande) => (
                <tr key={commande.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        #{commande.numero_commande}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(commande.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{commande.user?.name || 'Client'}</div>
                      <div className="text-sm text-gray-500">{commande.delivery_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-green-700">
                      {commande.total_amount?.toLocaleString()} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(commande.status)}`}>
                      {getStatusText(commande.status)}
                    </span>
                    {commande.livreur && (
                      <div className="text-xs text-gray-500 mt-1">
                        Livreur: {commande.livreur.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {/* Lien vers la page détaillée */}
                      <Link
                        to={`/pharmacien/commandes/${commande.id}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center justify-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Détails
                      </Link>

                      {/* Actions selon le statut - CONFORME À L'API */}
                      <div className="flex flex-wrap gap-2">
                        {/* En attente → Confirmer ou Annuler */}
                        {commande.status === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(commande, 'confirmee')}
                              className="flex-1 min-w-[120px] px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center"
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmer
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(commande, 'annulee')}
                              className="flex-1 min-w-[120px] px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center"
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Annuler
                            </button>
                          </>
                        )}

                        {/* Confirmée → En cours ou Annuler */}
                        {commande.status === 'confirmee' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(commande, 'en_cours')}
                              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              En cours
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(commande, 'annulee')}
                              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center"
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Annuler
                            </button>
                          </>
                        )}

                        {/* En cours → Annuler seulement (pas de "Prête") */}
                        {commande.status === 'en_cours' && (
                          <button
                            onClick={() => handleUpdateStatus(commande, 'annulee')}
                            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center"
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Annuler
                          </button>
                        )}

                        {/* Assigner un livreur (disponible pour les commandes confirmées ou en cours) */}
                        {(commande.status === 'confirmee' || commande.status === 'en_cours') && !commande.livreur_id && (
                          <button
                            onClick={() => {
                              setSelectedCommande(commande);
                              setAssignLivreurModal(true);
                            }}
                            className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center justify-center"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Livreur
                          </button>
                        )}

                        {/* Statuts terminaux */}
                        {(commande.status === 'annulee' || commande.status === 'livree') && (
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium text-center ${commande.status === 'annulee' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {commande.status === 'annulee' ? 'Annulée' : 'Livrée'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'assignation de livreur */}
      {assignLivreurModal && selectedCommande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">Assigner un livreur</h3>
                  <p className="text-gray-600 mt-1">
                    Commande #{selectedCommande.numero_commande}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAssignLivreurModal(false);
                    setSelectedCommande(null);
                    setSelectedLivreur(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Sélectionner un livreur :</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {livreurs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun livreur disponible</p>
                    </div>
                  ) : (
                    livreurs.map((livreur: any) => (
                      <div
                        key={livreur.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedLivreur === livreur.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        onClick={() => setSelectedLivreur(livreur.id)}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="font-bold text-purple-600">
                              {livreur.name?.charAt(0) || 'L'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{livreur.name}</p>
                            <p className="text-sm text-gray-600">{livreur.phone}</p>
                            <p className="text-xs text-gray-500">Statut: {livreur.is_active ? 'Actif' : 'Inactif'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setAssignLivreurModal(false);
                    setSelectedLivreur(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignLivreur}
                  disabled={!selectedLivreur || assignLivreurMutation.isPending}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignLivreurMutation.isPending ? (
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Assignation...
                    </span>
                  ) : (
                    'Assigner le livreur'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandesManagement;