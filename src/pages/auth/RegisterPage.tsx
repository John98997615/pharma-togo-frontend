// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import RegisterForm, { RegisterFormData } from '../../components/auth/RegisterForm';

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
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-blue-600 text-xl font-bold">PT</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            PharmaTogo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez la première plateforme de gestion des pharmacies au Togo
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Créer un compte</h3>
            <p className="mt-1 text-sm text-gray-600">
              Remplissez le formulaire pour créer votre compte
            </p>
          </div>
          
          <RegisterForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            error={error}
          />
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © {new Date().getFullYear()} PharmaTogo. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;