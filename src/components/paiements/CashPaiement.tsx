// src/components/paiements/CashPaiement.tsx
import React, { useState } from 'react';
import { DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CashPaiementProps {
  commandeId: number;
  montant: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CashPaiement: React.FC<CashPaiementProps> = ({
  commandeId,
  montant,
  onSuccess,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [codeRecu, setCodeRecu] = useState('');

  const handleConfirm = async () => {
    if (!codeRecu.trim()) {
      toast.error('Veuillez entrer le code de reçu');
      return;
    }

    setIsProcessing(true);
    try {
      // Simuler la confirmation du paiement cash
      // En réalité, vous appelleriez paiementService.confirmerPaiementCash()
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Paiement cash confirmé avec succès');
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la confirmation du paiement');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Paiement Cash à la Livraison
        </h3>
        <p className="text-gray-600">
          Vous paierez directement au livreur lors de la réception de votre commande
        </p>
      </div>

      {/* Détails du paiement */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Numéro de commande</span>
            <span className="font-medium">#{commandeId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Montant à payer</span>
            <span className="text-2xl font-bold text-gray-900">
              {montant.toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Méthode de paiement</span>
            <span className="font-medium">Cash à la livraison</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-800 mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Instructions importantes
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Préparez le montant exact en espèces
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Vérifiez la commande avant de payer
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Demandez un reçu au livreur
          </li>
          <li className="flex items-start">
            <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Le paiement doit être effectué en FCFA
          </li>
        </ul>
      </div>

      {/* Code de reçu (pour le livreur) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code de reçu (pour le livreur)
        </label>
        <input
          type="text"
          value={codeRecu}
          onChange={(e) => setCodeRecu(e.target.value)}
          placeholder="Entrez le code du reçu"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Ce code vous sera remis par le livreur après paiement
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          disabled={isProcessing}
        >
          Annuler
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing || !codeRecu.trim()}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Confirmation...
            </span>
          ) : (
            'Confirmer le paiement'
          )}
        </button>
      </div>

      {/* Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          En confirmant, vous déclarez avoir reçu votre commande et effectué le paiement au livreur.
        </p>
      </div>
    </div>
  );
};

export default CashPaiement;