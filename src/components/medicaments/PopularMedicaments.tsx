// src/components/medicaments/PopularMedicaments.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { medicamentService } from '../../services/api/medicament.service';
import MedicamentCard from './MedicamentCard';
import { Medicament } from '../../types/medicament.types';

interface PopularMedicamentsProps {
  limit?: number;
}

const PopularMedicaments: React.FC<PopularMedicamentsProps> = ({ limit = 8 }) => {
  const { data: medicamentsData, isLoading, error } = useQuery({
    queryKey: ['popular-medicaments'],
    queryFn: () => medicamentService.getAll(),
  });

  const medicaments = medicamentsData?.data || [];
  const displayedMedicaments = medicaments.slice(0, limit);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">Impossible de charger les médicaments</p>
        <Link to="/medicaments" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Voir tous les médicaments
        </Link>
      </div>
    );
  }

  if (displayedMedicaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">Aucun médicament disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayedMedicaments.map((medicament: Medicament) => (
        <MedicamentCard
          key={medicament.id}
          medicament={medicament}
          showActions={false}
        />
      ))}
    </div>
  );
};

export default PopularMedicaments;