// src/utils/validators/medicament.validator.ts
import { z } from 'zod';

// Validation pour la création/mise à jour d'un médicament
export const medicamentValidator = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne doit pas dépasser 255 caractères'),
  
  description: z.string()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional(),
  
  price: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(1000000, 'Le prix maximum est 1,000,000 FCFA'),
  
  quantity: z.number()
    .min(0, 'La quantité ne peut pas être négative')
    .max(10000, 'La quantité maximum est 10,000'),
  
  category_id: z.number()
    .min(1, 'La catégorie est requise'),
  
  pharmacy_id: z.number()
    .min(1, 'La pharmacie est requise'),
  
  form: z.string()
    .max(100, 'La forme ne doit pas dépasser 100 caractères')
    .optional(),
  
  dosage: z.string()
    .max(100, 'Le dosage ne doit pas dépasser 100 caractères')
    .optional(),
  
  requires_prescription: z.boolean()
    .default(false),
  
  is_active: z.boolean()
    .default(true),
  
  image: z.any().optional(),
});

// Validation pour l'ajustement du stock
export const adjustStockValidator = z.object({
  adjustment_value: z.number()
    .min(-1000, 'L\'ajustement minimum est -1000')
    .max(1000, 'L\'ajustement maximum est 1000')
    .refine(value => value !== 0, {
      message: 'La valeur d\'ajustement ne peut pas être 0',
    }),
});

// Validation pour la recherche de médicaments
export const searchMedicamentsValidator = z.object({
  search: z.string()
    .max(100, 'La recherche ne doit pas dépasser 100 caractères')
    .optional(),
  
  category_id: z.number()
    .optional(),
  
  pharmacy_id: z.number()
    .optional(),
  
  available: z.boolean()
    .optional(),
  
  requires_prescription: z.boolean()
    .optional(),
  
  min_price: z.number()
    .min(0, 'Le prix minimum ne peut pas être négatif')
    .optional(),
  
  max_price: z.number()
    .min(0, 'Le prix maximum ne peut pas être négatif')
    .optional(),
  
  latitude: z.number()
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide')
    .optional(),
  
  longitude: z.number()
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide')
    .optional(),
  
  radius: z.number()
    .min(1, 'Le rayon minimum est 1km')
    .max(100, 'Le rayon maximum est 100km')
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
export type MedicamentData = z.infer<typeof medicamentValidator>;
export type AdjustStockData = z.infer<typeof adjustStockValidator>;
export type SearchMedicamentsData = z.infer<typeof searchMedicamentsValidator>;