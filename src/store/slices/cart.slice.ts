// src/store/slices/cart.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Medicament } from '../../types/medicament.types';

export interface CartItem {
  medicament: Medicament;
  quantity: number;
  pharmacy_id: number;
  pharmacy_name: string; // Ajouté
  added_at: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string | null;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  lastUpdated: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{
      medicament: Medicament;
      quantity?: number;
    }>) => {
      const { medicament, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.medicament.id === medicament.id
      );

      if (existingItemIndex >= 0) {
        // Si l'article existe déjà, augmenter la quantité
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Sinon, ajouter un nouvel article
        state.items.push({
          medicament,
          quantity,
          pharmacy_id: medicament.pharmacy_id,
          pharmacy_name: medicament.pharmacy?.name || 'Pharmacie', // Ajouté
          added_at: new Date().toISOString(),
        });
      }

      // Mettre à jour les totaux
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + (item.medicament.price * item.quantity), 
        0
      );
      state.lastUpdated = new Date().toISOString();
      
      // Sauvegarder dans localStorage
      localStorage.setItem('pharma_cart', JSON.stringify(state));
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const medicamentId = action.payload;
      state.items = state.items.filter(item => item.medicament.id !== medicamentId);
      
      // Mettre à jour les totaux
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + (item.medicament.price * item.quantity), 
        0
      );
      state.lastUpdated = new Date().toISOString();
      
      localStorage.setItem('pharma_cart', JSON.stringify(state));
    },

    updateQuantity: (state, action: PayloadAction<{
      medicamentId: number;
      quantity: number;
    }>) => {
      const { medicamentId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.medicament.id === medicamentId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Si quantité <= 0, supprimer l'article
          state.items.splice(itemIndex, 1);
        } else {
          // Sinon, mettre à jour la quantité
          state.items[itemIndex].quantity = quantity;
        }
      }

      // Mettre à jour les totaux
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + (item.medicament.price * item.quantity), 
        0
      );
      state.lastUpdated = new Date().toISOString();
      
      localStorage.setItem('pharma_cart', JSON.stringify(state));
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.lastUpdated = new Date().toISOString();
      localStorage.removeItem('pharma_cart');
    },

    loadCartFromStorage: (state) => {
      const savedCart = localStorage.getItem('pharma_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          state.items = parsedCart.items || [];
          state.totalItems = parsedCart.totalItems || 0;
          state.totalPrice = parsedCart.totalPrice || 0;
          state.lastUpdated = parsedCart.lastUpdated || null;
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
          localStorage.removeItem('pharma_cart');
        }
      }
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  loadCartFromStorage 
} = cartSlice.actions;

export default cartSlice.reducer;