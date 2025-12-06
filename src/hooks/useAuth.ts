// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const authContext = useAuthContext();

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!authContext.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authContext.user.role);
    }
    
    return authContext.user.role === role;
  }, [authContext.user]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isPharmacien = useCallback((): boolean => {
    return hasRole('pharmacien');
  }, [hasRole]);

  const isClient = useCallback((): boolean => {
    return hasRole('client');
  }, [hasRole]);

  const isLivreur = useCallback((): boolean => {
    return hasRole('livreur');
  }, [hasRole]);

  const can = useCallback((permission: string): boolean => {
    if (!authContext.user) return false;

    // Logique de permission basée sur le rôle
    const permissions: Record<string, string[]> = {
      admin: ['*'],
      pharmacien: [
        'view_pharmacy',
        'manage_pharmacy',
        'manage_medicaments',
        'manage_orders',
        'view_statistics',
      ],
      client: [
        'view_pharmacies',
        'view_medicaments',
        'place_orders',
        'view_own_orders',
        'manage_profile',
      ],
      livreur: [
        'view_deliveries',
        'update_delivery_status',
        'update_location',
      ],
    };

    if (authContext.user.role === 'admin') return true;
    
    const rolePermissions = permissions[authContext.user.role] || [];
    return rolePermissions.includes(permission) || rolePermissions.includes('*');
  }, [authContext.user]);

  return {
    ...authContext,
    hasRole,
    isAdmin,
    isPharmacien,
    isClient,
    isLivreur,
    can,
  };
};