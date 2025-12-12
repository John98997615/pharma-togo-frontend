// src/pages/public/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Truck, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import PharmacyList from '../../components/pharmacies/PharmacyList';
import MedicamentList from '../../components/medicaments/MedicamentList';
import PopularMedicaments from '../../components/medicaments/PopularMedicaments';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Recherche facile',
      description: 'Trouvez rapidement les médicaments dont vous avez besoin'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Sécurité garantie',
      description: 'Médicaments authentiques de pharmaciens certifiés'
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Livraison rapide',
      description: 'Livraison à domicile en moins de 24h'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: '24h/24',
      description: 'Pharmacies de garde disponibles à tout moment'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Votre santé, notre priorité
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Commandez vos médicaments en ligne et trouvez les pharmacies de garde au Togo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                Rechercher un médicament
              </Link>
              <Link
                to="/pharmacies"
                className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Voir les pharmacies
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir PharmaTogo ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md text-center"
              >
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pharmacies de garde */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Pharmacies de garde</h2>
            <Link
              to="/pharmacies?garde=true"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir toutes →
            </Link>
          </div>
          <PharmacyList />
        </div>
      </section>

      {/* Médicaments populaires */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Médicaments populaires</h2>
            <Link
              to="/medicaments"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir tous →
            </Link>
          </div>
          <PopularMedicaments limit={8} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Star className="h-12 w-12 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à simplifier votre santé ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers de personnes qui font confiance à PharmaTogo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;