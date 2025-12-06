// src/pages/auth/ForgotPasswordPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Shield } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de réinitialisation de mot de passe
    alert('Un email de réinitialisation a été envoyé (simulé)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Carte */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Réinitialiser le mot de passe</h2>
            <p className="text-blue-100 mt-2">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>
          
          {/* Formulaire */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Envoyer le lien de réinitialisation
              </button>
            </form>

            {/* Retour à la connexion */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez le support.</p>
          <p className="mt-2">© {new Date().getFullYear()} PharmaTogo. Projet de certification SIMPLON Togo.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;