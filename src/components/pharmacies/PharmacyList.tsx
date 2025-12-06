// src/components/pharmacies/PharmacyList.tsx
import React, { useEffect, useState } from 'react';
import { pharmacyService } from '../../services/api/pharmacy.service';
import { Pharmacy } from '../../types/pharmacy.types';
import PharmacyCard from './PharmacyCard';
import { Filter, MapPin } from 'lucide-react';

const PharmacyList: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    garde: false,
    search: '',
  });

  useEffect(() => {
    fetchPharmacies();
  }, [filters.garde]);

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

  if (loading) return <div className="text-center py-8">Chargement des pharmacies...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filtres */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une pharmacie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.garde}
                onChange={(e) => setFilters({ ...filters, garde: e.target.checked })}
                className="sr-only"
              />
              <div className={`relative w-12 h-6 rounded-full ${filters.garde ? 'bg-red-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.garde ? 'transform translate-x-6' : ''}`}></div>
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