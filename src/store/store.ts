// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import cartReducer from './slices/cart.slice';
import commandeReducer from './slices/commande.slice';
import medicamentReducer from './slices/medicament.slice';
import pharmacyReducer from './slices/pharmacy.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    commande: commandeReducer,
    medicament: medicamentReducer,
    pharmacy: pharmacyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer ces actions dans le serializable check
        ignoredActions: [
          'cart/addToCart', 
          'medicament/addMedicament',
          'pharmacy/addPharmacy'
        ],
        // Ignorer ces chemins dans le state
        ignoredPaths: [
          'cart.items',
          'medicament.medicaments',
          'pharmacy.pharmacies'
        ],
      },
    }),
});

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;