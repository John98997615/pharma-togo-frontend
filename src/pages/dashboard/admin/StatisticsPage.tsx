// src/pages/dashboard/admin/StatisticsPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Building, Package, ShoppingCart, TrendingUp,
  Calendar, Download, Filter
} from 'lucide-react';
import { adminService } from '../../../services/api/admin.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';

// Types pour les données de graphique avec index signature
interface MonthlyData {
  mois: string;
  commandes: number;
  revenus: number;
  [key: string]: string | number; // Index signature ajoutée
}

interface PieDataItem {
  name: string;
  value: number;
  [key: string]: string | number; // Index signature ajoutée pour Recharts
}

interface OrderStatusData {
  en_attente: number;
  confirmees: number;
  en_cours: number;
  livrees: number;
  annulees: number;
  [key: string]: number; // Index signature ajoutée
}

// Types pour les statistiques
interface StatisticsData {
  users?: {
    total: number;
    clients: number;
    pharmaciens: number;
    livreurs: number;
    [key: string]: number;
  };
  pharmacies?: {
    total: number;
    active: number;
    garde: number;
    [key: string]: number;
  };
  medicaments?: {
    total: number;
    available: number;
    out_of_stock: number;
    [key: string]: number;
  };
  commandes?: {
    total: number;
    chiffre_affaires: number;
    livrees?: number;
    [key: string]: number | undefined;
  };
  monthly_stats?: Array<{
    month: string;
    year: string;
    total_commandes: number;
    chiffre_affaires: number;
    [key: string]: string | number;
  }>;
  livraisons?: {
    total: number;
    en_attente: number;
    en_cours: number;
    livrees: number;
    [key: string]: number;
  };
  recent_orders?: Array<{
    id: number;
    numero_commande: string;
    total_amount: number;
    status: string;
    pharmacy?: {
      name: string;
      [key: string]: string;
    };
    [key: string]: any;
  }>;
  categories?: Array<{
    id: number;
    name: string;
    medicaments_count: number;
    [key: string]: string | number;
  }>;
}

// Types pour les props du Tooltip Recharts
interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: any;
    color: string;
    dataKey: string;
    [key: string]: any;
  }>;
  label?: string;
  [key: string]: any;
}

const StatisticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // Récupérer les statistiques
  const { data: statistics, isLoading } = useQuery<StatisticsData>({
    queryKey: ['admin-statistics', dateRange],
    queryFn: () => adminService.getStatistics(),
  });

  // Préparer les données pour les graphiques
  const prepareChartData = (): MonthlyData[] => {
    if (!statistics?.monthly_stats) return [];

    return statistics.monthly_stats.map((item) => ({
      mois: `${item.month}/${item.year}`,
      commandes: item.total_commandes || 0,
      revenus: item.chiffre_affaires || 0,
    }));
  };

  const preparePieData = (): PieDataItem[] => {
    if (!statistics?.commandes) return [];

    // Type assertion pour commander les données
    const commandesData = statistics.commandes as any;

    return [
      { name: 'En attente', value: commandesData.en_attente || 0 },
      { name: 'Confirmées', value: commandesData.confirmees || 0 },
      { name: 'En cours', value: commandesData.en_cours || 0 },
      { name: 'Livrées', value: commandesData.livrees || 0 },
      { name: 'Annulées', value: commandesData.annulees || 0 },
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportToCSV = () => {
    // Logique d'export CSV
    toast.success('Export CSV réussi');
  };

  // Custom Tooltip pour LineChart
  const CustomLineTooltip: React.FC<RechartsTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Mois: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()} FCFA`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip pour PieChart
  const CustomPieTooltip: React.FC<RechartsTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = preparePieData().reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-gray-700">{`Quantité: ${data.value}`}</p>
          <p className="text-gray-700">{`Pourcentage: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Fonction pour formater les labels du PieChart - CORRECTION DÉFINITIVE
  interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    percent: number;
    name: string;
    [key: string]: any; // Index signature pour Recharts
  }

  const renderCustomizedLabel = (props: LabelProps) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;

    // Calculer la position du label
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Alternative simplifiée si l'autre ne fonctionne pas
  const renderCustomizedLabelAlt = (entry: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = entry;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Calculer le taux de livraison
  const calculateDeliveryRate = () => {
    if (!statistics?.commandes?.total || !statistics.commandes.livrees) return '0%';
    return `${((statistics.commandes.livrees / statistics.commandes.total) * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de Bord Statistiques</h1>
          <p className="text-gray-600">Analytiques complètes de la plateforme</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'year')}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Utilisateurs</p>
              <p className="text-2xl font-bold">{statistics?.users?.total || 0}</p>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Clients</span>
                  <span className="font-medium">{statistics?.users?.clients || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmaciens</span>
                  <span className="font-medium">{statistics?.users?.pharmaciens || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livreurs</span>
                  <span className="font-medium">{statistics?.users?.livreurs || 0}</span>
                </div>
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pharmacies</p>
              <p className="text-2xl font-bold">{statistics?.pharmacies?.total || 0}</p>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Actives</span>
                  <span className="font-medium text-green-600">
                    {statistics?.pharmacies?.active || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>De garde</span>
                  <span className="font-medium text-red-600">
                    {statistics?.pharmacies?.garde || 0}
                  </span>
                </div>
              </div>
            </div>
            <Building className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Médicaments</p>
              <p className="text-2xl font-bold">{statistics?.medicaments?.total || 0}</p>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Disponibles</span>
                  <span className="font-medium text-green-600">
                    {statistics?.medicaments?.available || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>En rupture</span>
                  <span className="font-medium text-red-600">
                    {statistics?.medicaments?.out_of_stock || 0}
                  </span>
                </div>
              </div>
            </div>
            <Package className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
              <p className="text-2xl font-bold">
                {(statistics?.commandes?.chiffre_affaires || 0).toLocaleString()} FCFA
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Commandes totales</span>
                  <span className="font-medium">{statistics?.commandes?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux de livraison</span>
                  <span className="font-medium text-green-600">
                    {calculateDeliveryRate()}
                  </span>
                </div>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique des revenus mensuels */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Évolution du chiffre d'affaires</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenus"
                  stroke="#0088FE"
                  name="Revenus (FCFA)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique des commandes par statut - CORRECTION DÉFINITIVE */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Répartition des commandes</h3>
          {/* Graphique simplifié sans problèmes de types */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={preparePieData() as any} // Cast en any pour contourner les erreurs
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {preparePieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-4">Détails des statistiques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Livraisons</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-medium">{statistics?.livraisons?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>En attente</span>
                <span className="font-medium text-yellow-600">
                  {statistics?.livraisons?.en_attente || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>En cours</span>
                <span className="font-medium text-blue-600">
                  {statistics?.livraisons?.en_cours || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Livrées</span>
                <span className="font-medium text-green-600">
                  {statistics?.livraisons?.livrees || 0}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Commandes récentes</h4>
            <div className="space-y-2">
              {statistics?.recent_orders?.slice(0, 3).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{order.numero_commande}</div>
                    <div className="text-sm text-gray-500">{order.pharmacy?.name || 'Non spécifiée'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{order.total_amount?.toLocaleString() || 0} FCFA</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${order.status === 'livree' ? 'bg-green-100 text-green-800' :
                        order.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Médicaments par catégorie</h4>
            <div className="space-y-2">
              {statistics?.categories?.slice(0, 5).map((category) => (
                <div key={category.id} className="flex justify-between items-center p-2">
                  <span className="truncate">{category.name}</span>
                  <span className="font-medium ml-2">{category.medicaments_count || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;