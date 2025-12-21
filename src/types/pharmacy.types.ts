// src/types/pharmacy.types.ts
// BASÉ SUR Pharmacy.php DANS LE BACKEND

import { Medicament } from "./medicament.types";
import { User } from "./user.types";

export interface Pharmacy {
  id: number;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  logo?: string;
  is_garde: boolean;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  medicaments?: Medicament[];
  commandes?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}