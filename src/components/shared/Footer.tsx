// src/components/shared/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, MessagesSquare } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PT</span>
              </div>
              <span className="text-xl font-bold">PharmaTogo</span>
            </div>
            <p className="text-gray-400 text-sm">
              Votre plateforme de gestion de pharmacies au Togo.
              Commandez vos médicaments en ligne, trouvez les pharmacies de garde.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" className="text-gray-400 hover:text-white">
                  Pharmacies
                </Link>
              </li>
              <li>
                <Link to="/medicaments" className="text-gray-400 hover:text-white">
                  Médicaments
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white">
                  Recherche
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations de contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">+228 98 99 76 15</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">komivijohnayite99@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">Lomé, Togo</span>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/22898997615?text=Bonjour,%20j'ai%20une%20question%20sur%20PharmaTogo"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
                title="Contactez-nous sur WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} PharmaTogo. Tous droits réservés.</p>
          {/* <p className="mt-2">Projet de certification SIMPLON Togo</p> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;