// src/components/paiements/MobileMoneyPaiement.tsx
import React, { useState } from 'react';
import { Smartphone, QrCode, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Operateur } from '../../types/paiement.types';

interface MobileMoneyPaiementProps {
  commandeId: number;
  montant: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

const MobileMoneyPaiement: React.FC<MobileMoneyPaiementProps> = ({
  commandeId,
  montant,
  onSuccess,
  onCancel,
}) => {
  const [operateur, setOperateur] = useState<Operateur>('mtn');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'confirmation' | 'success'>('form');

  const operateurs = [
    { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500' },
    { id: 'moov', name: 'Moov Money', color: 'bg-orange-500' },
    { id: 'togocel', name: 'Togocel Cash', color: 'bg-green-500' },
    { id: 'flooz', name: 'Flooz', color: 'bg-purple-500' },
  ];

  const validatePhoneNumber = (phone: string): boolean => {
    const regex = /^(228)?[0-9]{8}$/;
    return regex.test(phone.replace(/\s+/g, ''));
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(numeroTelephone)) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    setStep('confirmation');
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Simuler le paiement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Générer un numéro de transaction fictif
      const transactionId = `MM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      toast.success('Paiement Mobile Money initié avec succès');
      setStep('success');
      
      // Simuler un délai avant de retourner le succès
      setTimeout(() => {
        onSuccess(transactionId);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors du paiement');
      console.error(error);
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Confirmez le paiement
          </h3>
          <p className="text-gray-600">
            Vous allez recevoir une demande de paiement sur votre téléphone
          </p>
        </div>

        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Montant</span>
              <span className="font-bold">{montant.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opérateur</span>
              <span className="font-medium capitalize">{operateur}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone</span>
              <span className="font-medium">{numeroTelephone}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-bold text-yellow-800 mb-2">Instructions</h4>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>1. Attendez la demande de paiement sur votre téléphone</li>
            <li>2. Entrez votre code secret Mobile Money</li>
            <li>3. Confirmez la transaction</li>
            <li>4. Gardez le numéro de transaction</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep('form')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Retour
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                En cours...
              </span>
            ) : (
              'Confirmer'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Paiement initié avec succès
          </h3>
          <p className="text-gray-600 mb-6">
            Votre paiement Mobile Money a été initié. Vérifiez votre téléphone pour compléter la transaction.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-medium text-gray-700">
              Numéro de transaction: <span className="font-mono">MM-{Date.now().toString().slice(-8)}</span>
            </p>
          </div>

          <button
            onClick={() => onSuccess('')}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
          <Smartphone className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Paiement Mobile Money
        </h3>
        <p className="text-gray-600">
          Payez rapidement et sécurisé avec votre mobile money
        </p>
      </div>

      {/* Sélection de l'opérateur */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sélectionnez votre opérateur
        </label>
        <div className="grid grid-cols-2 gap-3">
          {operateurs.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOperateur(op.id as Operateur)}
              className={`p-4 rounded-lg border-2 transition-all ${
                operateur === op.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${op.color}`}></div>
                <span className="font-medium">{op.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Numéro de téléphone */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone
        </label>
        <input
          type="tel"
          value={numeroTelephone}
          onChange={(e) => setNumeroTelephone(e.target.value)}
          placeholder="Ex: 90 12 34 56"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Entrez le numéro associé à votre compte Mobile Money
        </p>
      </div>

      {/* Détails du paiement */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Montant à payer</span>
          <span className="text-2xl font-bold text-gray-900">
            {montant.toLocaleString()} FCFA
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Numéro de commande</span>
          <span>#{commandeId}</span>
        </div>
      </div>

      {/* QR Code optionnel */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <QrCode className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Option QR Code</p>
            <p className="text-sm text-blue-600">
              Scan du QR Code disponible après confirmation
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={!numeroTelephone || isProcessing}
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Traitement...' : 'Payer maintenant'}
        </button>
      </div>

      {/* Sécurité */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Shield className="h-4 w-4 mr-2" />
          <span>Paiement 100% sécurisé avec {operateur.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyPaiement;