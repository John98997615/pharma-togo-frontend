// src/pages/dashboard/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
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
  ArrowDownRight,
  AlertCircle,
  Settings, // Ajout de l'icône Settings
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../../services/api/admin.service';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPharmacies: number;
  pendingPharmacies: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  activePharmacies: number;
  inactivePharmacies: number;
  pharmaciesGarde: number;
}

interface RecentActivity {
  id: number;
  type: 'order' | 'user' | 'pharmacy' | 'payment' | 'delivery';
  user: string;
  action: string;
  time: string;
  amount?: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook pour la navigation
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPharmacies: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingPharmacies: 0,
    todayOrders: 0,
    todayRevenue: 0,
    activePharmacies: 0,
    inactivePharmacies: 0,
    pharmaciesGarde: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les statistiques de l'API
  const { data: apiStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: async () => {
      try {
        const stats = await adminService.getStatistics();
        console.log('Statistiques API:', stats);
        return stats;
      } catch (error) {
        console.error('Erreur stats API:', error);
        toast.error('Erreur lors du chargement des statistiques');
        throw error;
      }
    }
  });

  // Récupérer les commandes récentes
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => adminService.getRecentOrders(),
  });

  // Récupérer les pharmacies en attente
  const { data: pendingPharmacies, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-pharmacies'],
    queryFn: () => adminService.getPendingPharmacies(),
  });

  useEffect(() => {
    if (apiStats) {
      processStats(apiStats);
    }
  }, [apiStats, recentOrders, pendingPharmacies]);

  const processStats = (stats: any) => {
    try {
      console.log('Processing stats:', stats);

      // Calculer les statistiques aujourd'hui (simulation basée sur les données existantes)
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Transformer les données de l'API
      const processedStats: DashboardStats = {
        totalUsers: stats.users?.total || 0,
        activeUsers: stats.users?.total || 0,
        totalPharmacies: stats.pharmacies?.total || 0,
        pendingPharmacies: Array.isArray(pendingPharmacies)
          ? pendingPharmacies.length
          : (pendingPharmacies as any)?.data?.length || 0,
        totalOrders: stats.commandes?.total || 0,
        totalRevenue: stats.commandes?.chiffre_affaires || 0,
        todayOrders: 0,
        todayRevenue: 0,
        activePharmacies: stats.pharmacies?.active || 0,
        inactivePharmacies: stats.pharmacies?.inactive || 0,
        pharmaciesGarde: stats.pharmacies?.garde || 0
      };

      // Calculer les commandes d'aujourd'hui
      if (recentOrders) {
        const ordersArray = Array.isArray(recentOrders)
          ? recentOrders
          : recentOrders.data || [];

        const todayOrders = ordersArray.filter((order: any) => {
          const orderDate = new Date(order.created_at || order.date).toISOString().split('T')[0];
          return orderDate === todayString;
        });

        processedStats.todayOrders = todayOrders.length;
        processedStats.todayRevenue = todayOrders.reduce(
          (sum: number, order: any) => sum + (order.total_amount || 0),
          0
        );
      }

      setDashboardStats(processedStats);

      // Générer les activités récentes
      if (recentOrders) {
        generateRecentActivities(recentOrders);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du traitement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  };

  const generateRecentActivities = (orders: any) => {
    const activities: RecentActivity[] = [];
    const ordersArray = Array.isArray(orders) ? orders : orders.data || [];

    // Convertir les commandes récentes en activités
    ordersArray.slice(0, 5).forEach((order: any) => {
      activities.push({
        id: order.id,
        type: 'order',
        user: order.user?.name || 'Client',
        action: 'a passé une commande',
        time: calculateTimeAgo(order.created_at),
        amount: order.total_amount
      });
    });

    // Ajouter des activités pour les pharmacies en attente
    if (pendingPharmacies) {
      const pharmaciesArray = Array.isArray(pendingPharmacies)
        ? pendingPharmacies
        : ((pendingPharmacies as any)?.data || []);

      pharmaciesArray.slice(0, 2).forEach((pharmacy: any) => {
        activities.push({
          id: pharmacy.id + 1000,
          type: 'pharmacy',
          user: pharmacy.name,
          action: 'est en attente d\'approbation',
          time: calculateTimeAgo(pharmacy.created_at)
        });
      });
    }

    // Trier par date (les plus récentes d'abord)
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setRecentActivities(activities.slice(0, 5));
  };

  const calculateTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else {
      return `Il y a ${diffDays} jours`;
    }
  };

  const refreshDashboard = () => {
    window.location.reload();
  };

  // Fonction pour formater le montant correctement
  const formatAmount = (amount: number): string => {
    if (!amount) return '0';

    // S'assurer que c'est un nombre
    const num = Number(amount);
    if (isNaN(num)) return '0';

    // Formater avec séparateurs de milliers
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Fonction pour aller vers la page d'activités
  const goToActivities = () => {
    // Rediriger vers la page de commandes (le plus proche des activités)
    navigate('/admin/pharmacies');
  };

  // Fonction pour aller vers les paramètres système
  const goToSystemSettings = () => {
    // Pour l'instant, rediriger vers les statistiques
    navigate('/admin/settings');
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    changeType,
    loading: cardLoading = false,
    subtitle
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          {cardLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-2"></div>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-bold mt-2">
                {typeof value === 'number'
                  ? formatAmount(value)
                  : value}
              </p>
              {subtitle && (
                <div className="mt-1 text-xs text-gray-500">
                  {subtitle}
                </div>
              )}
              {change && (
                <div className="flex items-center mt-2">
                  {changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center ml-4 flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading || statsLoading || ordersLoading) {
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
    <div className="p-4 sm:p-6">
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
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium whitespace-nowrap">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <button
              onClick={refreshDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center whitespace-nowrap"
            >
              <Activity className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </motion.div>

      {/* Alertes importantes */}
      {dashboardStats.pendingPharmacies > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">
                  {dashboardStats.pendingPharmacies} pharmacie(s) en attente d'approbation
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  <Link to="/admin/pharmacies" className="underline hover:text-yellow-900">
                    Cliquez ici pour les examiner →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Utilisateurs totaux"
          value={dashboardStats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change="12"
          changeType="increase"
          loading={loading}
        />

        <StatCard
          title="Pharmacies"
          value={dashboardStats.totalPharmacies}
          icon={Building}
          color="bg-green-500"
          change="8"
          changeType="increase"
          loading={loading}
          subtitle={`${dashboardStats.activePharmacies} actives • ${dashboardStats.inactivePharmacies} inactives`}
        />

        <StatCard
          title="Commandes totales"
          value={dashboardStats.totalOrders}
          icon={ShoppingCart}
          color="bg-purple-500"
          change="15"
          changeType="increase"
          loading={loading}
        />

        <StatCard
          title="Revenu total"
          value={`${formatAmount(dashboardStats.totalRevenue)} FCFA`}
          icon={TrendingUp} // ✅ Montre la croissance
          color="bg-green-500" // ✅ Vert pour l'argent/succès
          change="18"
          changeType="increase"
          loading={loading}
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
                <span className="font-medium">{formatAmount(dashboardStats.activeUsers)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${dashboardStats.totalUsers > 0
                      ? Math.min((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100, 100)
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Pharmacies en attente</span>
                <span className="font-medium text-yellow-600">
                  {formatAmount(dashboardStats.pendingPharmacies)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{
                    width: `${dashboardStats.totalPharmacies > 0
                      ? Math.min((dashboardStats.pendingPharmacies / dashboardStats.totalPharmacies) * 100, 100)
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Pharmacies de garde</span>
                <span className="font-medium text-red-600">
                  {formatAmount(dashboardStats.pharmaciesGarde)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${dashboardStats.totalPharmacies > 0
                      ? Math.min((dashboardStats.pharmaciesGarde / dashboardStats.totalPharmacies) * 100, 100)
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Commandes aujourd'hui</span>
                <span className="font-medium">{formatAmount(dashboardStats.todayOrders)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${dashboardStats.totalOrders > 0
                      ? Math.min((dashboardStats.todayOrders / dashboardStats.totalOrders) * 100, 100)
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Revenu aujourd'hui</span>
                <span className="font-medium">{formatAmount(dashboardStats.todayRevenue)} FCFA</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${dashboardStats.totalRevenue > 0
                      ? Math.min((dashboardStats.todayRevenue / dashboardStats.totalRevenue) * 100, 100)
                      : 0}%`
                  }}
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
            {recentActivities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Aucune activité récente</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'order' ? 'bg-purple-100' :
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
                      <span className="truncate">{activity.user}</span>{' '}
                      <span className="font-normal text-gray-600">{activity.action}</span>
                    </p>
                    {activity.amount !== undefined && (
                      <p className="text-sm text-gray-500">{formatAmount(activity.amount)} FCFA</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={goToActivities}
            className="w-full mt-6 text-center text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Voir toutes les activités →
          </button>
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
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Gérer utilisateurs</p>
                <p className="text-sm text-gray-600">
                  {formatAmount(dashboardStats.totalUsers)} utilisateurs
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/pharmacies"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
          >
            <div className="flex items-center">
              <Building className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Gérer pharmacies</p>
                <p className="text-sm text-gray-600">
                  {dashboardStats.pendingPharmacies > 0 ? (
                    <span className="text-yellow-600 font-medium">
                      {formatAmount(dashboardStats.pendingPharmacies)} en attente
                    </span>
                  ) : (
                    `${formatAmount(dashboardStats.totalPharmacies)} pharmacies`
                  )}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/statistics"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Statistiques détaillées</p>
                <p className="text-sm text-gray-600">
                  {formatAmount(dashboardStats.totalOrders)} commandes
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={goToSystemSettings}
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200 hover:border-yellow-300 text-left"
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium">Paramètres système</p>
                <p className="text-sm text-gray-600">Configurer la plateforme</p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;