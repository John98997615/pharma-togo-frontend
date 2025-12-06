// src/pages/dashboard/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Package,
  Truck,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../../services/api/admin.service';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPharmacies: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingPharmacies: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simuler les données (remplacer par les appels API réels)
      const statistics = await adminService.getStatistics();
      const recentOrders = await adminService.getRecentOrders();
      
      setStats({
        totalUsers: 1245,
        totalPharmacies: 89,
        totalOrders: 3456,
        totalRevenue: 12450000,
        activeUsers: 890,
        pendingPharmacies: 12,
        todayOrders: 45,
        todayRevenue: 125000,
      });
      
      setRecentActivities([
        { id: 1, type: 'order', user: 'John Doe', action: 'a passé une commande', time: 'Il y a 5 min', amount: 15000 },
        { id: 2, type: 'user', user: 'Alice Smith', action: 's\'est inscrit', time: 'Il y a 15 min' },
        { id: 3, type: 'pharmacy', user: 'Pharmacie du Centre', action: 'a été approuvée', time: 'Il y a 30 min' },
        { id: 4, type: 'payment', user: 'Mohamed Ali', action: 'a effectué un paiement', time: 'Il y a 1h', amount: 25000 },
        { id: 5, type: 'delivery', user: 'Livreur #12', action: 'a livré une commande', time: 'Il y a 2h' },
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    change, 
    changeType 
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Tableau de bord Administrateur
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenue, {user?.name}. Gestion complète de la plateforme PharmaTogo
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Utilisateurs totaux"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change="12"
          changeType="increase"
        />
        
        <StatCard
          title="Pharmacies"
          value={stats.totalPharmacies}
          icon={Building}
          color="bg-green-500"
          change="8"
          changeType="increase"
        />
        
        <StatCard
          title="Commandes totales"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-purple-500"
          change="15"
          changeType="increase"
        />
        
        <StatCard
          title="Revenu total"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="bg-yellow-500"
          change="18"
          changeType="increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Aperçu des performances
            </h3>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>Ce mois</option>
              <option>Le mois dernier</option>
              <option>Cette année</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Utilisateurs actifs</span>
                <span className="font-medium">{stats.activeUsers}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Pharmacies en attente</span>
                <span className="font-medium text-yellow-600">{stats.pendingPharmacies}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${(stats.pendingPharmacies / stats.totalPharmacies) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Commandes aujourd'hui</span>
                <span className="font-medium">{stats.todayOrders}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(stats.todayOrders / 100) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Revenu aujourd'hui</span>
                <span className="font-medium">{stats.todayRevenue.toLocaleString()} FCFA</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(stats.todayRevenue / 1000000) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Activités récentes
          </h3>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'order' ? 'bg-purple-100' :
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'pharmacy' ? 'bg-green-100' :
                  activity.type === 'payment' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-purple-600" />}
                  {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'pharmacy' && <Building className="h-4 w-4 text-green-600" />}
                  {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-yellow-600" />}
                  {activity.type === 'delivery' && <Truck className="h-4 w-4 text-red-600" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user} <span className="font-normal text-gray-600">{activity.action}</span>
                  </p>
                  {activity.amount && (
                    <p className="text-sm text-gray-500">{activity.amount.toLocaleString()} FCFA</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Link
            to="/admin/activities"
            className="block mt-6 text-center text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir toutes les activités →
          </Link>
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Gérer utilisateurs</p>
                <p className="text-sm text-gray-600">Ajouter, modifier, supprimer</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/pharmacies"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Building className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Gérer pharmacies</p>
                <p className="text-sm text-gray-600">Approuver, suspendre</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/statistics"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Voir statistiques</p>
                <p className="text-sm text-gray-600">Analyses détaillées</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/settings"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Package className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium">Paramètres système</p>
                <p className="text-sm text-gray-600">Configurer la plateforme</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;