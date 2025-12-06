// src/types/commande.types.ts
// BASÉ SUR Commande.php DANS LE BACKEND

import { User } from "./user.types";
import { Pharmacy } from "./pharmacy.types";
import { Medicament } from "./medicament.types";
import { Livraison } from "./livraison.types";
import { Paiement } from "./paiement.types";
import { CommandeItem } from "./commandeItem.types";
export type CommandeStatus = 'en_attente' | 'confirmee' | 'en_cours' | 'livree' | 'annulee';
export type PaymentMethod = 'cash' | 'mobile_money' | 'carte';
export type PaymentStatus = 'en_attente' | 'paye' | 'echec';

export interface Commande {
  id: number;
  numero_commande: string;
  total_amount: number;
  status: CommandeStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  delivery_address?: string;
  delivery_phone?: string;
  user_id: number;
  pharmacy_id: number;
  livreur_id?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  pharmacy?: Pharmacy;
  livreur?: User;
  items: CommandeItem[];
  livraison?: Livraison;
  paiements?: Paiement[];
  medicament?: Medicament
}