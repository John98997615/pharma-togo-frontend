// src/utils/validators/auth.validator.ts
import { z } from 'zod';

// Validation pour l'inscription
export const registerValidator = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères'),
  
  phone: z.string()
    .regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide')
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Le numéro de téléphone ne doit pas dépasser 20 caractères'),
  
  role: z.enum(['admin', 'pharmacien', 'client', 'livreur'], {
    errorMap: () => ({ message: 'Rôle invalide' })
  }),
  
  address: z.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(500, 'L\'adresse ne doit pas dépasser 500 caractères'),
  
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne doit pas dépasser 100 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  
  password_confirmation: z.string(),
  
  photo: z.any().optional(),
})
.refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

// Validation pour la connexion
export const loginValidator = z.object({
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères'),
  
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .max(100, 'Le mot de passe ne doit pas dépasser 100 caractères'),
});

// Validation pour la mise à jour du profil
export const updateProfileValidator = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .optional(),
  
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide')
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Le numéro de téléphone ne doit pas dépasser 20 caractères')
    .optional(),
  
  address: z.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(500, 'L\'adresse ne doit pas dépasser 500 caractères')
    .optional(),
  
  photo: z.any().optional(),
});

// Validation pour la réinitialisation du mot de passe
export const resetPasswordValidator = z.object({
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères'),
});

// Validation pour le changement de mot de passe
export const changePasswordValidator = z.object({
  current_password: z.string()
    .min(1, 'Le mot de passe actuel est requis')
    .max(100, 'Le mot de passe ne doit pas dépasser 100 caractères'),
  
  password: z.string()
    .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne doit pas dépasser 100 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  
  password_confirmation: z.string(),
})
.refine((data) => data.password === data.password_confirmation, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

// Types TypeScript basés sur les validateurs
export type RegisterData = z.infer<typeof registerValidator>;
export type LoginData = z.infer<typeof loginValidator>;
export type UpdateProfileData = z.infer<typeof updateProfileValidator>;
export type ResetPasswordData = z.infer<typeof resetPasswordValidator>;
export type ChangePasswordData = z.infer<typeof changePasswordValidator>;