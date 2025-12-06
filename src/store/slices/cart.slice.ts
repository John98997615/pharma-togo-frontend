// src/store/slices/cart.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Medicament } from '../../types/medicament.types';

interface CartItem {
  id: number;
  medicament: Medicament;
  quantity: number;
  pharmacyId: number;
}

interface CartState {
  items: CartItem[];
  pharmacyId: number | null;
  total: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  pharmacyId: null,
  total: 0,
  itemCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ medicament: Medicament; pharmacyId: number }>) => {
      const { medicament, pharmacyId } = action.payload;
      
      // Vérifier si le panier est vide ou si le produit vient de la même pharmacie
      if (state.items.length === 0) {
        state.pharmacyId = pharmacyId;
      } else if (state.pharmacyId !== pharmacyId) {
        throw new Error('Vous ne pouvez pas ajouter des produits de pharmacies différentes dans le même panier');
      }

      const existingItem = state.items.find(item => item.medicament.id === medicament.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id: Date.now(),
          medicament,
          quantity: 1,
          pharmacyId,
        });
      }

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      if (state.items.length === 0) {
        state.pharmacyId = null;
      }
      
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = Math.max(1, quantity);
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.pharmacyId = null;
      state.total = 0;
      state.itemCount = 0;
    },
    
    setPharmacy: (state, action: PayloadAction<number>) => {
      state.pharmacyId = action.payload;
    },
  },
});

// Fonctions utilitaires
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.medicament.price * item.quantity);
  }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
};

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setPharmacy,
} = cartSlice.actions;

export default cartSlice.reducer;