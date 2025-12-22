// src/services/api/paiement.service.ts
import axiosClient from './axiosClient';
import { Paiement, PaiementMethode, Operateur } from '../../types/paiement.types';

export interface InitPaiementData {
    methode: PaiementMethode;
    operateur?: Operateur;
}

export interface InitMobileMoneyData {
    methode: 'mobile_money';
    operateur: Operateur;
    numero_telephone: string;
}

export interface ConfirmCashData {
    code_recu: string;
}

export interface ConfirmMobileMoneyData {
    code_secret: string;
}

export const paiementService = {
    // POST /api/commandes/{commande}/paiement/initier
    initierPaiement: async (commandeId: number, data: InitPaiementData): Promise<Paiement> => {
        const response = await axiosClient.post(`/commandes/${commandeId}/paiement/initier`, data);
        return response.data.paiement;
    },

    // POST /api/commandes/{commande}/paiement/initier-mobile-money
    initierPaiementMobileMoney: async (commandeId: number, data: InitMobileMoneyData): Promise<Paiement> => {
        const response = await axiosClient.post(`/commandes/${commandeId}/paiement/initier-mobile-money`, data);
        return response.data.paiement;
    },

    // GET /api/paiements/{paiement}/statut
    verifierStatut: async (paiementId: number): Promise<Paiement> => {
        const response = await axiosClient.get(`/paiements/${paiementId}/statut`);
        return response.data.paiement;
    },

    // POST /api/paiements/{paiement}/confirmer-cash
    confirmerPaiementCash: async (paiementId: number, data: ConfirmCashData): Promise<Paiement> => {
        const response = await axiosClient.post(`/paiements/${paiementId}/confirmer-cash`, data);
        return response.data.paiement;
    },

    // POST /api/paiements/{paiement}/confirmer-mobile-money
    confirmerPaiementMobileMoney: async (paiementId: number, data: ConfirmMobileMoneyData): Promise<Paiement> => {
        const response = await axiosClient.post(`/paiements/${paiementId}/confirmer-mobile-money`, data);
        return response.data.paiement;
    },

    // POST /api/paiements/{paiement}/annuler
    annulerPaiement: async (paiementId: number): Promise<void> => {
        const response = await axiosClient.post(`/paiements/${paiementId}/annuler`);
        return response.data;
    },

    // GET /api/commandes/{commande}/paiement
    getPaiementByCommande: async (commandeId: number): Promise<Paiement> => {
        const response = await axiosClient.get(`/commandes/${commandeId}/paiement`);
        return response.data.paiement;
    },

    // Polling automatique pour vérifier le statut
    verifierStatutAvecPolling: async (
        paiementId: number,
        maxAttempts: number = 30,
        intervalMs: number = 2000
    ): Promise<Paiement> => {
        const verifierStatut = async (id: number): Promise<Paiement> => {
            const response = await axiosClient.get(`/paiements/${id}/statut`);
            return response.data.paiement;
        };

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const paiement = await verifierStatut(paiementId);

            if (paiement.statut === 'paye' || paiement.statut === 'echec') {
                return paiement;
            }

            // Attendre avant le prochain polling
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        throw new Error('Timeout: Le statut du paiement n\'a pas pu être vérifié');
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
