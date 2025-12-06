// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await register(data);
      toast.success('Inscription réussie ! Bienvenue sur PharmaTogo');
      
      // Redirection selon le rôle
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'pharmacien':
          navigate('/pharmacien');
          break;
        case 'client':
          navigate('/client');
          break;
        case 'livreur':
          navigate('/livreur');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl w-full">
        {/* Carte */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Créer un compte PharmaTogo</h2>
            <p className="text-blue-100 mt-2">
              Rejoignez notre plateforme de santé au Togo
            </p>
          </div>
          
          {/* Contenu */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informations */}
              <div className="lg:col-span-1">
                <div className="bg-blue-50 rounded-xl p-6 h-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Pourquoi s'inscrire ?
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span className="text-gray-700">Accès à toutes les pharmacies</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span className="text-gray-700">Commandes en ligne rapides</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span className="text-gray-700">Livraison à domicile</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span className="text-gray-700">Suivi des commandes en temps réel</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span className="text-gray-700">Notifications importantes</span>
                    </li>
                  </ul>
                  
                  <div className="mt-8 pt-8 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                      Déjà un compte ?
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Connectez-vous ici →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="lg:col-span-2">
                <RegisterForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  error={error || undefined}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.</p>
          <p className="mt-2">© {new Date().getFullYear()} PharmaTogo. Projet de certification SIMPLON Togo.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;