// src/utils/cartSync.ts
export const syncCartData = () => {
  // Cette fonction pourrait être utilisée pour synchroniser avec une API
  // Pour l'instant, elle gère juste la cohérence locale
  
  const cartData = localStorage.getItem('pharma_cart');
  if (cartData) {
    try {
      const parsed = JSON.parse(cartData);
      // S'assurer que les données sont valides
      if (!parsed.items || !Array.isArray(parsed.items)) {
        localStorage.removeItem('pharma_cart');
        return {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: null
        };
      }
      return parsed;
    } catch (error) {
      console.error('Erreur de synchronisation du panier:', error);
      localStorage.removeItem('pharma_cart');
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: null
      };
    }
  }
  return null;
};