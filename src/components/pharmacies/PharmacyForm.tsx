// src/components/pharmacies/PharmacyForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  FileText,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Navigation
} from 'lucide-react';

const pharmacySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  address: z.string().min(5, 'Adresse requise'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional(),
  logo: z.any().optional(),
  is_garde: z.union([z.boolean(), z.string()])
    .transform(val => val === true || val === 'true' || val === '1'),
  opening_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm requis'),
  closing_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm requis'),
  is_active: z.boolean().default(true),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

interface PharmacyFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  initialData?: Partial<PharmacyFormData>;
  isEdit?: boolean;
}

const PharmacyForm: React.FC<PharmacyFormProps> = ({
  onSubmit,
  isLoading,
  error,
  initialData,
  isEdit = false,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      is_garde: false,
      is_active: true,
      opening_time: '08:00',
      closing_time: '20:00',
      ...initialData,
    },
  });

  const logoFile = watch('logo');

  // Gérer la prévisualisation du logo
  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [logoFile]);

  // Réinitialiser le formulaire avec les données initiales
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.logo && typeof initialData.logo === 'string') {
        setLogoPreview(initialData.logo);
      }
    }
  }, [initialData, reset]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position');
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  };

  const handleFormSubmit = async (data: PharmacyFormData) => {
    const formData = new FormData();

    // Ajouter les champs textuels
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('address', data.address);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    formData.append('is_garde', data.is_garde ? 'true' : 'false');
    formData.append('opening_time', data.opening_time);
    formData.append('closing_time', data.closing_time);
    formData.append('is_active', data.is_active.toString());

    // Ajouter le logo si fourni
    if (data.logo && data.logo.length > 0) {
      formData.append('logo', data.logo[0]);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Informations de base */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Informations de la pharmacie
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la pharmacie *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="+228 XX XX XX XX"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optionnel)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="pharmacie@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('description')}
                rows={3}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Description de votre pharmacie, spécialités, services..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Localisation
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('address')}
                rows={2}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Rue, Quartier, Ville"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Ex: 6.1725"
              />
              {errors.latitude && (
                <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Ex: 1.2314"
              />
              {errors.longitude && (
                <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={useCurrentLocation}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {useCurrentLocation ? 'Position obtenue' : 'Utiliser ma position'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Les coordonnées GPS sont utilisées pour afficher votre pharmacie sur la carte et permettre aux clients de vous localiser.
            </p>
          </div>
        </div>
      </div>

      {/* Horaires */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Horaires d'ouverture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure d'ouverture *
            </label>
            <input
              {...register('opening_time')}
              type="time"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            {errors.closing_time && (
              <p className="mt-1 text-sm text-red-600">{errors.closing_time.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Logo de la pharmacie
        </h3>

        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
          {/* Prévisualisation */}
          <div className="flex-shrink-0">
            <div className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo prévisualisation"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-4">
                  <Building className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Aucun logo sélectionné
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Télécharger un logo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Télécharger un fichier</span>
                    <input
                      {...register('logo')}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6">Options</h3>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              {...register('is_garde')}
              type="checkbox"
              id="is_garde"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              // Convertir la valeur en boolean
              onChange={(e) => {
                const value = e.target.checked;
                setValue('is_garde', value, { shouldValidate: true });
              }}
            />
            <label htmlFor="is_garde" className="ml-2 block text-sm text-gray-700">
              Pharmacie de garde (ouverte 24h/24)
            </label>
          </div>

          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Pharmacie active (visible pour les clients)
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enregistrement...
            </span>
          ) : isEdit ? (
            'Mettre à jour'
          ) : (
            'Créer la pharmacie'
          )}
        </button>
      </div>
    </form>
  );
};

export default PharmacyForm;