// src/utils/validators/commande.validator.ts
import { z } from 'zod';

// Validation pour la création d'une commande
export const createCommandeValidator = z.object({
  pharmacy_id: z.number()
    .min(1, 'La pharmacie est requise'),
  
  items: z.array(
    z.object({
      medicament_id: z.number()
        .min(1, 'Le médicament est requis'),
      quantity: z.number()
        .min(1, 'La quantité minimum est 1')
        .max(100, 'La quantité maximum est 100'),
    })
  )
  .min(1, 'Au moins un produit est requis')
  .max(50, 'Maximum 50 produits par commande'),
  
  payment_method: z.enum(['cash', 'mobile_money', 'carte'], {
    errorMap: () => ({ message: 'Méthode de paiement invalide' })
  }),
  
  delivery_address: z.string()
    .min(5, 'L\'adresse de livraison doit contenir au moins 5 caractères')
    .max(500, 'L\'adresse de livraison ne doit pas dépasser 500 caractères'),
  
  delivery_phone: z.string()
    .regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide')
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Le numéro de téléphone ne doit pas dépasser 20 caractères'),
  
  notes: z.string()
    .max(1000, 'Les notes ne doivent pas dépasser 1000 caractères')
    .optional(),
});

// Validation pour la mise à jour du statut d'une commande
export const updateCommandeStatusValidator = z.object({
  status: z.enum(['en_attente', 'confirmee', 'en_cours', 'livree', 'annulee'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }),
});

// Validation pour l'assignation d'un livreur
export const assignLivreurValidator = z.object({
  livreur_id: z.number()
    .min(1, 'Le livreur est requis'),
});

// Validation pour la recherche de commandes
export const searchCommandesValidator = z.object({
  status: z.enum(['en_attente', 'confirmee', 'en_cours', 'livree', 'annulee'])
    .optional(),
  
  pharmacy_id: z.number()
    .optional(),
  
  user_id: z.number()
    .optional(),
  
  livreur_id: z.number()
    .optional(),
  
  date_from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
  
  date_to: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
  
  search: z.string()
    .max(100, 'La recherche ne doit pas dépasser 100 caractères')
    .optional(),
  
  page: z.number()
    .min(1, 'Le numéro de page doit être supérieur à 0')
    .optional(),
  
  per_page: z.number()
    .min(1, 'Le nombre d\'éléments par page doit être supérieur à 0')
    .max(100, 'Maximum 100 éléments par page')
    .optional(),
});

// Types TypeScript basés sur les validateurs
export type CreateCommandeData = z.infer<typeof createCommandeValidator>;
export type UpdateCommandeStatusData = z.infer<typeof updateCommandeStatusValidator>;
export type AssignLivreurData = z.infer<typeof assignLivreurValidator>;
export type SearchCommandesData = z.infer<typeof searchCommandesValidator>;