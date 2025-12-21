// src/components/pharmacies/PharmacyList.tsx
import React, { useEffect, useState } from 'react';
import { pharmacyService } from '../../services/api/pharmacy.service';
import { Pharmacy } from '../../types/pharmacy.types';
import PharmacyCard from './PharmacyCard';
import { Filter, MapPin, Search } from 'lucide-react';

interface PharmacyListProps {
  initialFilters?: {
    garde?: boolean;
    search?: string;
  };
}

const PharmacyList: React.FC<PharmacyListProps> = ({ initialFilters }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    garde: initialFilters?.garde || false,
    search: initialFilters?.search || '',
  });

  // Charger les pharmacies UNE FOIS
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        const data = await pharmacyService.getAll({
          garde: filters.garde || undefined,
          search: filters.search || undefined,
        });
        setPharmacies(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    // Délai pour éviter les appels API trop fréquents
    const timeoutId = setTimeout(fetchPharmacies, 300);
    return () => clearTimeout(timeoutId);
  }, [filters.garde, filters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleGardeToggle = () => {
    setFilters({ ...filters, garde: !filters.garde });
  };

  if (loading && pharmacies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des pharmacies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="inline-block bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filtres */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une pharmacie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.garde}
                onChange={handleGardeToggle}
                className="sr-only"
              />
              <div className={`relative w-12 h-6 rounded-full transition-colors ${
                filters.garde ? 'bg-red-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  filters.garde ? 'transform translate-x-6' : ''
                }`}></div>
              </div>
              <span className="ml-3 font-medium flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Pharmacies de garde seulement
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Liste des pharmacies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacy) => (
          <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
        ))}
      </div>

      {pharmacies.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Aucune pharmacie trouvée</p>
          <p className="text-sm">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
};

export default PharmacyList;