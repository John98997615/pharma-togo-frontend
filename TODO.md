# Plan de Correction - Gestion des Images des Médicaments

## Problèmes Identifiés

### 1. Conflit de Type de Données
- `initialData.image` contient une URL string (ex: "medicaments/image.jpg")
- Le champ file attend un FileList
- watch('image') renvoie une URL string lors de l'édition, pas un FileList

### 2. Logique de Soumission Incorrecte
- Le formulaire vérifie `data.image.length > 0` mais pour une URL string, `length` est undefined
- Lors de la modification, aucune image n'est envoyée au serveur même si l'URL existe

### 3. Écrasement des Valeurs
- Les valeurs par défaut dans `useForm` peuvent écraser les données existantes
- Problème lors du reset du formulaire avec les données initiales


## Plan de Correction

### Phase 1: Modification de MedicamentForm.tsx
- [x] 1.1. Ajouter un état pour distinguer création vs modification
- [x] 1.2. Créer une logique separate pour la gestion d'image selon le contexte
- [x] 1.3. Corriger la soumission des données pour gérer les images correctement
- [x] 1.4. Améliorer la gestion des valeurs par défaut
- [x] 1.5. Ajouter une logique pour détecter si une nouvelle image a été sélectionnée

### Phase 2: Modification de MedicamentsManagement.tsx
- [x] 2.1. Corriger le passage des données initiales
- [x] 2.2. S'assurer que les données sont bien formatées avant envoi
- [x] 2.3. Passer le prop isEditing au formulaire


### Phase 3: Tests et Validation
- [ ] 3.1. Tester la création d'un nouveau médicament avec image
- [ ] 3.2. Tester la modification d'un médicament existant avec image
- [ ] 3.3. Tester la modification sans changement d'image
- [ ] 3.4. Vérifier que les valeurs ne sont plus écrasées

## Détails Techniques

### Logique de Gestion d'Image
- **Création** : Image requise, FileList uniquement
- **Modification** : Image optionnelle, si pas de nouvelle image = garder l'ancienne
- **Détection de changement** : Comparer l'image actuelle avec l'image initiale

### Structure de Données
- **Création** : `{...formData, image: FileList}`
- **Modification** : `{...formData, image?: FileList}` (optionnel)

## Prochaines Étapes
1. Implémenter les corrections
2. Tester les différents scénarios
3. Valider que les bugs sont résolus
