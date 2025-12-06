// src/hooks/usePharmacies.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Pharmacy } from '../types/pharmacy.types';
import { pharmacyService } from '../services/api/pharmacy.service';

export const usePharmacies = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPharmacies = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await pharmacyService.getAll(params);
      setPharmacies(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des pharmacies';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPharmacyById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await pharmacyService.getById(id);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement de la pharmacie';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPharmacy = useCallback(async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPharmacy = await pharmacyService.create(data);
      setPharmacies(prev => [...prev, newPharmacy]);
      toast.success('Pharmacie créée avec succès');
      return newPharmacy;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la création de la pharmacie';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePharmacy = useCallback(async (id: number, data: FormData | Partial<Pharmacy>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPharmacy = await pharmacyService.update(id, data);
      setPharmacies(prev => 
        prev.map(pharmacy => 
          pharmacy.id === id ? updatedPharmacy : pharmacy
        )
      );
      toast.success('Pharmacie mise à jour avec succès');
      return updatedPharmacy;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour de la pharmacie';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleGarde = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await pharmacyService.toggleGarde(id);
      setPharmacies(prev => 
        prev.map(pharmacy => 
          pharmacy.id === id ? { ...pharmacy, is_garde: result.is_garde } : pharmacy
        )
      );
      toast.success(result.message);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la modification du statut de garde';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await pharmacyService.toggleActive(id);
      setPharmacies(prev => 
        prev.map(pharmacy => 
          pharmacy.id === id ? { ...pharmacy, is_active: result.is_active } : pharmacy
        )
      );
      toast.success(result.message);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la modification du statut';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPharmacies = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchPharmacies();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await pharmacyService.getAll({ search: searchTerm });
      setPharmacies(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la recherche';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchPharmacies]);

  const getNearbyPharmacies = useCallback(async (latitude: number, longitude: number, radius: number = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await pharmacyService.getAll({ 
        latitude, 
        longitude, 
        radius 
      });
      setPharmacies(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la recherche des pharmacies à proximité';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pharmacies,
    loading,
    error,
    fetchPharmacies,
    fetchPharmacyById,
    createPharmacy,
    updatePharmacy,
    toggleGarde,
    toggleActive,
    searchPharmacies,
    getNearbyPharmacies,
    setPharmacies,
    setLoading,
    setError,
  };
};