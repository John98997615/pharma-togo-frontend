// src/pages/auth/LoginPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Pill } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = (location.state as any)?.from?.pathname || '/';
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie !');
      
      // Redirection vers la page précédente ou dashboard selon le rôle
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let redirectPath = from;
      
      // Si l'utilisateur vient de la page d'accueil, rediriger vers son dashboard
      if (from === '/') {
        switch (user.role) {
          case 'admin':
            redirectPath = '/admin';
            break;
          case 'pharmacien':
            redirectPath = '/pharmacien';
            break;
          case 'client':
            redirectPath = '/client';
            break;
          case 'livreur':
            redirectPath = '/livreur';
            break;
          default:
            redirectPath = '/';
        }
      }
      
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email ou mot de passe incorrect';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
              <Pill className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Connexion à PharmaTogo</h2>
            <p className="text-blue-100 mt-2">Accédez à votre compte</p>
          </div>
          
          {/* Formulaire */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Adresse email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Mot de passe
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Votre mot de passe"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>
                
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Pas encore de compte ?</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <Link
                  to="/register"
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  Créer un compte PharmaTogo
                </Link>
              </div>
            </div>

            {/* Retour à l'accueil */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} PharmaTogo. Projet de gestion communautaire des pharmacies locales.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;