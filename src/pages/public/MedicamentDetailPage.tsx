import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Package, Star, ShoppingCart, Heart, Share2,
  MapPin, Clock, Truck, Shield, AlertTriangle,
  ChevronLeft, Minus, Plus,
  Phone
} from 'lucide-react';
import { medicamentService } from '../../services/api/medicament.service';
import { pharmacyService } from '../../services/api/pharmacy.service';

const MedicamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);

  // Récupérer les détails du médicament
  const { data: medicament, isLoading } = useQuery({
    queryKey: ['medicament-details', id],
    queryFn: () => medicamentService.getById(parseInt(id!)),
    enabled: !!id,
  });

  // Récupérer les pharmacies qui ont ce médicament
  const { data: pharmacies } = useQuery({
    queryKey: ['medicament-pharmacies', medicament?.name],
    queryFn: () => pharmacyService.getAll({
      search: medicament?.name,
    }),
    enabled: !!medicament,
  });

  const handleAddToCart = () => {
    if (!medicament) return;
    
    // Vérifier si une pharmacie est sélectionnée
    if (!selectedPharmacy && pharmacies && pharmacies.length > 0) {
      toast.error('Veuillez sélectionner une pharmacie');
      return;
    }

    // TODO: Implémenter l'ajout au panier
    toast.success(`${medicament.name} (x${quantity}) ajouté au panier`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // TODO: Rediriger vers le panier ou le checkout
  };

  const handleShare = () => {
    if (navigator.share && medicament) {
      navigator.share({
        title: medicament.name,
        text: `Découvrez ${medicament.name} sur PharmaTogo`,
        url: window.location.href,
      });
    } else if (medicament) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      if (medicament && quantity < medicament.quantity) {
        setQuantity(quantity + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!medicament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Médicament non trouvé</h1>
          <p className="text-gray-600 mb-6">
            Le médicament que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => navigate('/medicaments')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voir tous les médicaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-2" />
        Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image */}
              <div className="md:w-1/3">
                {medicament.image ? (
                  <img
                    src={medicament.image}
                    alt={medicament.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-32 w-32 text-blue-600" />
                  </div>
                )}
                
                {/* Actions sur l'image */}
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-blue-600"
                    title="Partager"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="Ajouter aux favoris"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Détails */}
              <div className="md:w-2/3">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-2xl font-bold">{medicament.name}</h1>
                    {medicament.requires_prescription && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                        Ordonnance requise
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">4.5 (124 avis)</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600">{medicament.pharmacy?.name}</span>
                  </div>
                  
                  <div className="text-3xl font-bold text-green-600 mb-6">
                    {medicament.price.toLocaleString()} FCFA
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Description</h3>
                  <p className="text-gray-700">
                    {medicament.description || 'Aucune description disponible.'}
                  </p>
                </div>
                
                {/* Caractéristiques */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Forme</p>
                    <p className="font-medium">{medicament.form || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dosage</p>
                    <p className="font-medium">{medicament.dosage || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p className="font-medium">{medicament.category?.name || 'Non catégorisé'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock disponible</p>
                    <p className={`font-medium ${
                      medicament.quantity > 10 ? 'text-green-600' :
                      medicament.quantity > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {medicament.quantity} unités
                    </p>
                  </div>
                </div>
                
                {/* Sélecteur de quantité */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Quantité</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange('decrease')}
                        disabled={quantity <= 1}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="w-12 text-center font-bold">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange('increase')}
                        disabled={medicament.quantity <= quantity}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <span className="text-gray-500">
                      {medicament.quantity} disponible(s)
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={medicament.quantity === 0}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      medicament.quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShoppingCart className="inline h-5 w-5 mr-2" />
                    Ajouter au panier
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={medicament.quantity === 0}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      medicament.quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Acheter maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informations supplémentaires */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-6">Informations complémentaires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Précautions d'utilisation
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Conserver à température ambiante</li>
                  <li>• Tenir hors de portée des enfants</li>
                  <li>• Respecter la posologie indiquée</li>
                  <li>• Ne pas utiliser après la date d'expiration</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Contre-indications
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Hypersensibilité au principe actif</li>
                  <li>• Grossesse et allaitement</li>
                  <li>• Insuffisance hépatique sévère</li>
                  <li>• Interaction avec d'autres médicaments</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold mb-3 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-blue-600" />
                Livraison
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800">
                  Livraison disponible dans les 24h. Frais de livraison: 1 000 FCFA.
                  Livraison gratuite à partir de 20 000 FCFA d'achat.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pharmacies disponibles */}
        <div>
          <div className="bg-white rounded-xl shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Disponible dans ces pharmacies
            </h2>
            
            {pharmacies && pharmacies.length > 0 ? (
              <div className="space-y-4">
                {pharmacies.slice(0, 3).map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPharmacy?.id === pharmacy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div className="flex items-start mb-3">
                      {pharmacy.logo ? (
                        <img
                          src={pharmacy.logo}
                          alt={pharmacy.name}
                          className="h-12 w-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-bold">{pharmacy.name}</h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{pharmacy.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{pharmacy.opening_time} - {pharmacy.closing_time}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{pharmacy.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pharmacy.is_garde ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pharmacy.is_garde ? 'Pharmacie de garde' : 'Pharmacie normale'}
                      </span>
                      
                      {selectedPharmacy?.id === pharmacy.id && (
                        <span className="text-blue-600 font-medium">✓ Sélectionnée</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {pharmacies.length > 3 && (
                  <button className="w-full py-2 text-center text-blue-600 hover:text-blue-800 font-medium">
                    Voir {pharmacies.length - 3} pharmacies supplémentaires
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Non disponible en pharmacie</p>
                <p className="text-sm">Essayez une autre recherche</p>
              </div>
            )}
            
            {/* Résumé de commande */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold mb-4">Résumé de commande</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{medicament.name} x{quantity}</span>
                  <span className="font-medium">
                    {(medicament.price * quantity).toLocaleString()} FCFA
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-medium">1 000 FCFA</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-600">
                    {(medicament.price * quantity + 1000).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleBuyNow}
                disabled={medicament.quantity === 0 || !selectedPharmacy}
                className={`w-full py-3 rounded-lg font-medium ${
                  medicament.quantity === 0 || !selectedPharmacy
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Commander maintenant
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Livraison estimée: 24h • Paiement sécurisé
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicamentDetailPage;