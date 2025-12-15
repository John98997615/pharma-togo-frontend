// src/services/api/cart.service.ts
import { CartItem } from '../../store/slices/cart.slice';
import axiosClient from './axiosClient';
// import { CartItem } from '../../types/cart.types';

export const cartService = {
  // Récupérer le panier de l'utilisateur
  getCart: async (userId: number): Promise<CartItem[]> => {
    const response = await axiosClient.get(`/users/${userId}/cart`);
    return response.data;
  },

  // Ajouter un produit au panier
  addToCart: async (userId: number, medicamentId: number, quantity: number): Promise<CartItem> => {
    const response = await axiosClient.post(`/users/${userId}/cart`, {
      medicament_id: medicamentId,
      quantity
    });
    return response.data;
  },

  // Mettre à jour la quantité
  updateQuantity: async (cartItemId: number, quantity: number): Promise<CartItem> => {
    const response = await axiosClient.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  // Supprimer du panier
  removeFromCart: async (cartItemId: number): Promise<void> => {
    await axiosClient.delete(`/cart/${cartItemId}`);
  },

  // Vider le panier
  clearCart: async (userId: number): Promise<void> => {
    await axiosClient.delete(`/users/${userId}/cart`);
  }
};