// src/utils/validators/pharmacy.validator.ts
import { z } from 'zod';

// Validation pour la création/mise à jour d'une pharmacie
export const pharmacyValidator = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne doit pas dépasser 255 caractères'),
  
  description: z.string()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional(),
  
  address: z.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(500, 'L\'adresse ne doit pas dépasser 500 caractères'),
  
  latitude: z.number()
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide'),
  
  longitude: z.number()
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide'),
  
  phone: z.string()
    .regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide')
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Le numéro de téléphone ne doit pas dépasser 20 caractères'),
  
  email: z.string()
    .email('Email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères')
    .optional(),
  
  logo: z.any().optional(),
  
  is_garde: z.boolean()
    .default(false),
  
  opening_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm)'),
  
  closing_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm)'),
  
  is_active: z.boolean()
    .default(true),
  
  user_id: z.number()
    .min(1, 'L\'utilisateur est requis'),
});

// Validation pour la recherche de pharmacies
export const searchPharmaciesValidator = z.object({
  search: z.string()
    .max(100, 'La recherche ne doit pas dépasser 100 caractères')
    .optional(),
  
  garde: z.boolean()
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
export type PharmacyData = z.infer<typeof pharmacyValidator>;
export type SearchPharmaciesData = z.infer<typeof searchPharmaciesValidator>;