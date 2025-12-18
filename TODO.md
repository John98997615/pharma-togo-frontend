# Plan de résolution - Unification du système de panier

## Problème identifié
- **MedicamentsPage** utilise le hook `useCart()` (Redux Store) 
- **CartPage** utilise un système localStorage (`cart_${user.id}`)
- **cart.slice.ts** sauvegarde dans localStorage avec la clé `pharma_cart`
- **Incohérence :** Les données sont ajoutées dans Redux mais recherchées dans localStorage

## Solution : Unifier avec Redux Store

### Étapes à suivre :


#### 1. Modifier CartPage.tsx
- [x] Remplacer le système localStorage par le hook `useCart()`
- [x] Utiliser `items`, `totalItems`, `totalPrice` du Redux Store
- [x] Utiliser `updateItemQuantity` et `removeItemFromCart` du hook
- [x] Conserver la même interface utilisateur
- [x] Conserver la logique de groupement par pharmacie
- [x] Charger le panier au montage avec `loadCart()`

#### 2. Tester la cohérence
- [ ] Vérifier que l'ajout d'un produit depuis MedicamentsPage apparaît dans CartPage
- [ ] Vérifier que les modifications de quantité fonctionnent
- [ ] Vérifier que la suppression fonctionne
- [ ] Vérifier les totaux et calculs

#### 3. Nettoyage
- [ ] Supprimer le code localStorage obsolète dans CartPage
- [ ] Vérifier que tous les composants utilisent le même système
- [ ] S'assurer que la persistance localStorage fonctionne via Redux

## Fichiers à modifier :
- `src/pages/dashboard/client/CartPage.tsx` - Principale modification

## Résultat attendu :
✅ Un système de panier unifié utilisant Redux Store
✅ Cohérence entre tous les composants
✅ Persistance des données via localStorage (via Redux)
✅ Pas de perte de fonctionnalités existantes
