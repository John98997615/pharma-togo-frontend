import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Package, Clock, CheckCircle, MapPin, DollarSign } from 'lucide-react';
import { livraisonService } from '../../../services/api/livraison.service';

const LivreurDashboard: React.FC = () => {
  // Récupérer les statistiques du livreur
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['livreur-statistics'],
    queryFn: () => livraisonService.livreurStatistics(),
  });

  // Récupérer les livraisons en cours
  const { data: livraisonsEnCours } = useQuery({
    queryKey: ['livraisons-en-cours'],
    queryFn: () => livraisonService.getAll({ status: 'en_cours' }),
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord Livreur</h1>
        <p className="text-gray-600">Gérez vos livraisons et suivez vos performances</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Livraisons totales</p>
              <p className="text-2xl font-bold">{statistics?.total_livraisons || 0}</p>
            </div>
            <Truck className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En cours</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics?.livraisons_en_cours || 0}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{statistics?.livraisons_terminees || 0}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Taux de réussite</p>
              <p className="text-2xl font-bold">{statistics?.taux_reussite || 0}%</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Livraisons en cours */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Livraisons en cours</h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {livraisonsEnCours?.data?.length || 0} en cours
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : livraisonsEnCours?.data?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune livraison en cours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {livraisonsEnCours?.data?.slice(0, 3).map((livraison: any) => (
              <div key={livraison.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <span className="font-bold">{livraison.tracking_number}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {livraison.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{livraison.delivery_address}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      Commande: {livraison.commande?.numero_commande}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Démarrer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Performances</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Temps moyen de livraison</span>
                <span className="text-sm font-medium">{statistics?.moyenne_temps_livraison || 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Livraisons ce mois</span>
                <span className="text-sm font-medium">{statistics?.livraisons_ce_mois || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <MapPin className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">Voir la carte</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Package className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium">Nouvelles livraisons</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Clock className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium">Historique</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <DollarSign className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Revenus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurDashboard;