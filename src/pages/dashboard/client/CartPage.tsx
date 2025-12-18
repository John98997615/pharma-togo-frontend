// src/pages/dashboard/client/CartPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  Store,
  Truck,
  AlertTriangle,
  MapPin,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../hooks/useCart';
import { commandeService } from '../../../services/api/commande.service';
import { medicamentService } from '../../../services/api/medicament.service';

// Types
interface PharmacyGroup {
  id: number;
  name: string;
  address: string;
  phone: string;
  items: any[];
  subtotal: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items, 
    totalItems, 
    totalPrice, 
    updateItemQuantity, 
    removeItemFromCart,
    emptyCart,
    loadCart
  } = useCart();
  
  const [pharmacyGroups, setPharmacyGroups] = useState<PharmacyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'carte'>('mobile_money');

  // Charger le panier une seule fois au montage
  useEffect(() => {
    loadCart();
  }, []); // Supprimé loadCart des dépendances pour éviter la boucle

  // Grouper les items par pharmacie avec useMemo pour éviter recalculs inutiles
  const groupedPharmacies = useMemo(() => {
    if (items.length === 0) return [];
    
    const groupsMap = new Map<number, PharmacyGroup>();
    
    items.forEach((item) => {
      const pharmacyId = item.pharmacy_id || item.medicament?.pharmacy_id;
      const pharmacyName = item.pharmacy_name || item.medicament?.pharmacy?.name || 'Pharmacie';
      const pharmacyAddress = item.medicament?.pharmacy?.address || 'Adresse non disponible';
      const pharmacyPhone = item.medicament?.pharmacy?.phone || 'Téléphone non disponible';
      
      if (!groupsMap.has(pharmacyId)) {
        groupsMap.set(pharmacyId, {
          id: pharmacyId,
          name: pharmacyName,
          address: pharmacyAddress,
          phone: pharmacyPhone,
          items: [],
          subtotal: 0
        });
      }
      
      const group = groupsMap.get(pharmacyId)!;
      group.items.push(item);
      group.subtotal += (item.medicament.price * item.quantity);
    });
    
    return Array.from(groupsMap.values());
  }, [items]);

  // Mettre à jour les groupes seulement quand ils changent
  useEffect(() => {
    setPharmacyGroups(groupedPharmacies);
  }, [groupedPharmacies]);

  // Calculer les frais
  const totals = useMemo(() => {
    const cartTotal = totalPrice;
    const deliveryFee = pharmacyGroups.length > 0 ? 2000 : 0;
    const serviceFee = cartTotal > 0 ? 500 : 0;
    const grandTotal = cartTotal + deliveryFee + serviceFee;
    
    return {
      cartTotal,
      deliveryFee,
      serviceFee,
      grandTotal
    };
  }, [totalPrice, pharmacyGroups.length]);

  const hasMultiplePharmacies = pharmacyGroups.length > 1;

  // Mettre à jour la quantité avec useCallback
  const handleUpdateQuantity = useCallback((medicamentId: number, change: number) => {
    const item = items.find(item => item.medicament.id === medicamentId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
    updateItemQuantity(medicamentId, newQuantity);
    toast.success('Quantité mise à jour');
  }, [items, updateItemQuantity]);

  // Supprimer un item avec useCallback
  const handleRemoveItem = useCallback((medicamentId: number) => {
    removeItemFromCart(medicamentId);
    toast.success('Produit retiré du panier');
  }, [removeItemFromCart]);

  // Vider le panier
  const handleClearCart = useCallback(() => {
    emptyCart();
    toast.success('Panier vidé');
  }, [emptyCart]);

  // Passer commande pour une pharmacie spécifique
  const handleCheckout = async (pharmacyGroup: PharmacyGroup) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour passer commande');
      navigate('/login');
      return;
    }

    if (!deliveryAddress || !deliveryPhone) {
      toast.error('Veuillez renseigner votre adresse et téléphone de livraison');
      return;
    }

    setLoading(true);
    try {
      // Vérifier la disponibilité des médicaments
      const availabilityPromises = pharmacyGroup.items.map(async (item) => {
        try {
          const medicament = await medicamentService.getById(item.medicament.id);
          return {
            item,
            available: medicament.quantity >= item.quantity,
            currentStock: medicament.quantity,
            medicament
          };
        } catch (error) {
          return {
            item,
            available: false,
            currentStock: 0,
            medicament: null
          };
        }
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      const unavailableItems = availabilityResults.filter(result => !result.available);

      if (unavailableItems.length > 0) {
        const itemNames = unavailableItems
          .map(result => result.item.medicament.name)
          .join(', ');
        toast.error(`Produits non disponibles: ${itemNames}`);
        setLoading(false);
        return;
      }

      // Créer la commande
      const commandeData = {
        pharmacy_id: pharmacyGroup.id,
        items: pharmacyGroup.items.map(item => ({
          medicament_id: item.medicament.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        delivery_phone: deliveryPhone,
        notes: `Commande pour ${pharmacyGroup.items.length} produit(s)`
      };

      const commande = await commandeService.create(commandeData);
      
      // Retirer les items commandés du panier
      pharmacyGroup.items.forEach(item => {
        removeItemFromCart(item.medicament.id);
      });
      
      toast.success('Commande passée avec succès !');
      
      // Rediriger vers la page de paiement
      navigate(`/client/commandes/${commande.id}/paiement`);
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          'Erreur lors de la commande';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la quantité totale par pharmacie
  const getPharmacyItemCount = useCallback((pharmacyId: number) => {
    return items
      .filter(item => item.pharmacy_id === pharmacyId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  if (items.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mon Panier</h1>
          <div className="flex items-center text-gray-600">
            <Package className="h-5 w-5 mr-2" />
            <span>{totalItems} article{totalItems > 1 ? 's' : ''} • {pharmacyGroups.length} pharmacie{pharmacyGroups.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2">
            {/* Bouton vider panier */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleClearCart}
                className="flex items-center text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le panier
              </button>
            </div>

            {/* Avertissement pharmacies multiples */}
            {hasMultiplePharmacies && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 mb-2">
                      ⚠️ Commandes séparées nécessaires
                    </p>
                    <p className="text-sm text-yellow-700">
                      Votre panier contient des produits de {pharmacyGroups.length} pharmacies différentes.
                      Vous devez passer une commande séparée pour chaque pharmacie.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pharmacies */}
            {pharmacyGroups.map((pharmacy) => (
              <div key={pharmacy.id} className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200">
                {/* En-tête pharmacie */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <h3 className="font-bold text-gray-900">{pharmacy.name}</h3>
                        <div className="text-sm text-gray-600">
                          {pharmacy.items.length} produit{pharmacy.items.length > 1 ? 's' : ''} • 
                          Total: {pharmacy.subtotal.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCheckout(pharmacy)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? 'Traitement...' : 'Commander'}
                    </button>
                  </div>
                </div>

                {/* Produits de la pharmacie */}
                <div className="divide-y divide-gray-200">
                  {pharmacy.items.map((item) => (
                    <div key={`${pharmacy.id}-${item.medicament.id}`} className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.medicament.image ? (
                            <img
                              src={item.medicament.image}
                              alt={item.medicament.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                              <Package className="h-10 w-10 text-blue-600" />
                            </div>
                          )}
                        </div>

                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 truncate">{item.medicament.name}</h3>
                              <p className="text-lg font-bold text-blue-600 mt-2">
                                {item.medicament.price.toLocaleString()} FCFA
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.medicament.id)}
                              className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantité */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUpdateQuantity(item.medicament.id, -1)}
                                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                aria-label="Diminuer la quantité"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-lg font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.medicament.id, 1)}
                                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                aria-label="Augmenter la quantité"
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
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold">Récapitulatif de commande</h2>
              </div>

              <div className="p-6">
                {/* Informations livraison */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span>Adresse de livraison</span>
                  </h3>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Votre adresse complète"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="Votre téléphone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Méthode de paiement */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Smartphone className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                    <span>Méthode de paiement</span>
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile_money"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={() => setPaymentMethod('mobile_money')}
                        className="mr-3"
                      />
                      <span>Mobile Money</span>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="mr-3"
                      />
                      <span>Paiement à la livraison</span>
                    </label>
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
                        Délai: 1-2 heures • Frais fixes par pharmacie
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bouton commander tout */}
                {!hasMultiplePharmacies && pharmacyGroups.length > 0 && (
                  <button
                    onClick={() => handleCheckout(pharmacyGroups[0])}
                    disabled={loading || items.length === 0}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4 transition-colors"
                  >
                    {loading ? 'Traitement...' : 'Commander tout'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                )}

                {/* Liens utiles */}
                <div className="pt-6 border-t border-gray-200 space-y-3">
                  <Link
                    to="/medicaments"
                    className="block text-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    ← Continuer mes achats
                  </Link>
                  <Link
                    to="/client/commandes"
                    className="block text-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Voir mes commandes
                  </Link>
                </div>
              </div>
            </div>

            {/* Résumé pharmacies */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Vos pharmacies</h4>
              <div className="space-y-3">
                {pharmacyGroups.map((pharmacy) => (
                  <div key={`summary-${pharmacy.id}`} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center min-w-0">
                      <Store className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{pharmacy.name}</span>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap">
                      {getPharmacyItemCount(pharmacy.id)} article{getPharmacyItemCount(pharmacy.id) > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;