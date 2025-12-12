import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  Building2, MapPin, Phone, Mail, Clock,
  Camera, Save, XCircle, CheckCircle
} from 'lucide-react';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const pharmacySchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  opening_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)'),
  closing_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

const PharmacySettings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string>('');

  // Récupérer les détails de la pharmacie
  const { data: pharmacy, isLoading } = useQuery({
    queryKey: ['pharmacy-details', user?.pharmacy?.id],
    queryFn: () => pharmacyService.getById(user!.pharmacy!.id),
    enabled: !!user?.pharmacy,
  });

  // Mutation pour mettre à jour la pharmacie
  const updateMutation = useMutation({
    mutationFn: (data: Partial<PharmacyFormData>) =>
      pharmacyService.update(pharmacy!.id, data),
    onSuccess: () => {
      toast.success('Pharmacie mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['pharmacy-details'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: pharmacy?.name || '',
      description: pharmacy?.description || '',
      address: pharmacy?.address || '',
      phone: pharmacy?.phone || '',
      email: pharmacy?.email || '',
      opening_time: pharmacy?.opening_time || '08:00',
      closing_time: pharmacy?.closing_time || '20:00',
      latitude: pharmacy?.latitude,
      longitude: pharmacy?.longitude,
    },
  });

  // Réinitialiser le formulaire quand la pharmacie est chargée
  React.useEffect(() => {
    if (pharmacy) {
      reset({
        name: pharmacy.name,
        description: pharmacy.description || '',
        address: pharmacy.address,
        phone: pharmacy.phone,
        email: pharmacy.email || '',
        opening_time: pharmacy.opening_time,
        closing_time: pharmacy.closing_time,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
      });
      if (pharmacy.logo) {
        setLogoPreview(pharmacy.logo);
      }
    }
  }, [pharmacy, reset]);

  const onSubmit = async (data: PharmacyFormData) => {
    updateMutation.mutate(data);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleActive = async () => {
    if (!pharmacy) return;
    
    try {
      await pharmacyService.toggleGarde(pharmacy.id);
      toast.success(`Pharmacie ${pharmacy.is_garde ? 'retirée de la garde' : 'mise en garde'}`);
      queryClient.invalidateQueries({ queryKey: ['pharmacy-details'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <Building2 className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-center text-lg font-bold text-yellow-800 mb-2">
            Aucune pharmacie associée
          </h3>
          <p className="text-center text-yellow-700">
            Vous devez créer une pharmacie pour accéder à ces paramètres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres de la Pharmacie</h1>
        <p className="text-gray-600">Gérez les informations de votre pharmacie</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations de base */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informations de la pharmacie
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la pharmacie *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...register('name')}
                      type="text"
                      disabled={!isEditing}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...register('phone')}
                      type="tel"
                      disabled={!isEditing}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...register('address')}
                      type="text"
                      disabled={!isEditing}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
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
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      disabled={!isEditing}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure d'ouverture *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        {...register('opening_time')}
                        type="time"
                        disabled={!isEditing}
                        className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                          isEditing 
                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      />
                    </div>
                    {errors.opening_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.opening_time.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de fermeture *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        {...register('closing_time')}
                        type="time"
                        disabled={!isEditing}
                        className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                          isEditing 
                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      />
                    </div>
                    {errors.closing_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.closing_time.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || updateMutation.isPending}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {isSubmitting || updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Logo et statuts */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Logo de la pharmacie
            </h3>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={pharmacy.name}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-blue-600" />
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={!isEditing}
                    />
                  </label>
                )}
              </div>
              
              {isEditing && (
                <p className="text-sm text-gray-500 text-center">
                  Cliquez sur l'icône pour changer le logo
                </p>
              )}
            </div>
          </div>

          {/* Statuts */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">Statuts</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {pharmacy.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span>Statut de la pharmacie</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pharmacy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pharmacy.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {pharmacy.is_garde ? (
                    <Clock className="h-5 w-5 text-red-600 mr-2" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  )}
                  <span>Pharmacie de garde</span>
                </div>
                <button
                  onClick={handleToggleActive}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pharmacy.is_garde 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {pharmacy.is_garde ? 'Enlever de la garde' : 'Mettre en garde'}
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500 space-y-2">
                <p>Propriétaire: {user?.name}</p>
                <p>Créée le: {new Date(pharmacy.created_at).toLocaleDateString()}</p>
                <p>Dernière modification: {new Date(pharmacy.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-4">Zone de danger</h3>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                Désactiver la pharmacie
              </button>
              <button className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 font-medium">
                Supprimer la pharmacie
              </button>
              <p className="text-xs text-red-600">
                Ces actions sont irréversibles. Soyez certain avant de continuer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacySettings;