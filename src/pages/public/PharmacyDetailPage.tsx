// src/pages/public/PharmacyDetailPage.tsx
import React, { useState, useMemo } from 'react';
import ImageWithFallback from '../../components/shared/ImageWithFallback';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  MapPin, Phone, Mail, Clock, Star, Heart,
  Navigation, Share2, Package, Users, Award,
  ShoppingCart, Search,
  Building2
} from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api';
import { pharmacyService } from '../../services/api/pharmacy.service';
import { medicamentService } from '../../services/api/medicament.service';
import { Medicament } from '../../types/medicament.types';

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const PharmacyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('medicaments');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'popular'
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  // Récupérer les détails de la pharmacie
  const { data: pharmacy, isLoading: pharmacyLoading } = useQuery({
    queryKey: ['pharmacy-details', id],
    queryFn: () => pharmacyService.getById(parseInt(id!)),
    enabled: !!id,
  });

  // Récupérer les médicaments de la pharmacie
  const { data: medicamentsResponse, isLoading: medicamentsLoading } = useQuery({
    queryKey: ['pharmacy-medicaments', id, filters],
    queryFn: () => medicamentService.getAll({
      pharmacy_id: parseInt(id!),
      search: filters.search || undefined,
      available: true,
    }),
    enabled: !!id,
  });

  // Extraire le tableau de médicaments de la réponse
  const medicamentsArray = medicamentsResponse?.data || [];

  const handleAddToCart = (medicament: Medicament) => {
    // TODO: Implémenter l'ajout au panier
    toast.success(`${medicament.name} ajouté au panier`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pharmacy?.name,
        text: `Découvrez ${pharmacy?.name} sur PharmaTogo`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const handleGetDirections = () => {
    if (pharmacy?.latitude && pharmacy?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Filtrer les médicaments
  const filteredMedicaments = useMemo(() => {
    return medicamentsArray.filter((medicament: Medicament) => {
      const matchesSearch = filters.search === '' ||
        medicament.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        medicament.description?.toLowerCase().includes(filters.search.toLowerCase());

      return matchesSearch;
    });
  }, [medicamentsArray, filters.search]);

  // Trier les médicaments
  const sortedAndFilteredMedicaments = useMemo(() => {
    const sorted = [...filteredMedicaments];

    switch (filters.sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  }, [filteredMedicaments, filters.sortBy]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      totalMedicaments: medicamentsArray.length || 0,
      availableMedicaments: medicamentsArray.filter((m: Medicament) => m.quantity > 0).length || 0,
      rating: 4.5,
      reviews: 128,
      yearsActive: pharmacy ? new Date().getFullYear() - new Date(pharmacy.created_at).getFullYear() : 0,
    };
  }, [medicamentsArray, pharmacy]);

  if (pharmacyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pharmacie non trouvée</h1>
          <p className="text-gray-600 mb-6">
            La pharmacie que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => navigate('/pharmacies')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voir toutes les pharmacies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo et informations */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col items-center text-center">
                {pharmacy.logo ? (
                  <ImageWithFallback
                    src={pharmacy.logo}
                    alt={pharmacy.name}
                    className="h-32 w-32 rounded-full object-cover mb-4"
                    fallbackIcon={<Building2 className="h-20 w-20 text-blue-600" />}
                    fallbackBg="bg-blue-100"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Building2 className="h-20 w-20 text-blue-600" />
                  </div>
                )}

                <h1 className="text-2xl font-bold mb-2">{pharmacy.name}</h1>

                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(stats.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {stats.rating} ({stats.reviews} avis)
                  </span>
                </div>

                {pharmacy.is_garde && (
                  <div className="mb-4 px-4 py-2 bg-red-100 text-red-800 rounded-full font-bold">
                    🚨 PHARMACIE DE GARDE
                  </div>
                )}

                <div className={`px-3 py-1 rounded-full text-sm mb-6 ${pharmacy.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {pharmacy.is_active ? '✅ Ouverte' : '❌ Fermée'}
                </div>

                {/* Informations de contact */}
                <div className="space-y-3 w-full">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{pharmacy.address}</span>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {pharmacy.phone}
                    </a>
                  </div>

                  {pharmacy.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <a
                        href={`mailto:${pharmacy.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {pharmacy.email}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {pharmacy.opening_time} - {pharmacy.closing_time}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3 w-full">
                  <button
                    onClick={handleGetDirections}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    Itinéraire
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Partager
                  </button>

                  <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Ajouter aux favoris
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <h3 className="font-bold mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Statistiques
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Médicaments total</span>
                  <span className="font-bold">{stats.totalMedicaments}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Disponibles</span>
                  <span className="font-bold text-green-600">{stats.availableMedicaments}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Note moyenne</span>
                  <span className="font-bold">{stats.rating}/5</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Années d'activité</span>
                  <span className="font-bold">{stats.yearsActive} ans</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="md:w-2/3">
            {/* Description */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">À propos de cette pharmacie</h2>
              <p className="text-gray-700 mb-4">
                {pharmacy.description || 'Aucune description disponible pour cette pharmacie.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold">{stats.totalMedicaments}</p>
                  <p className="text-sm text-gray-600">Produits</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold">Expert</p>
                  <p className="text-sm text-gray-600">Personnel</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-bold">{stats.yearsActive}+</p>
                  <p className="text-sm text-gray-600">Ans expérience</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-bold">Certifié</p>
                  <p className="text-sm text-gray-600">Qualité</p>
                </div>
              </div>
            </div>

            {/* Carte */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Localisation</h2>
              {isLoaded && pharmacy.latitude && pharmacy.longitude ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
                  zoom={15}
                >
                  <Marker
                    position={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
                    title={pharmacy.name}
                  />
                </GoogleMap>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-xl shadow">
              {/* Navigation des onglets */}
              <div className="border-b">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('medicaments')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'medicaments'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Package className="inline h-5 w-5 mr-2" />
                    Médicaments ({stats.totalMedicaments})
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'reviews'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Star className="inline h-5 w-5 mr-2" />
                    Avis ({stats.reviews})
                  </button>

                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'info'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Informations
                  </button>
                </div>
              </div>

              {/* Contenu des onglets */}
              <div className="p-6">
                {activeTab === 'medicaments' && (
                  <div>
                    {/* Filtres des médicaments */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Rechercher un médicament..."
                              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                              value={filters.search}
                              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                          >
                            <option value="popular">Les plus populaires</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="name_asc">Nom A-Z</option>
                            <option value="name_desc">Nom Z-A</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Liste des médicaments */}
                    {medicamentsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : sortedAndFilteredMedicaments.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Aucun médicament trouvé</p>
                        <p className="text-sm text-gray-400">Essayez de modifier vos filtres de recherche</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedAndFilteredMedicaments.map((medicament: Medicament) => (
                          <div key={medicament.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold">{medicament.name}</h4>
                                <p className="text-sm text-gray-500">{medicament.form}</p>
                              </div>
                              {medicament.requires_prescription && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Ordonnance
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {medicament.description || 'Pas de description'}
                            </p>

                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-green-600">
                                {medicament.price.toLocaleString()} FCFA
                              </span>
                              <span className={`text-sm px-2 py-1 rounded-full ${medicament.quantity > 10 ? 'bg-green-100 text-green-800' :
                                  medicament.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {medicament.quantity > 0 ? 'En stock' : 'Rupture'}
                              </span>
                            </div>

                            <button
                              onClick={() => handleAddToCart(medicament)}
                              disabled={medicament.quantity === 0}
                              className={`w-full py-2 rounded-lg font-medium ${medicament.quantity === 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                              <ShoppingCart className="inline h-4 w-4 mr-2" />
                              Ajouter au panier
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucun avis pour le moment</p>
                    <p className="text-sm text-gray-400">Soyez le premier à noter cette pharmacie</p>
                  </div>
                )}

                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">Services offerts</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Vente de médicaments sur ordonnance</li>
                        <li>Vente de produits de parapharmacie</li>
                        <li>Conseils pharmaceutiques</li>
                        <li>Livraison à domicile</li>
                        <li>Service de garde {pharmacy.is_garde ? '(actif)' : '(non actif)'}</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">Moyens de paiement</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Espèces</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Mobile Money</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Carte bancaire</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">Accessibilité</h3>
                      <p className="text-gray-600">
                        Pharmacie facilement accessible, située au centre-ville avec parking disponible.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetailPage;