// src/hooks/useMedicaments.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Medicament } from '../types/medicament.types';
import { medicamentService } from '../services/api/medicament.service';

export const useMedicaments = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchMedicaments = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await medicamentService.getAll(params);
      const data = response.data || [];
      const meta = response.meta;
      
      setMedicaments(data);
      
      if (meta) {
        setPagination({
          currentPage: meta.current_page || 1,
          totalPages: meta.last_page || 1,
          totalItems: meta.total || 0,
        });
      }
      
      return { data, meta };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des médicaments';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMedicamentById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await medicamentService.getById(id);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement du médicament';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMedicament = useCallback(async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newMedicament = await medicamentService.create(data);
      setMedicaments(prev => [...prev, newMedicament]);
      toast.success('Médicament créé avec succès');
      return newMedicament;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la création du médicament';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMedicament = useCallback(async (id: number, data: FormData | Partial<Medicament>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMedicament = await medicamentService.update(id, data);
      setMedicaments(prev => 
        prev.map(medicament => 
          medicament.id === id ? updatedMedicament : medicament
        )
      );
      toast.success('Médicament mis à jour avec succès');
      return updatedMedicament;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour du médicament';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMedicament = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await medicamentService.delete(id);
      setMedicaments(prev => prev.filter(medicament => medicament.id !== id));
      toast.success('Médicament supprimé avec succès');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression du médicament';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustStock = useCallback(async (id: number, adjustmentValue: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMedicament = await medicamentService.adjustStock(id, adjustmentValue);
      setMedicaments(prev => 
        prev.map(medicament => 
          medicament.id === id ? updatedMedicament : medicament
        )
      );
      
      const action = adjustmentValue > 0 ? 'ajouté' : 'retiré';
      toast.success(`Stock ${action} avec succès`);
      return updatedMedicament;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'ajustement du stock';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMedicaments = useCallback(async (searchTerm: string, filters?: any) => {
    if (!searchTerm.trim() && !filters) {
      await fetchMedicaments();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { search: searchTerm, ...filters };
      const response = await medicamentService.getAll(params);
      const data = response.data || [];
      setMedicaments(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la recherche';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchMedicaments]);

  const getLowStockMedicaments = useCallback(async (threshold: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await medicamentService.getAll();
      const data = response.data || [];
      const lowStock = data.filter(m => m.quantity < threshold);
      setMedicaments(lowStock);
      return lowStock;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des stocks faibles';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    medicaments,
    loading,
    error,
    pagination,
    fetchMedicaments,
    fetchMedicamentById,
    createMedicament,
    updateMedicament,
    deleteMedicament,
    adjustStock,
    searchMedicaments,
    getLowStockMedicaments,
    setMedicaments,
    setLoading,
    setError,
    setPagination,
  };
};