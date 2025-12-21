// src/services/api/commande.service.ts
import axiosClient from './axiosClient';
import { Commande, CommandeStatus } from '../../types/commande.types';

export interface CreateCommandeData {
    pharmacy_id: number;
    items: Array<{
        medicament_id: number;
        quantity: number;
    }>;
    payment_method: 'cash' | 'mobile_money' | 'carte';
    delivery_address: string;
    delivery_phone: string;
    notes?: string;
}

export interface CommandeParams {
    status?: CommandeStatus;
    pharmacy_id?: number;
    user_id?: number;
    livreur_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
    search?: string;
}

export const commandeService = {
    //  GET /api/commandes
    getAll: async (params?: CommandeParams): Promise<{ data: Commande[]; meta: any }> => {
        const response = await axiosClient.get('/commandes', { params });
        return response.data;
    },

    // POST /api/commandes
    create: async (data: CreateCommandeData): Promise<Commande> => {
        const response = await axiosClient.post('/commandes', data);
        return response.data.commande || response.data;
    },

    // GET /api/commandes/{commande}
    getById: async (id: number): Promise<Commande> => {
        const response = await axiosClient.get(`/commandes/${id}`, {
            params: {
                with: 'user,pharmacy,items'
            },
        });
        return response.data;
    },

    // PUT /api/commandes/{commande}/status
    updateStatus: async (id: number, status: CommandeStatus): Promise<Commande> => {
        const response = await axiosClient.put(`/commandes/${id}/status`, { status });
        return response.data.commande || response.data;
    },

    // PATCH /api/commandes/{commande}/cancel
    cancel: async (id: number): Promise<Commande> => {
        const response = await axiosClient.patch(`/commandes/${id}/cancel`);
        return response.data.commande || response.data;
    },

    assignLivreur: async (commandeId: number, livreurId: number): Promise<Commande> => {
        const response = await axiosClient.post(`/commandes/${commandeId}/assign-livreur`, { livreur_id: livreurId });
        return response.data;
    }
};