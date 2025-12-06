// src/components/medicaments/MedicamentCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Pill, AlertTriangle, Plus, Star, Shield } from 'lucide-react';
import { Medicament } from '../../types/medicament.types';

interface MedicamentCardProps {
  medicament: Medicament;
  showActions?: boolean;
  onAddToCart?: (medicament: Medicament) => void;
  onEdit?: (medicament: Medicament) => void;
  onDelete?: (id: number) => void;
  onStockAdjust?: (id: number, adjustment: number) => void;
}

const MedicamentCard: React.FC<MedicamentCardProps> = ({
  medicament,
  showActions = false,
  onAddToCart,
  onEdit,
  onDelete,
  onStockAdjust
}) => {
  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800';
    if (quantity < 50) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockLabel = (quantity: number) => {
    if (quantity === 0) return 'Rupture de stock';
    if (quantity < 10) return 'Stock faible';
    if (quantity < 50) return 'Stock modéré';
    return 'En stock';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-48 bg-gray-100 relative">
        {medicament.image ? (
          <img
            src={medicament.image}
            alt={medicament.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Pill className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {medicament.requires_prescription && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Shield className="h-3 w-3 mr-1" />
              Ordonnance
            </span>
          )}
          {medicament.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {medicament.category.name}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockColor(medicament.quantity)}`}>
            {medicament.quantity === 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
            {getStockLabel(medicament.quantity)}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Nom et pharmacie */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{medicament.name}</h3>
          {medicament.pharmacy && (
            <div className="flex items-center text-sm text-gray-600">
              <Package className="h-3 w-3 mr-1" />
              <Link 
                to={`/pharmacies/${medicament.pharmacy.id}`}
                className="hover:text-blue-600"
              >
                {medicament.pharmacy.name}
              </Link>
            </div>
          )}
        </div>

        {/* Description */}
        {medicament.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {medicament.description}
          </p>
        )}

        {/* Détails */}
        <div className="space-y-2 mb-4">
          {medicament.form && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium w-24">Forme:</span>
              <span>{medicament.form}</span>
            </div>
          )}
          {medicament.dosage && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium w-24">Dosage:</span>
              <span>{medicament.dosage}</span>
            </div>
          )}
        </div>

        {/* Prix et stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {medicament.price.toLocaleString()} FCFA
            </p>
            <p className="text-sm text-gray-500">Quantité: {medicament.quantity} unités</p>
          </div>
          {medicament.quantity < 10 && medicament.quantity > 0 && (
            <div className="text-xs text-yellow-600">
              <AlertTriangle className="inline h-3 w-3 mr-1" />
              Stock faible
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {!showActions && onAddToCart && medicament.quantity > 0 && (
            <button
              onClick={() => onAddToCart(medicament)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter au panier
            </button>
          )}

          {showActions && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(medicament)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
                >
                  Modifier
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(medicament.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200"
                >
                  Supprimer
                </button>
              )}

              {onStockAdjust && (
                <button
                  onClick={() => onStockAdjust(medicament.id, 10)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200"
                >
                  + Stock
                </button>
              )}
            </>
          )}

          <Link
            to={`/medicaments/${medicament.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicamentCard;