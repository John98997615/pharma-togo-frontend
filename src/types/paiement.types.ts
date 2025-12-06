// src/types/paiement.types.ts
// BASÉ SUR Paiement.php DANS LE BACKEND

import { Commande } from "./commande.types";
import { User } from "./user.types";
export type PaiementMethode = 'cash' | 'mobile_money' | 'carte';
export type PaiementStatut = 'en_attente' | 'paye' | 'echec' | 'annule';
export type Operateur = 'mtn' | 'moov' | 'togocel' | 'flooz';

export interface Paiement {
  id: number;
  reference: string;
  montant: number;
  methode: PaiementMethode;
  statut: PaiementStatut;
  operateur?: Operateur;
  numero_transaction?: string;
  details?: any;
  paye_le?: string;
  notes?: string;
  commande_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  commande?: Commande;
  user?: User;
}