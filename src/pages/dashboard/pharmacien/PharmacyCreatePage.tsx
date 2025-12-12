// src/pages/dashboard/pharmacien/CreatePharmacyPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Store, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { pharmacyService } from '../../../services/api/pharmacy.service';

const pharmacySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  address: z.string().min(5, 'Adresse requise'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional(),
  opening_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)'),
  closing_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)'),
  is_garde: z.boolean().default(false),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

const CreatePharmacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      opening_time: '08:00',
      closing_time: '20:00',
      is_garde: false,
    },
  });

  const onSubmit = async (data: PharmacyFormData) => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      // Obtenir la position géographique si disponible
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            data.latitude = position.coords.latitude;
            data.longitude = position.coords.longitude;
            createPharmacy(data);
          },
          () => {
            // Si la géolocalisation échoue, créer sans coordonnées
            createPharmacy(data);
          }
        );
      } else {
        createPharmacy(data);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      createPharmacy(data);
    }
  };


  const createPharmacy = async (data: PharmacyFormData) => {
    try {
      // Convertir les données du formulaire en objet compatible avec le service
      const pharmacyData = {
        name: data.name,
        address: data.address,
        is_garde: data.is_garde,
        phone: data.phone,
        opening_time: data.opening_time,
        closing_time: data.closing_time,
        ...(data.email && { email: data.email }),
        ...(data.description && { description: data.description }),
        ...(data.latitude && { latitude: data.latitude }),
        ...(data.longitude && { longitude: data.longitude }),
      };

      const pharmacy = await pharmacyService.create(pharmacyData);
      toast.success('✅ Pharmacie créée avec succès !');

      // Mettre à jour l'utilisateur avec la nouvelle pharmacie
      localStorage.setItem('user', JSON.stringify({
        ...user,
        pharmacy: pharmacy
      }));

      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/pharmacien');
      }, 1000);
    } catch (error: any) {
      console.error('Error creating pharmacy:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la pharmacie');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/pharmacien')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Créer votre pharmacie</h1>
        <p className="text-gray-600 mt-2">
          Remplissez les informations de votre pharmacie pour commencer à l'utiliser
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          {/* Informations de base */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Store className="h-5 w-5 mr-2 text-blue-600" />
              Informations de la pharmacie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la pharmacie *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Pharmacie du Centre"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: +228 XX XX XX XX"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    {...register('address')}
                    rows={2}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Rue du Commerce, Lomé, Togo"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="pharmacie@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brève description de votre pharmacie..."
                />
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Horaires d'ouverture
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure d'ouverture *
                </label>
                <input
                  {...register('opening_time')}
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.opening_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.opening_time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fermeture *
                </label>
                <input
                  {...register('closing_time')}
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.closing_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.closing_time.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('is_garde')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 font-medium">
                Pharmacie de garde (ouverte 24h/24 pour les urgences)
              </span>
            </label>
            <p className="text-sm text-gray-500 ml-7 mt-1">
              Les pharmacies de garde apparaissent en priorité dans les recherches
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/pharmacien')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Création en cours...' : 'Créer la pharmacie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePharmacyPage;