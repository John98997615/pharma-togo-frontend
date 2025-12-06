// src/types/medicament.types.ts
// BASÉ SUR Medicament.php DANS LE BACKEND

import { Category } from "./category.types";
import { Pharmacy } from "./pharmacy.types";
export interface Medicament {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  form?: string;
  dosage?: string;
  requires_prescription: boolean;
  is_active: boolean;
  category_id: number;
  pharmacy_id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  pharmacy?: Pharmacy;
}