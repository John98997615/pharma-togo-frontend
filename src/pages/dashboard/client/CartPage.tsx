// src/pages/dashboard/client/CartPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  AlertCircle,
  Store,
  Truck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface CartItem {
  id: number;
  medicament_id: number;
  quantity: number;
  medicament: {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    pharmacy: {
      id: number;
      name: string;
      address: string;
      phone: string;
    };
    category?: {
      id: number;
      name: string;
    };
  };
  created_at: string;
  updated_at: string;
}

interface PharmacySummary {
  id: number;
  name: string;
  address: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
}

interface OrderItem {
  medicament_id: number;
  quantity: number;
  price: number;
  name: string;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Récupérer le panier depuis l'API
  const { 
    data: cartItems = [], 
    isLoading, 
    error 
  } = useQuery<CartItem[]>({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Récupérer le panier depuis localStorage ou API
        const storedCart = localStorage.getItem(`cart_${user.id}`);
        
        if (storedCart) {
          return JSON.parse(storedCart) as CartItem[];
        }
        
        // Si pas de panier stocké, retourner tableau vide
        return [];
      } catch (error) {
        console.error('Error fetching cart:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Mutation pour mettre à jour la quantité
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      // Simuler un appel API
      return new Promise<CartItem>((resolve) => {
        setTimeout(() => {
          resolve({
            id: itemId,
            medicament_id: itemId,
            quantity,
            medicament: {
              id: itemId,
              name: 'Médicament',
              price: 1000,
              pharmacy: {
                id: 1,
                name: 'Pharmacie',
                address: '',
                phone: ''
              }
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  // Mutation pour supprimer un item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      // Simuler un appel API
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Produit retiré du panier');
    }
  });

  // Mettre à jour localStorage quand le panier change
  useEffect(() => {
    if (user && cartItems.length > 0) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Grouper les items par pharmacie
  const groupItemsByPharmacy = (items: CartItem[]): PharmacySummary[] => {
    const pharmacyMap = new Map<number, PharmacySummary>();
    
    items.forEach((item: CartItem) => {
      const pharmacyId = item.medicament.pharmacy.id;
      
      if (!pharmacyMap.has(pharmacyId)) {
        pharmacyMap.set(pharmacyId, {
          id: pharmacyId,
          name: item.medicament.pharmacy.name,
          address: item.medicament.pharmacy.address,
          phone: item.medicament.pharmacy.phone,
          items: [],
          subtotal: 0
        });
      }
      
      const pharmacy = pharmacyMap.get(pharmacyId)!;
      pharmacy.items.push(item);
      pharmacy.subtotal += item.medicament.price * item.quantity;
    });
    
    return Array.from(pharmacyMap.values());
  };

  const pharmacyGroups = groupItemsByPharmacy(cartItems);
  const hasMultiplePharmacies = pharmacyGroups.length > 1;

  // Calculer les totaux
  const calculateTotals = () => {
    const cartTotal = cartItems.reduce((total: number, item: CartItem) => 
      total + (item.medicament.price * item.quantity), 0
    );
    
    const deliveryFee = 2000; // Frais de livraison fixes
    const serviceFee = 500; // Frais de service fixes
    const grandTotal = cartTotal + deliveryFee + serviceFee;
    
    return {
      cartTotal,
      deliveryFee,
      serviceFee,
      grandTotal
    };
  };

  const totals = calculateTotals();

  // Mettre à jour la quantité
  const updateQuantity = (itemId: number, change: number) => {
    const item = cartItems.find((item: CartItem) => item.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  // Supprimer un item
  const removeItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  // Passer commande
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    if (hasMultiplePharmacies) {
      toast.error('Veuillez commander d\'une seule pharmacie à la fois');
      return;
    }

    // Préparer les données de commande
    const pharmacyId = pharmacyGroups[0]?.id;
    const orderItems: OrderItem[] = cartItems.map((item: CartItem) => ({
      medicament_id: item.medicament.id,
      quantity: item.quantity,
      price: item.medicament.price,
      name: item.medicament.name
    }));

    // Naviguer vers la page de commande
    navigate('/client/commandes/new', {
      state: {
        pharmacyId,
        items: orderItems,
        pharmacy: pharmacyGroups[0]
      }
    });
  };

  // Ajouter au panier depuis l'API
  const addToCartFromAPI = async (medicamentId: number, quantity: number = 1) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    try {
      // Ici vous appelleriez votre API
      // Exemple: await cartService.addItem(medicamentId, quantity);
      
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre panier...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-6">Impossible de charger votre panier.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
            <p className="text-gray-600 mb-6">Ajoutez des médicaments à votre panier pour commencer.</p>
            <Link
              to="/medicaments"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Package className="h-5 w-5 mr-2" />
              Parcourir les médicaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2">
            {/* Pharmacies */}
            {pharmacyGroups.map((pharmacy, index) => (
              <div key={pharmacy.id} className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200">
                {/* En-tête pharmacie */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <h3 className="font-bold text-gray-900">{pharmacy.name}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>{pharmacy.address}</span>
                          <span className="mx-2">•</span>
                          <span>{pharmacy.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        {pharmacy.items.length} article{pharmacy.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Produits de la pharmacie */}
                <div className="divide-y divide-gray-200">
                  {pharmacy.items.map((item: CartItem) => (
                    <div key={item.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Image */}
                        <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {item.medicament.image ? (
                            <img
                              src={item.medicament.image}
                              alt={item.medicament.name}
                              className="h-full w-full rounded-lg object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('bg-gray-100');
                              }}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="h-10 w-10 text-blue-600" />
                            </div>
                          )}
                        </div>

                        {/* Détails */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{item.medicament.name}</h3>
                              {item.medicament.category && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.medicament.category.name}
                                </p>
                              )}
                              <p className="text-lg font-bold text-blue-600 mt-2">
                                {item.medicament.price.toLocaleString()} FCFA
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              disabled={removeItemMutation.isPending}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantité */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={updateQuantityMutation.isPending}
                                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-lg font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={updateQuantityMutation.isPending}
                                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Sous-total */}
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                {(item.medicament.price * item.quantity).toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total pharmacie */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Sous-total {pharmacy.name}</span>
                    <span className="text-lg font-bold text-gray-900">
                      {pharmacy.subtotal.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Avertissement pharmacies multiples */}
            {hasMultiplePharmacies && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      ⚠️ Commandes multiples nécessaires
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Vous avez des produits de {pharmacyGroups.length} pharmacies différentes.
                      Pour commander, vous devrez passer une commande séparée pour chaque pharmacie.
                    </p>
                    <div className="mt-3 space-y-2">
                      {pharmacyGroups.map((pharmacy, index) => (
                        <div key={pharmacy.id} className="flex items-center justify-between bg-white/50 p-2 rounded">
                          <div className="flex items-center">
                            <Store className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium">{pharmacy.name}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {pharmacy.items.length} article{pharmacy.items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
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
                <h2 className="text-lg font-bold">Récapitulatif de commande</h2>
              </div>

              <div className="p-6">
                {/* Statistiques */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Total articles</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Pharmacies</span>
                    <span className="font-medium">{pharmacyGroups.length}</span>
                  </div>
                </div>

                {/* Détails prix */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total articles</span>
                    <span>{totals.cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>{totals.deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de service</span>
                    <span>{totals.serviceFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total général</span>
                      <span>{totals.grandTotal.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Note livraison */}
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Truck className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Livraison estimée</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Délai: 1-2 heures • Frais de livraison: {totals.deliveryFee.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  {hasMultiplePharmacies ? (
                    <>
                      <button
                        disabled
                        className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                      >
                        Commander par pharmacie
                      </button>
                      <p className="text-sm text-gray-500 text-center">
                        Veuillez commander chaque pharmacie séparément
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      Passer la commande
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                  )}
                </div>

                {/* Liens utiles */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <Link
                    to="/medicaments"
                    className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Continuer mes achats
                  </Link>
                  <Link
                    to="/client/commandes"
                    className="block text-center text-gray-600 hover:text-gray-800"
                  >
                    Voir mes commandes
                  </Link>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {pharmacyGroups.length === 1 && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2">Livraison rapide</h4>
                <p className="text-sm text-blue-700">
                  Votre commande de <span className="font-bold">{pharmacyGroups[0].name}</span> 
                  sera livrée dans un délai de 1-2 heures.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;