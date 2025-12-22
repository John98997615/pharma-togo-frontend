// src/hooks/useMobileMoneyPaiement.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { paiementService, InitMobileMoneyData, ConfirmMobileMoneyData } from '../services/api/paiement.service';
import { Paiement, Operateur } from '../types/paiement.types';

interface UseMobileMoneyPaiementReturn {
    isProcessing: boolean;
    paiement: Paiement | null;
    error: string | null;
    step: 'form' | 'confirmation' | 'success' | 'polling';
    initierPaiement: (operateur: Operateur, numeroTelephone: string) => Promise<boolean>;
    confirmerPaiement: (codeSecret: string) => Promise<boolean>;
    annulerPaiement: () => Promise<void>;
    reset: () => void;
    // Pour le polling automatique
    startPolling: () => void;
    stopPolling: () => void;
}

export const useMobileMoneyPaiement = (commandeId: number): UseMobileMoneyPaiementReturn => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paiement, setPaiement] = useState<Paiement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'form' | 'confirmation' | 'success' | 'polling'>('form');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Nettoyage du polling lors du démontage
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    const validatePhoneNumber = useCallback((phone: string): boolean => {
        const regex = /^(228)?[0-9]{8}$/;
        return regex.test(phone.replace(/\s+/g, ''));
    }, []);

    const initierPaiement = useCallback(async (
        operateur: Operateur,
        numeroTelephone: string
    ): Promise<boolean> => {
        if (!validatePhoneNumber(numeroTelephone)) {
            setError('Numéro de téléphone invalide');
            return false;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Vérifier d'abord s'il existe déjà un paiement pour cette commande
            let existingPaiement = await paiementService.getPaiementByCommande(commandeId);

            // Si pas de paiement existant, en créer un
            if (!existingPaiement) {
                const initData: InitMobileMoneyData = {
                    methode: 'mobile_money',
                    operateur,
                    numero_telephone: numeroTelephone.replace(/\s+/g, '')
                };

                existingPaiement = await paiementService.initierPaiementMobileMoney(commandeId, initData);
            }

            setPaiement(existingPaiement);
            setStep('confirmation');
            toast.success('Paiement Mobile Money initié avec succès');
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'initiation du paiement';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Erreur initiation paiement mobile money:', err);
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [commandeId, validatePhoneNumber]);

    const confirmerPaiement = useCallback(async (codeSecret: string): Promise<boolean> => {
        if (!paiement) {
            setError('Aucun paiement en cours');
            return false;
        }

        if (!codeSecret.trim()) {
            setError('Le code secret est requis');
            return false;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const confirmData: ConfirmMobileMoneyData = { code_secret: codeSecret.trim() };
            const paiementConfirme = await paiementService.confirmerPaiementMobileMoney(
                paiement.id,
                confirmData
            );

            setPaiement(paiementConfirme);
            setStep('success');
            toast.success('Paiement Mobile Money confirmé avec succès');
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de la confirmation du paiement';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Erreur confirmation paiement mobile money:', err);
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [paiement]);

    const annulerPaiement = useCallback(async (): Promise<void> => {
        if (!paiement) return;

        setIsProcessing(true);
        setError(null);

        try {
            await paiementService.annulerPaiement(paiement.id);
            toast.success('Paiement annulé avec succès');
            reset();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'annulation du paiement';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Erreur annulation paiement mobile money:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [paiement]);

    const startPolling = useCallback(() => {
        if (!paiement || paiement.statut === 'paye' || paiement.statut === 'echec') {
            return;
        }

        setStep('polling');

        const interval = setInterval(async () => {
            try {
                const updatedPaiement = await paiementService.verifierStatut(paiement.id);
                setPaiement(updatedPaiement);

                if (updatedPaiement.statut === 'paye') {
                    toast.success('Paiement confirmé avec succès!');
                    setStep('success');
                    clearInterval(interval);
                    setPollingInterval(null);
                } else if (updatedPaiement.statut === 'echec') {
                    toast.error('Le paiement a échoué');
                    setStep('form');
                    clearInterval(interval);
                    setPollingInterval(null);
                }
            } catch (err: any) {
                console.error('Erreur lors du polling:', err);
                // Continue le polling même en cas d'erreur temporaire
            }
        }, 3000); // Polling toutes les 3 secondes

        setPollingInterval(interval);
    }, [paiement]);

    const stopPolling = useCallback(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
    }, [pollingInterval]);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setPaiement(null);
        setError(null);
        setStep('form');
        stopPolling();
    }, [stopPolling]);

    return {
        isProcessing,
        paiement,
        error,
        step,
        initierPaiement,
        confirmerPaiement,
        annulerPaiement,
        reset,
        startPolling,
        stopPolling
    };
};
