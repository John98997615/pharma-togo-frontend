// src/pages/dashboard/pharmacien/PharmacienDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock,
  MapPin,
  Settings,
  PlusCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { medicamentService } from '../../../services/api/medicament.service';
import { commandeService } from '../../../services/api/commande.service';
import { Commande, CommandeStatus } from '../../../types/commande.types';
import { Medicament } from '../../../types/medicament.types';
import { Pharmacy } from '../../../types/pharmacy.types';

const PharmacienDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [stats, setStats] = useState({
    totalMedicaments: 0,
    lowStock: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  });

  // Récupérer la pharmacie du pharmacien
  useEffect(() => {
    const fetchPharmacy = async () => {
      if (user?.pharmacy) {
        try {
          const data = await pharmacyService.getById(user.pharmacy.id);
          setPharmacy(data);
        } catch (error) {
          toast.error('Erreur lors du chargement de la pharmacie');
        }
      }
    };
    fetchPharmacy();
  }, [user]);

  // Récupérer les médicaments
  const { data: medicamentsData, isLoading: medicamentsLoading } = useQuery({
    queryKey: ['pharmacy-medicaments', pharmacy?.id],
    queryFn: () => medicamentService.getAll({ 
      pharmacy_id: pharmacy?.id,
      per_page: 50 
    }),
    enabled: !!pharmacy,
  });

  // Récupérer les commandes
  const { data: commandesData, isLoading: commandesLoading } = useQuery({
    queryKey: ['pharmacy-commandes', pharmacy?.id],
    queryFn: () => commandeService.getAll({ 
      pharmacy_id: pharmacy?.id,
      per_page: 10,
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }),
    enabled: !!pharmacy,
  });

  // Calculer les statistiques
  useEffect(() => {
    if (medicamentsData && commandesData) {
      const medicaments = medicamentsData.data || [];
      const commandes = commandesData.data || [];
      
      // Commandes d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = commandes.filter(c => 
        c.created_at.startsWith(today)
      );
      
      // Calcul des statistiques
      setStats({
        totalMedicaments: medicaments.length,
        lowStock: medicaments.filter(m => m.quantity < 10).length,
        pendingOrders: commandes.filter(c => c.status === 'en_attente').length,
        todayRevenue: todayOrders.reduce((sum, c) => sum + c.total_amount, 0),
        confirmedOrders: commandes.filter(c => c.status === 'confirmee').length,
        deliveredOrders: commandes.filter(c => c.status === 'livree').length,
      });
    }
  }, [medicamentsData, commandesData]);

  const toggleGarde = async () => {
    if (!pharmacy) return;
    try {
      const response = await pharmacyService.toggleGarde(pharmacy.id);
      setPharmacy({ ...pharmacy, is_garde: response.is_garde });
      toast.success(
        response.is_garde 
          ? '✅ Pharmacie mise en garde avec succès'
          : '✅ Pharmacie retirée de la garde'
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const getStatusColor = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-purple-100 text-purple-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  if (!pharmacy) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Aucune pharmacie</h3>
              <p className="text-yellow-700 mt-1">
                Vous n'avez pas encore de pharmacie. Veuillez en créer une pour commencer.
              </p>
              <Link
                to="/pharmacien/pharmacy/create"
                className="inline-flex items-center mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer ma pharmacie
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Tableau de bord Pharmacien
            </h1>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="font-medium">{pharmacy.name}</span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pharmacy.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pharmacy.is_active ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleGarde}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                pharmacy.is_garde 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {pharmacy.is_garde ? '🚨 PHARMACIE DE GARDE' : 'Mettre en garde'}
            </button>
            
            <Link
              to="/pharmacien/settings"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Médicaments</p>
              <p className="text-3xl font-bold mt-2">{stats.totalMedicaments}</p>
              <div className="flex items-center mt-2">
                <Package className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">en stock</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/medicaments"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Gérer les médicaments →
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Commandes en attente</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pendingOrders}</p>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">à traiter</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/commandes"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir les commandes →
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Rupture de stock</p>
              <p className="text-3xl font-bold mt-2 text-red-600">{stats.lowStock}</p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-600">produits</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/medicaments?low_stock=true"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Réapprovisionner →
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Revenu aujourd'hui</p>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {stats.todayRevenue.toLocaleString()} FCFA
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">total</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/statistics"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir les stats →
          </Link>
        </motion.div>
      </div>

      {/* Alertes */}
      {stats.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <span className="font-bold text-red-700">
                  {stats.lowStock} médicament(s) en rupture de stock
                </span>
                <p className="text-red-600 text-sm mt-1">
                  Veuillez réapprovisionner ces produits rapidement.
                </p>
              </div>
            </div>
            <Link
              to="/pharmacien/medicaments?low_stock=true"
              className="text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              Gérer le stock →
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commandes récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
              Commandes récentes
            </h3>
            <Link
              to="/pharmacien/commandes"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir toutes →
            </Link>
          </div>
          
          {commandesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des commandes...</p>
            </div>
          ) : commandesData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Aucune commande pour le moment</p>
              <p className="text-gray-400 text-sm mt-1">Les commandes apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commandesData?.data?.slice(0, 5).map((commande: Commande) => (
                <div
                  key={commande.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">#{commande.numero_commande}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commande.status)}`}>
                        {getStatusText(commande.status)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <span>{commande.user?.name || 'Client'}</span>
                      <span className="mx-2">•</span>
                      <span>{commande.total_amount.toLocaleString()} FCFA</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(commande.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    to={`/pharmacien/commandes/${commande.id}`}
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Détails
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Médicaments en faible stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Stock faible
            </h3>
            <Link
              to="/pharmacien/medicaments?low_stock=true"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir tous →
            </Link>
          </div>
          
          {medicamentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des médicaments...</p>
            </div>
          ) : !medicamentsData?.data?.some((m: Medicament) => m.quantity < 10) ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-green-300" />
              <p className="text-gray-500">Stock optimal</p>
              <p className="text-gray-400 text-sm mt-1">Tous les médicaments ont un stock suffisant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicamentsData?.data
                ?.filter((m: Medicament) => m.quantity < 10)
                .slice(0, 5)
                .map((medicament: Medicament) => (
                  <div
                    key={medicament.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      {medicament.image ? (
                        <img
                          src={medicament.image}
                          alt={medicament.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium">{medicament.name}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Stock: {medicament.quantity}</span>
                          <div className="ml-3 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                medicament.quantity < 5 ? 'bg-red-500' : 
                                medicament.quantity < 10 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${(medicament.quantity / 50) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      medicament.quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {medicament.quantity < 5 ? 'CRITIQUE' : 'FAIBLE'}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/pharmacien/medicaments/new"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <PlusCircle className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Ajouter médicament</p>
                <p className="text-sm text-gray-600">Nouveau produit</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/pharmacien/commandes"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Gérer commandes</p>
                <p className="text-sm text-gray-600">Traiter les demandes</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/pharmacien/statistics"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Voir statistiques</p>
                <p className="text-sm text-gray-600">Analyser les ventes</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/pharmacien/settings"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium">Paramètres</p>
                <p className="text-sm text-gray-600">Configurer la pharmacie</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PharmacienDashboard;