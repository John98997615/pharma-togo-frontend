// src/hooks/useCart.ts
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  loadCartFromStorage 
} from '../store/slices/cart.slice';
import { Medicament } from '../types/medicament.types';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  const addItemToCart = (medicament: Medicament, quantity: number = 1) => {
    dispatch(addToCart({ medicament, quantity }));
  };

  const removeItemFromCart = (medicamentId: number) => {
    dispatch(removeFromCart(medicamentId));
  };

  const updateItemQuantity = (medicamentId: number, quantity: number) => {
    dispatch(updateQuantity({ medicamentId, quantity }));
  };

  const emptyCart = () => {
    dispatch(clearCart());
  };

  const loadCart = () => {
    dispatch(loadCartFromStorage());
  };

  const canAddToCart = (medicament: Medicament, quantity: number = 1): boolean => {
    // Vérifier si le stock est suffisant
    if (medicament.quantity < quantity) {
      return false;
    }

    // Vérifier si l'article est déjà dans le panier
    const existingItem = cart.items.find(item => item.medicament.id === medicament.id);
    if (existingItem) {
      return medicament.quantity >= (existingItem.quantity + quantity);
    }

    return true;
  };

  const getItemQuantity = (medicamentId: number): number => {
    const item = cart.items.find(item => item.medicament.id === medicamentId);
    return item ? item.quantity : 0;
  };

  return {
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    lastUpdated: cart.lastUpdated,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    emptyCart,
    loadCart,
    canAddToCart,
    getItemQuantity,
  };
};