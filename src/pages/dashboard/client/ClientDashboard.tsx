// src/pages/dashboard/client/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  History,
  Star,
  MapPin,
  Bell,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { commandeService } from '../../../services/api/commande.service';
import { Commande } from '../../../types/commande.types';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCommandes: 0,
    enCours: 0,
    livrees: 0,
    montantTotal: 0,
  });

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const response = await commandeService.getAll({ user_id: user?.id });
      const data = response.data || [];
      
      setCommandes(data.slice(0, 5)); // 5 dernières commandes
      
      // Calculer les statistiques
      setStats({
        totalCommandes: data.length,
        enCours: data.filter(c => c.status === 'en_cours').length,
        livrees: data.filter(c => c.status === 'livree').length,
        montantTotal: data.reduce((sum, c) => sum + c.total_amount, 0),
      });
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-purple-100 text-purple-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenue, {user?.name} 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos commandes et découvrez nos services
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {user?.address || 'Lomé, Togo'}
            </span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Nouvelle commande
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Commandes totales</p>
              <p className="text-3xl font-bold mt-2">{stats.totalCommandes}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En cours</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{stats.enCours}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Livrées</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">{stats.livrees}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Montant total</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">
                {stats.montantTotal.toLocaleString()} FCFA
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

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
              <History className="h-5 w-5 mr-2 text-blue-600" />
              Commandes récentes
            </h3>
            <Link
              to="/client/commandes"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir toutes →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des commandes...</p>
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Aucune commande pour le moment</p>
              <Link
                to="/medicaments"
                className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Faire ma première commande →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {commandes.map((commande) => (
                <div
                  key={commande.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">#{commande.numero_commande}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commande.status)}`}>
                        {commande.status}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <span>{commande.pharmacy?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{commande.total_amount.toLocaleString()} FCFA</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(commande.created_at)}</span>
                    </div>
                  </div>
                  <Link
                    to={`/client/commandes/${commande.id}`}
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Détails
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/medicaments"
                className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Acheter des médicaments</p>
                    <p className="text-sm text-gray-600">Parcourir le catalogue</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/client/cart"
                className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Voir mon panier</p>
                    <p className="text-sm text-gray-600">Continuer mes achats</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/pharmacies"
                className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium">Trouver une pharmacie</p>
                    <p className="text-sm text-gray-600">Pharmacies de garde</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/client/profile"
                className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium">Mon profil</p>
                    <p className="text-sm text-gray-600">Gérer mes informations</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Prochaine livraison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-green-600" />
              Prochaine livraison
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Numéro de suivi</span>
                <span className="font-medium">#TRK-789456</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Statut</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  En cours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimation</span>
                <span className="font-medium">Dans 2 heures</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Livreur</span>
                <span className="font-medium">Koffi A.</span>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Suivre la livraison
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard;