import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Truck, Package, Clock, CheckCircle, MapPin, 
  DollarSign, TrendingUp, AlertCircle
} from 'lucide-react';
import { livraisonService } from '../../../services/api/livraison.service';
import { useAuth } from '../../../context/AuthContext';

const LivreurDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: statistics } = useQuery({
    queryKey: ['livreur-statistics'],
    queryFn: () => livraisonService.getLivreurStatistics(),
  });

  const { data: livraisons, isLoading } = useQuery({
    queryKey: ['livreur-livraisons'],
    queryFn: () => livraisonService.getAll(),
  });

  // Filtrer les livraisons par statut
  const pendingLivraisons = livraisons?.filter(l => l.status === 'en_attente') || [];
  const activeLivraisons = livraisons?.filter(l => l.status === 'en_cours') || [];
  const completedLivraisons = livraisons?.filter(l => l.status === 'livree') || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Livreur</h1>
        <p className="text-gray-600">
          Bienvenue, {user?.name}. Gérez vos livraisons efficacement.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Livraisons en attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingLivraisons.length}
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              En attente d'assignation
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Livraisons en cours</p>
              <p className="text-2xl font-bold text-blue-600">
                {activeLivraisons.length}
              </p>
            </div>
            <Truck className="h-12 w-12 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              À livrer aujourd'hui
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Livraisons terminées</p>
              <p className="text-2xl font-bold text-green-600">
                {completedLivraisons.length}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Ce mois: {statistics?.livraisonsCeMois || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenu total</p>
              <p className="text-2xl font-bold text-purple-600">
                {statistics?.revenueTotal?.toLocaleString() || '0'} FCFA
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-500" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Ce mois: {statistics?.revenueCeMois?.toLocaleString() || '0'} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      {activeLivraisons.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-bold text-yellow-800">
                Vous avez {activeLivraisons.length} livraison(s) en cours
              </p>
              <p className="text-yellow-700 text-sm">
                Vérifiez vos livraisons et mettez à jour les statuts si nécessaire.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Livraisons en cours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livraisons en attente */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-600" />
              Livraisons en attente
            </h3>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              {pendingLivraisons.length}
            </span>
          </div>
          
          {pendingLivraisons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune livraison en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLivraisons.slice(0, 3).map((livraison) => (
                <div key={livraison.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">#{livraison.tracking_number}</p>
                      <p className="text-sm text-gray-600">
                        Pharmacie: {livraison.commande?.pharmacy?.name}
                      </p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Accepter
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {livraison.delivery_address}
                  </div>
                </div>
              ))}
              
              {pendingLivraisons.length > 3 && (
                <button className="w-full py-2 text-center text-blue-600 hover:text-blue-800 font-medium">
                  Voir toutes ({pendingLivraisons.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Livraisons en cours */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-600" />
              Livraisons en cours
            </h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {activeLivraisons.length}
            </span>
          </div>
          
          {activeLivraisons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune livraison en cours</p>
              <p className="text-sm">Acceptez une livraison pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLivraisons.map((livraison) => (
                <div key={livraison.id} className="border border-blue-100 bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">#{livraison.tracking_number}</p>
                      <p className="text-sm text-gray-600">
                        Client: {livraison.commande?.user?.name}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      En cours
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{livraison.delivery_address}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{livraison.commande?.items?.length || 0} articles</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{livraison.commande?.total_amount?.toLocaleString() || 0} FCFA</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      Marquer comme livré
                    </button>
                    <button className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                      Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performances */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Mes performances
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{statistics?.moyenneLivraisonsParJour || 0}</p>
            <p className="text-sm text-gray-600">Moyenne/jour</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {statistics?.tauxLivraisonReussie || 0}%
            </p>
            <p className="text-sm text-gray-600">Taux de réussite</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {statistics?.moyenneTempsLivraison || 0} min
            </p>
            <p className="text-sm text-gray-600">Temps moyen</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {statistics?.evaluation || 0}/5
            </p>
            <p className="text-sm text-gray-600">Évaluation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurDashboard;