// src/utils/validators/paiement.validator.ts
import { z } from 'zod';

// Validation pour l'initiation d'un paiement
export const initPaiementValidator = z.object({
  methode: z.enum(['cash', 'mobile_money', 'carte'], {
    errorMap: () => ({ message: 'Méthode de paiement invalide' })
  }),
  
  operateur: z.enum(['mtn', 'moov', 'togocel', 'flooz'])
    .optional()
    .refine((value) => {
      // L'opérateur est requis seulement pour mobile_money
      // Cette validation sera gérée dans la logique métier
      return true;
    }),
});

// Validation pour la confirmation d'un paiement cash
export const confirmCashPaiementValidator = z.object({
  code_recu: z.string()
    .min(5, 'Le code de reçu doit contenir au moins 5 caractères')
    .max(50, 'Le code de reçu ne doit pas dépasser 50 caractères'),
});

// Validation pour le callback Flutterwave
export const flutterwaveCallbackValidator = z.object({
  tx_ref: z.string()
    .min(1, 'La référence de transaction est requise'),
  
  transaction_id: z.string()
    .min(1, 'L\'ID de transaction est requis'),
  
  status: z.enum(['successful', 'failed', 'cancelled'], {
    errorMap: () => ({ message: 'Statut de transaction invalide' })
  }),
  
  amount: z.number()
    .min(1, 'Le montant doit être supérieur à 0'),
  
  currency: z.string()
    .length(3, 'Le code de devise doit contenir 3 caractères'),
  
  customer: z.object({
    email: z.string()
      .email('Email invalide'),
    name: z.string()
      .min(1, 'Le nom est requis'),
  }),
});

// Validation pour les webhooks Flutterwave
export const flutterwaveWebhookValidator = z.object({
  event: z.string()
    .min(1, 'L\'événement est requis'),
  
  data: z.object({
    id: z.number()
      .min(1, 'L\'ID de transaction est requis'),
    
    tx_ref: z.string()
      .min(1, 'La référence de transaction est requise'),
    
    amount: z.number()
      .min(1, 'Le montant doit être supérieur à 0'),
    
    currency: z.string()
      .length(3, 'Le code de devise doit contenir 3 caractères'),
    
    status: z.string()
      .min(1, 'Le statut est requis'),
    
    customer: z.object({
      email: z.string()
        .email('Email invalide'),
      name: z.string()
        .min(1, 'Le nom est requis'),
    }),
    
    created_at: z.string()
      .datetime('Date de création invalide'),
  }),
});

// Types TypeScript basés sur les validateurs
export type InitPaiementData = z.infer<typeof initPaiementValidator>;
export type ConfirmCashPaiementData = z.infer<typeof confirmCashPaiementValidator>;
export type FlutterwaveCallbackData = z.infer<typeof flutterwaveCallbackValidator>;
export type FlutterwaveWebhookData = z.infer<typeof flutterwaveWebhookValidator>;