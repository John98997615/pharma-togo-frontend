// src/types/category.types.ts
// BASÉ SUR Category.php DANS LE BACKEND

import { Medicament } from "./medicament.types";
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  medicaments?: Medicament[];
}