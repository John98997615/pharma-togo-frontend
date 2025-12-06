// src/components/paiements/PaiementForm.tsx
import React, { useState } from 'react';
import { CreditCard, Smartphone, DollarSign, Lock, Shield, AlertCircle } from 'lucide-react';
import { PaiementMethode } from '../../types/paiement.types';
import MobileMoneyPaiement from './MobileMoneyPaiement';
import CashPaiement from './CashPaiement';

interface PaiementFormProps {
  commandeId: number;
  montant: number;
  onSuccess: (methode: PaiementMethode, transactionId?: string) => void;
  onCancel: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({
  commandeId,
  montant,
  onSuccess,
  onCancel,
}) => {
  const [selectedMethode, setSelectedMethode] = useState<PaiementMethode | null>(null);

  const methodes = [
    {
      id: 'mobile_money',
      title: 'Mobile Money',
      description: 'Paiement rapide et sécurisé via votre téléphone',
      icon: Smartphone,
      color: 'bg-purple-100 text-purple-600',
      popular: true,
    },
    {
      id: 'cash',
      title: 'Cash à la livraison',
      description: 'Payez en espèces lors de la réception',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'carte',
      title: 'Carte bancaire',
      description: 'Paiement sécurisé par carte',
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-600',
      disabled: true,
      disabledMessage: 'Bientôt disponible',
    },
  ];

  const handleMethodeSelect = (methode: PaiementMethode) => {
    setSelectedMethode(methode);
  };

  const handleMobileMoneySuccess = (transactionId: string) => {
    onSuccess('mobile_money', transactionId);
  };

  const handleCashSuccess = () => {
    onSuccess('cash');
  };

  const renderPaiementForm = () => {
    switch (selectedMethode) {
      case 'mobile_money':
        return (
          <MobileMoneyPaiement
            commandeId={commandeId}
            montant={montant}
            onSuccess={handleMobileMoneySuccess}
            onCancel={() => setSelectedMethode(null)}
          />
        );
      case 'cash':
        return (
          <CashPaiement
            commandeId={commandeId}
            montant={montant}
            onSuccess={handleCashSuccess}
            onCancel={() => setSelectedMethode(null)}
          />
        );
      default:
        return null;
    }
  };

  if (selectedMethode) {
    return renderPaiementForm();
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Finalisez votre paiement
        </h2>
        <p className="text-gray-600">
          Sélectionnez votre méthode de paiement préférée
        </p>
      </div>

      {/* Montant */}
      <div className="mb-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Montant total à payer</p>
          <p className="text-4xl font-bold text-gray-900">
            {montant.toLocaleString()} FCFA
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Commande #{commandeId}
          </p>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="space-y-4 mb-8">
        {methodes.map((methode) => (
          <button
            key={methode.id}
            onClick={() => !methode.disabled && handleMethodeSelect(methode.id as PaiementMethode)}
            disabled={methode.disabled}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              methode.disabled
                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${methode.color}`}>
                  <methode.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{methode.title}</h3>
                    {methode.popular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Populaire
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{methode.description}</p>
                </div>
              </div>
              {methode.disabled ? (
                <span className="text-sm text-gray-500">{methode.disabledMessage}</span>
              ) : (
                <div className="text-blue-600 font-medium">
                  Sélectionner →
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Informations de sécurité */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Paiement sécurisé</h4>
            <p className="text-sm text-gray-600">
              Toutes vos transactions sont cryptées et sécurisées. Aucune information de paiement n'est stockée sur nos serveurs.
            </p>
          </div>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="p-4 bg-blue-50 rounded-lg mb-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Informations importantes</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Votre commande sera traitée après confirmation du paiement</li>
              <li>• Conservez votre numéro de transaction</li>
              <li>• Contactez-nous en cas de problème : contact@pharmatogo.tg</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Retour
        </button>
        <div className="text-center text-sm text-gray-500">
          En continuant, vous acceptez nos conditions d'utilisation
        </div>
      </div>
    </div>
  );
};

export default PaiementForm;