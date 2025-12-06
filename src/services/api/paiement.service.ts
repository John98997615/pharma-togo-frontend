// src/services/api/paiement.service.ts
import axiosClient from './axiosClient';
import { Paiement, PaiementMethode, Operateur } from '../../types/paiement.types';

export interface InitPaiementData {
    methode: PaiementMethode;
    operateur?: Operateur;
}

export const paiementService = {
    // POST /api/commandes/{commande}/paiement/initier
    initierPaiement: async (commandeId: number, data: InitPaiementData): Promise<Paiement> => {
        const response = await axiosClient.post(`/commandes/${commandeId}/paiement/initier`, data);
        return response.data.paiement;
    },

    // GET /api/paiements/{paiement}/statut
    verifierStatut: async (paiementId: number): Promise<Paiement> => {
        const response = await axiosClient.get(`/paiements/${paiementId}/statut`);
        return response.data.paiement;
    },

    // POST /api/paiements/{paiement}/confirmer-cash
    confirmerPaiementCash: async (paiementId: number): Promise<Paiement> => {
        const response = await axiosClient.post(`/paiements/${paiementId}/confirmer-cash`);
        return response.data.paiement;
    },

    getFlutterwaveCallback: async (params: any): Promise<any> => {
        const response = await axiosClient.get('/payment/flutterwave/callback', { params });
        return response.data;
    },

    handleFlutterwaveWebhook: async (data: any): Promise<any> => {
        const response = await axiosClient.post('/payment/flutterwave/webhook', data);
        return response.data;
    }
};