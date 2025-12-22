# Plan de Modernisation des Paiements

## Objectif
Remplacer les simulations par les vrais appels API dans les composants de paiement en suivant la logique existante du projet.

## Analyse de l'existant
- ✅ Composants CashPaiement.tsx et MobileMoneyPaiement.tsx identifiés
- ✅ Service paiement.service.ts existant avec méthodes de base
- ✅ Types et validateurs définis
- ❌ Méthodes Mobile Money manquantes dans le service
- ❌ Hooks personnalisés absents
- ❌ Gestion d'erreurs incomplète

## Étapes à réaliser

### 1. Extension du Service Paiement ✅
- [x] Ajouter méthode `initierPaiementMobileMoney()` dans `paiement.service.ts`
- [x] Ajouter méthode `confirmerPaiementMobileMoney()` dans `paiement.service.ts`
- [x] Ajouter méthode `annulerPaiement()` dans `paiement.service.ts`
- [x] Améliorer la gestion des erreurs et types de réponse
- [x] Ajouter la méthode `getPaiementByCommande()`
- [x] Implémenter la fonction de polling automatique

### 2. Création des Hooks Personnalisés ✅
- [x] Créer `useCashPaiement.ts` hook personnalisé
- [x] Créer `useMobileMoneyPaiement.ts` hook personnalisé
- [x] Implémenter la gestion d'états (loading, error, success)
- [x] Ajouter la logique de retry automatique
- [x] Implémenter la vérification périodique du statut (polling)

### 3. Mise à jour des Composants ✅
- [x] Refactorer `CashPaiement.tsx` pour utiliser le hook `useCashPaiement`
- [x] Refactorer `MobileMoneyPaiement.tsx` pour utiliser le hook `useMobileMoneyPaiement`
- [x] Améliorer la gestion des états UI
- [x] Optimiser les messages d'erreur utilisateur

### 4. Améliorations UX ✅
- [x] Ajouter les indicateurs de progression (loading states)
- [x] Améliorer les messages de confirmation (toast notifications)
- [x] Implémenter les notifications en temps réel (polling)
- [x] Ajouter la gestion des timeouts et erreurs

### 5. Tests et Validation 🔄
- [ ] Tester les scénarios de succès
- [ ] Tester les scénarios d'erreur
- [ ] Valider les intégrations avec le backend
- [ ] Tester les cas edge (connexion perdue, etc.)

## Architecture Technique

### Service Paiement Étendu
```typescript
paiementService = {
  initierPaiement: (commandeId, data) => Promise<Paiement>
  verifierStatut: (paiementId) => Promise<Paiement>
  confirmerPaiementCash: (paiementId, codeRecu) => Promise<Paiement>
  initierPaiementMobileMoney: (commandeId, operateur, numero) => Promise<Paiement>
  confirmerPaiementMobileMoney: (paiementId, codeSecret) => Promise<Paiement>
  annulerPaiement: (paiementId) => Promise<void>
}
```

### Hooks Personnalisés
```typescript
useCashPaiement = (commandeId) => {
  states: { isProcessing, paiement, error }
  actions: { confirmerPaiement, annulerPaiement }
}

useMobileMoneyPaiement = (commandeId) => {
  states: { isProcessing, paiement, error, step }
  actions: { initierPaiement, confirmerPaiement, annulerPaiement }
}
```

## Notes d'implémentation
- Conserver la structure UI existante
- Maintenir la compatibilité avec les composants parents
- Respecter les conventions de nommage du projet
- Utiliser les types TypeScript définis
- Gérer les erreurs de manière utilisateur-friendly
