// src/components/commandes/CommandeList.tsx
import React from 'react';
import { Commande } from '../../types/commande.types';
import CommandeCard from './CommandeCard';
import { ShoppingCart, Filter } from 'lucide-react';

interface CommandeListProps {
  commandes: Commande[];
  loading: boolean;
  error?: string;
  showActions?: boolean;
  onStatusUpdate?: (id: number, status: string) => void;
  onFilterChange?: (filters: any) => void;
}

const CommandeList: React.FC<CommandeListProps> = ({
  commandes,
  loading,
  error,
  showActions,
  onStatusUpdate,
  onFilterChange,
}) => {
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [dateFilter, setDateFilter] = React.useState<string>('all');

  const statuses = [
    { value: 'all', label: 'Toutes' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmées' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'livree', label: 'Livrées' },
    { value: 'annulee', label: 'Annulées' },
  ];

  const dateRanges = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
  ];

  const filteredCommandes = React.useMemo(() => {
    let filtered = [...commandes];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(commande => commande.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(commande => 
            new Date(commande.created_at) >= today
          );
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(commande => 
            new Date(commande.created_at) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(commande => 
            new Date(commande.created_at) >= monthAgo
          );
          break;
      }
    }

    return filtered;
  }, [commandes, statusFilter, dateFilter]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-700">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
        <p className="text-gray-600">Vous n'avez pas encore de commandes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredCommandes.length} commande{filteredCommandes.length !== 1 ? 's' : ''} trouvée{filteredCommandes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredCommandes.map((commande) => (
          <CommandeCard
            key={commande.id}
            commande={commande}
            showActions={showActions}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>

      {/* Pagination (si nécessaire) */}
      {filteredCommandes.length > 10 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Précédent
          </button>
          <span className="px-4 py-2">Page 1 sur 3</span>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default CommandeList;