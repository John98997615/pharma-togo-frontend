// src/types/user.types.ts
// BASÉ SUR User.php DANS LE BACKEND

import { Pharmacy } from "./pharmacy.types";

export type UserRole = 'admin' | 'pharmacien' | 'client' | 'livreur';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  photo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pharmacy?: Pharmacy;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}