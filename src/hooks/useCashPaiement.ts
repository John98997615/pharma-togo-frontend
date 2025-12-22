// src/hooks/useCashPaiement.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { paiementService, ConfirmCashData } from '../services/api/paiement.service';
import { Paiement } from '../types/paiement.types';

interface UseCashPaiementReturn {
    isProcessing: boolean;
    paiement: Paiement | null;
    error: string | null;
    confirmerPaiement: (codeRecu: string) => Promise<boolean>;
    annulerPaiement: () => Promise<void>;
    reset: () => void;
}

export const useCashPaiement = (commandeId: number): UseCashPaiementReturn => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paiement, setPaiement] = useState<Paiement | null>(null);
    const [error, setError] = useState<string | null>(null);

    const confirmerPaiement = useCallback(async (codeRecu: string): Promise<boolean> => {
        if (!codeRecu.trim()) {
            setError('Le code de reçu est requis');
            return false;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Vérifier d'abord s'il existe déjà un paiement pour cette commande
            let existingPaiement = await paiementService.getPaiementByCommande(commandeId);

            // Si pas de paiement existant, en créer un
            if (!existingPaiement) {
                existingPaiement = await paiementService.initierPaiement(commandeId, {
                    methode: 'cash'
                });
            }

            // Confirmer le paiement cash
            const confirmData: ConfirmCashData = { code_recu: codeRecu.trim() };
            const paiementConfirme = await paiementService.confirmerPaiementCash(
                existingPaiement.id,
                confirmData
            );

            setPaiement(paiementConfirme);

            if (paiementConfirme.statut === 'paye') {
                toast.success('Paiement cash confirmé avec succès');
                return true;
            } else {
                throw new Error('Le paiement n\'a pas pu être confirmé');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la confirmation du paiement';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Erreur confirmation paiement cash:', err);
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [commandeId]);

    const annulerPaiement = useCallback(async (): Promise<void> => {
        if (!paiement) return;

        setIsProcessing(true);
        setError(null);

        try {
            await paiementService.annulerPaiement(paiement.id);
            toast.success('Paiement annulé avec succès');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'annulation du paiement';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Erreur annulation paiement cash:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [paiement]);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setPaiement(null);
        setError(null);
    }, []);

    return {
        isProcessing,
        paiement,
        error,
        confirmerPaiement,
        annulerPaiement,
        reset
    };
};
