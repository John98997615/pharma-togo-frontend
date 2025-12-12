// src/pages/dashboard/client/CartPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { Medicament } from '../../../types/medicament.types';
import { toast } from 'react-hot-toast';

// Définir le type pour les items du panier
interface CartItemType {
  id: number;
  medicament: {
    id: number;
    name: string;
    price: number;
    image?: string;
    pharmacy: {
      id: number;
      name: string;
    };
  };
  quantity: number;
  pharmacyId: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([
    {
      id: 1,
      medicament: {
        id: 1,
        name: 'Paracétamol 500mg',
        price: 500,
        image: undefined,
        pharmacy: { 
          id: 1,
          name: 'Pharmacie du Centre' 
        }
      },
      quantity: 2,
      pharmacyId: 1
    },
    {
      id: 2,
      medicament: {
        id: 2,
        name: 'Vitamine C',
        price: 1500,
        image: undefined,
        pharmacy: { 
          id: 1,
          name: 'Pharmacie du Centre' 
        }
      },
      quantity: 1,
      pharmacyId: 1
    }
  ]);

  const updateQuantity = (itemId: number, change: number) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Produit retiré du panier');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.medicament.price * item.quantity);
    }, 0);
  };

  // Fonction utilitaire pour obtenir les IDs de pharmacies uniques
  const getUniquePharmacyIds = (items: CartItemType[]): number[] => {
    const ids = items.map(item => item.pharmacyId);
    const uniqueIds = Array.from(new Set(ids));
    return uniqueIds;
  };

  // Fonction utilitaire pour obtenir les noms de pharmacies uniques
  const getUniquePharmacyNames = (items: CartItemType[]): string[] => {
    const names = items.map(item => item.medicament.pharmacy.name);
    const uniqueNames = Array.from(new Set(names));
    return uniqueNames;
  };

  // Vérifier si tous les items sont de la même pharmacie
  const allSamePharmacy = (items: CartItemType[]): boolean => {
    if (items.length === 0) return true;
    const uniquePharmacyIds = getUniquePharmacyIds(items);
    return uniquePharmacyIds.length === 1;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    // Vérifier si tous les produits sont de la même pharmacie
    const uniquePharmacyIds = getUniquePharmacyIds(cartItems);
    
    if (uniquePharmacyIds.length > 1) {
      // Récupérer les noms des pharmacies différentes pour un meilleur message d'erreur
      const uniquePharmacyNames = getUniquePharmacyNames(cartItems);
      toast.error(`Veuillez commander d'une seule pharmacie à la fois. Vous avez des produits de: ${uniquePharmacyNames.join(', ')}`);
      return;
    }

    // Naviguer vers la page de commande
    navigate('/client/commandes/new', { 
      state: { 
        pharmacyId: uniquePharmacyIds[0],
        items: cartItems.map(item => ({
          medicament_id: item.medicament.id,
          quantity: item.quantity,
          price: item.medicament.price,
          name: item.medicament.name
        }))
      }
    });
  };

  const isAllSamePharmacy = allSamePharmacy(cartItems);
  const cartTotal = calculateTotal();
  const deliveryFee = 2000;
  const serviceFee = 500;
  const grandTotal = cartTotal + deliveryFee + serviceFee;

  if (cartItems.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
          <p className="text-gray-600 mb-6">Ajoutez des médicaments à votre panier pour commencer.</p>
          <Link
            to="/medicaments"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Package className="h-5 w-5 mr-2" />
            Voir les médicaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des produits */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold">Produits dans votre panier</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {item.medicament.image ? (
                        <img
                          src={item.medicament.image}
                          alt={item.medicament.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-gray-400" />
                      )}
                    </div>

                    {/* Détails */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{item.medicament.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.medicament.pharmacy.name}
                            {!isAllSamePharmacy && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                Pharmacie différente
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {(item.medicament.price * item.quantity).toLocaleString()} FCFA
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.medicament.price.toLocaleString()} FCFA l'unité
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avertissement si pharmacies différentes */}
          {!isAllSamePharmacy && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">
                    Attention : Vous avez des produits de pharmacies différentes
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Pour passer commande, tous les produits doivent provenir de la même pharmacie.
                    Veuillez supprimer les produits des autres pharmacies.
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Pharmacies dans votre panier:</span>
                    <ul className="list-disc list-inside mt-1">
                      {getUniquePharmacyNames(cartItems).map((name, index) => (
                        <li key={index} className="text-red-700">{name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold">Récapitulatif</h2>
            </div>

            <div className="p-6">
              {/* Détails */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de service</span>
                  <span>{serviceFee.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{grandTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    Tous les produits doivent être commandés d'une même pharmacie.
                    {!isAllSamePharmacy && (
                      <span className="font-medium block mt-1">
                        Sélectionnez une seule pharmacie pour continuer.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Bouton de commande */}
              <button
                onClick={handleCheckout}
                disabled={!isAllSamePharmacy}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  isAllSamePharmacy
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAllSamePharmacy ? (
                  <>
                    Passer la commande
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  'Sélectionnez une seule pharmacie'
                )}
              </button>

              {/* Continuer les achats */}
              <Link
                to="/medicaments"
                className="block mt-4 text-center text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;