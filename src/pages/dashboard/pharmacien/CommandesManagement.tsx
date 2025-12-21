// src/pages/dashboard/pharmacien/CommandesManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Clock, CheckCircle, Package, Truck, XCircle,
  Filter, Search, Eye, MapPin, Phone, User, Mail, UserPlus,
  AlertCircle, ExternalLink, RefreshCw, Download, ChevronRight
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
  const [selectedCommandeForAssign, setSelectedCommandeForAssign] = useState<Commande | null>(null);
  const [selectedLivreur, setSelectedLivreur] = useState<number | null>(null);

  // Récupérer les commandes
  const { data: commandesData, isLoading, refetch } = useQuery({
    queryKey: ['pharmacien-commandes', statusFilter, searchTerm],
    queryFn: () => commandeService.getAll({
      status: statusFilter !== 'all' ? (statusFilter as CommandeStatus) : undefined,
      search: searchTerm || undefined,
      per_page: 20
    }),
  });

  // Récupérer les livreurs (si vous avez cette API)
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
      setSelectedCommandeForAssign(null);
      setSelectedLivreur(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'assignation');
    },
  });

  // Mutation pour changer le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CommandeStatus }) =>
      commandeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacien-commandes'] });
      toast.success('Statut mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_cours': return 'bg-green-100 text-green-800 border-green-200';
      case 'livree': return 'bg-green-100 text-green-800 border-green-200';
      case 'annulee': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleAssignLivreur = async () => {
    if (!selectedCommandeForAssign || !selectedLivreur) {
      toast.error('Veuillez sélectionner un livreur');
      return;
    }

    try {
      await assignLivreurMutation.mutateAsync({
        commandeId: selectedCommandeForAssign.id,
        livreurId: selectedLivreur
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateStatus = (commandeId: number, status: CommandeStatus) => {
    if (window.confirm(`Changer le statut en "${getStatusText(status)}" ?`)) {
      updateStatusMutation.mutate({ id: commandeId, status });
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
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
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
                className="border border-gray-300 rounded-lg px-4 py-2.5"
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
                        {format(new Date(commande.created_at), 'dd/MM/yyyy HH:mm')}
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
                    <span className={`px-3 py-1.5 rounded-full text-sm ${getStatusColor(commande.status)}`}>
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
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Détails complets
                      </Link>

                      {/* Actions selon le statut */}
                      <div className="flex gap-2">
                        {commande.status === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(commande.id, 'confirmee')}
                              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(commande.id, 'annulee')}
                              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              Annuler
                            </button>
                          </>
                        )}

                        {commande.status === 'confirmee' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(commande.id, 'en_cours')}
                              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Préparer
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCommandeForAssign(commande);
                                setAssignLivreurModal(true);
                              }}
                              className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            >
                              <UserPlus className="h-3 w-3 inline mr-1" />
                              Livreur
                            </button>
                          </>
                        )}

                        {commande.status === 'en_cours' && (
                          <button
                            onClick={() => handleUpdateStatus(commande.id, 'livree')}
                            className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Livrer
                          </button>
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
      {assignLivreurModal && selectedCommandeForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">Assigner un livreur</h3>
                  <p className="text-gray-600 mt-1">
                    Commande #{selectedCommandeForAssign.numero_commande}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAssignLivreurModal(false);
                    setSelectedCommandeForAssign(null);
                    setSelectedLivreur(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
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
                        className={`p-4 rounded-lg border cursor-pointer ${selectedLivreur === livreur.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                          }`}
                        onClick={() => setSelectedLivreur(livreur.id)}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{livreur.name}</p>
                            <p className="text-sm text-gray-600">{livreur.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setAssignLivreurModal(false);
                    setSelectedLivreur(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignLivreur}
                  disabled={!selectedLivreur || assignLivreurMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {assignLivreurMutation.isPending ? 'Assignation...' : 'Assigner'}
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