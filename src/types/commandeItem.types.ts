// src/types/commandeItem.types.ts
// BASÉ SUR CommandeItem.php DANS LE BACKEND

import { Medicament } from "./medicament.types";

export interface CommandeItem {
  id: number;
  quantity: number;
  unit_price: number;
  medicament_id: number;
  commande_id: number;
  medicament?: Medicament;
}