// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import RegisterForm, { RegisterFormData } from '../../components/auth/RegisterForm';
import { Pill, Shield } from 'lucide-react';

// Définir le type pour les données avec photo
interface RegisterDataWithPhoto extends RegisterFormData {
  photo?: File | null;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: RegisterDataWithPhoto) => {
    try {
      setError('');

      // Pas besoin de convertir, la photo est déjà un File | null
      await register(data);

      toast.success('Inscription réussie ! Bienvenue sur PharmaTogo');

      // Redirection basée sur le rôle
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);

        switch (user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'pharmacien':
            navigate('/pharmacien/dashboard');
            break;
          case 'client':
            navigate('/client/dashboard');
            break;
          case 'livreur':
            navigate('/livreur/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full"> {/* Même largeur que la page de connexion */}
        {/* Carte d'inscription */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">

            {/* Lien sur l'icône */}
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4 hover:bg-white/30 transition-colors">
                <Pill className="h-8 w-8" />
              </div>
            </Link>

            {/* Lien sur le titre */}
            <Link to="/" className="hover:opacity-90 transition-opacity inline-block">
              <h2 className="text-2xl font-bold">Rejoindre PharmaTogo</h2>
            </Link>

            {/* Lien sur le slogan */}
            <Link to="/" className="hover:opacity-90 transition-opacity inline-block">
              <p className="text-blue-100 mt-2">Votre santé, notre priorité</p>
            </Link>

          </div>

          {/* Formulaire */}
          <div className="p-8">
            <div className="mb-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Créer un compte</h3>
              <p className="text-gray-600">
                Remplissez le formulaire pour créer votre compte et accéder à tous nos services
              </p>
            </div>

            {/* Message de sécurité */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Inscription sécurisée</p>
                  <p className="text-xs text-green-600 mt-1">
                    Toutes vos données sont chiffrées et protégées conformément au RGPD
                  </p>
                </div>
              </div>
            </div>

            <RegisterForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Déjà un compte ?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-700 flex items-center justify-center transition-colors"
                >
                  Se connecter à mon compte existant
                </Link>
              </div>
            </div>

            {/* Retour à l'accueil */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-xs text-gray-500 space-x-4">
            <span>© {new Date().getFullYear()} PharmaTogo</span>
            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
            <span>Tous droits réservés</span>
            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Plateforme de gestion communautaire des pharmacies locales au Togo
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;