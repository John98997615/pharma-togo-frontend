// src/hooks/useCommandes.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Commande, CommandeStatus } from '../types/commande.types';
import { commandeService } from '../services/api/commande.service';

export const useCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchCommandes = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await commandeService.getAll(params);
      const data = response.data || [];
      const meta = response.meta;
      
      setCommandes(data);
      
      if (meta) {
        setPagination({
          currentPage: meta.current_page || 1,
          totalPages: meta.last_page || 1,
          totalItems: meta.total || 0,
        });
      }
      
      return { data, meta };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des commandes';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommandeById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await commandeService.getById(id);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement de la commande';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommande = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const newCommande = await commandeService.create(data);
      setCommandes(prev => [newCommande, ...prev]);
      toast.success('Commande créée avec succès');
      return newCommande;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la création de la commande';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCommandeStatus = useCallback(async (id: number, status: CommandeStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCommande = await commandeService.updateStatus(id, status);
      setCommandes(prev => 
        prev.map(commande => 
          commande.id === id ? updatedCommande : commande
        )
      );
      
      const statusLabels: Record<CommandeStatus, string> = {
        en_attente: 'en attente',
        confirmee: 'confirmée',
        en_cours: 'en cours',
        livree: 'livrée',
        annulee: 'annulée',
      };
      
      toast.success(`Commande ${statusLabels[status]} avec succès`);
      return updatedCommande;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour du statut';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelCommande = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const cancelledCommande = await commandeService.cancel(id);
      setCommandes(prev => 
        prev.map(commande => 
          commande.id === id ? cancelledCommande : commande
        )
      );
      toast.success('Commande annulée avec succès');
      return cancelledCommande;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'annulation de la commande';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignLivreur = useCallback(async (commandeId: number, livreurId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCommande = await commandeService.assignLivreur(commandeId, livreurId);
      setCommandes(prev => 
        prev.map(commande => 
          commande.id === commandeId ? updatedCommande : commande
        )
      );
      toast.success('Livreur assigné avec succès');
      return updatedCommande;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'assignation du livreur';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCommandesByStatus = useCallback(async (status: CommandeStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await commandeService.getAll({ status });
      const data = response.data || [];
      setCommandes(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || `Erreur lors du chargement des commandes ${status}`;
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCommandesByDateRange = useCallback(async (dateFrom: string, dateTo: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await commandeService.getAll({ date_from: dateFrom, date_to: dateTo });
      const data = response.data || [];
      setCommandes(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des commandes par date';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCommandes = useCallback(async (searchTerm: string, filters?: any) => {
    if (!searchTerm.trim() && !filters) {
      await fetchCommandes();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { search: searchTerm, ...filters };
      const response = await commandeService.getAll(params);
      const data = response.data || [];
      setCommandes(data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la recherche';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchCommandes]);

  return {
    commandes,
    loading,
    error,
    pagination,
    fetchCommandes,
    fetchCommandeById,
    createCommande,
    updateCommandeStatus,
    cancelCommande,
    assignLivreur,
    getCommandesByStatus,
    getCommandesByDateRange,
    searchCommandes,
    setCommandes,
    setLoading,
    setError,
    setPagination,
  };
};