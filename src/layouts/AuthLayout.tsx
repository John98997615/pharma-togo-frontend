// src/layouts/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Pill } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">PharmaTogo</h1>
              <p className="text-sm text-gray-600">Votre santé, notre priorité</p>
            </div>
          </Link>
        </div>

        {/* Contenu */}
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} PharmaTogo. Projet de certification SIMPLON Togo.
          </p>
          <div className="mt-4 space-x-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Accueil
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;