// src/types/livraison.types.ts
// BASÉ SUR Livraison.php DANS LE BACKEND

import { Commande } from "./commande.types";
import { User } from "./user.types";
export type LivraisonStatus = 'en_attente' | 'en_cours' | 'livree' | 'annulee';

export interface Livraison {
  id: number;
  tracking_number: string;
  status: LivraisonStatus;
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivered_at?: string;
  signature?: string;
  notes?: string;
  commande_id: number;
  livreur_id: number;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_at: string;
  updated_at: string;
  commande?: Commande;
  livreur?: User;
}