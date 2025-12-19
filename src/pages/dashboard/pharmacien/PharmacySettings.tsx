// src/pages/dashboard/pharmacien/PharmacySettings.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Camera,
  Save,
  XCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pharmacy } from '../../../types/pharmacy.types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);

  // Récupérer les détails de la pharmacie
  const {
    data: pharmacy,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pharmacy-details', user?.pharmacy?.id],
    queryFn: () => {
      if (!user?.pharmacy?.id) {
        throw new Error('Aucune pharmacie associée');
      }
      return pharmacyService.getById(user.pharmacy.id);
    },
    enabled: !!user?.pharmacy?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    getValues,
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
  });

  // Mutation pour mettre à jour la pharmacie
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!pharmacy?.id) throw new Error('Aucune pharmacie à mettre à jour');

      console.log('Updating pharmacy with data:', {
        id: pharmacy.id,
        entries: Array.from(data.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name}` : value
        }))
      });

      // Le service gère maintenant _method=PUT automatiquement
      return pharmacyService.update(pharmacy.id, data);
    },
    onSuccess: (updatedPharmacy) => {
      console.log('Pharmacy update successful:', updatedPharmacy);
      toast.success('✅ Pharmacie mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['pharmacy-details'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacien-pharmacy'] });
      setIsEditing(false);
      setLogoFile(null);
    },
    onError: (error: any) => {
      console.error('Update error details:', {
        error: error.message,
        response: error.response?.data
      });

      const errorMessage = error.message ||
        error.response?.data?.message ||
        'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    }
  });

  // Mutation pour désactiver la pharmacie
  const toggleActiveMutation = useMutation({
    mutationFn: () => {
      if (!pharmacy?.id) throw new Error('Aucune pharmacie à modifier');
      return pharmacyService.toggleActive(pharmacy.id);
    },
    onSuccess: (data) => {
      toast.success(`Pharmacie ${data.is_active ? 'réactivée' : 'désactivée'} avec succès`);
      queryClient.invalidateQueries({ queryKey: ['pharmacy-details'] });
      setShowDangerConfirm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  // Mutation pour basculer le statut de garde
  const toggleGardeMutation = useMutation({
    mutationFn: () => {
      if (!pharmacy?.id) throw new Error('Aucune pharmacie à modifier');
      return pharmacyService.toggleGarde(pharmacy.id);
    },
    onSuccess: (data) => {
      toast.success(
        data.is_garde
          ? '✅ Pharmacie mise en garde avec succès'
          : '✅ Pharmacie retirée de la garde'
      );
      queryClient.invalidateQueries({ queryKey: ['pharmacy-details'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  // Réinitialiser le formulaire quand la pharmacie est chargée
  useEffect(() => {
    if (pharmacy) {
      reset({
        name: pharmacy.name || '',
        description: pharmacy.description || '',
        address: pharmacy.address || '',
        phone: pharmacy.phone || '',
        email: pharmacy.email || '',
        opening_time: pharmacy.opening_time || '08:00',
        closing_time: pharmacy.closing_time || '20:00',
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
      });

      if (pharmacy.logo) {
        setLogoPreview(pharmacy.logo);
      }
    }
  }, [pharmacy, reset]);

  const onSubmit = async (data: PharmacyFormData) => {
    try {
      const formData = new FormData();

      // Ajouter tous les champs au FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Ajouter le logo si un fichier a été sélectionné
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      console.log('Submitting form with data:', {
        fields: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name}` : value
        }))
      });

      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');

    // Pour supprimer le logo existant, on peut envoyer une requête spéciale
    // ou laisser le backend gérer l'absence de fichier
  };

  const handleToggleActive = () => {
    if (!pharmacy) return;

    if (pharmacy.is_active) {
      // Demander confirmation avant de désactiver
      setShowDangerConfirm(true);
    } else {
      toggleActiveMutation.mutate();
    }
  };

  const handleToggleGarde = () => {
    toggleGardeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-center text-lg font-bold text-red-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-center text-red-700">
            {error instanceof Error ? error.message : 'Impossible de charger les informations de la pharmacie'}
          </p>
          <div className="text-center mt-4">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Réessayer
            </button>
          </div>
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
                onClick={() => {
                  if (isEditing) {
                    // Annuler les modifications
                    reset();
                    setLogoFile(null);
                    if (pharmacy.logo) {
                      setLogoPreview(pharmacy.logo);
                    }
                  }
                  setIsEditing(!isEditing);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={updateMutation.isPending}
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
                      disabled={!isEditing || updateMutation.isPending}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${isEditing
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'border-gray-200 bg-gray-50'
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Nom de votre pharmacie"
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
                      disabled={!isEditing || updateMutation.isPending}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${isEditing
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'border-gray-200 bg-gray-50'
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="+228 XX XXX XXX"
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
                    disabled={!isEditing || updateMutation.isPending}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg ${isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      : 'border-gray-200 bg-gray-50'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="Description de votre pharmacie..."
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
                      disabled={!isEditing || updateMutation.isPending}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${isEditing
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'border-gray-200 bg-gray-50'
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Adresse complète de la pharmacie"
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
                      disabled={!isEditing || updateMutation.isPending}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg ${isEditing
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'border-gray-200 bg-gray-50'
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="contact@pharmacie.tg"
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
                        disabled={!isEditing || updateMutation.isPending}
                        className={`pl-10 w-full px-3 py-2 border rounded-lg ${isEditing
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          : 'border-gray-200 bg-gray-50'
                          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
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
                        disabled={!isEditing || updateMutation.isPending}
                        className={`pl-10 w-full px-3 py-2 border rounded-lg ${isEditing
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          : 'border-gray-200 bg-gray-50'
                          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      />
                    </div>
                    {errors.closing_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.closing_time.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex space-x-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending || !isDirty}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                      setLogoFile(null);
                      if (pharmacy.logo) {
                        setLogoPreview(pharmacy.logo);
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    disabled={updateMutation.isPending}
                  >
                    Annuler
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
                    className="h-32 w-32 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-blue-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Building2 className="h-16 w-16 text-blue-600" />
                  </div>
                )}

                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex space-x-2">
                    <label className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <Camera className="h-5 w-5" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={updateMutation.isPending}
                      />
                    </label>

                    {logoPreview && (
                      <button
                        onClick={handleRemoveLogo}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        type="button"
                        disabled={updateMutation.isPending}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isEditing && (
                <p className="text-sm text-gray-500 text-center">
                  Formats acceptés: JPG, PNG, GIF (max 5MB)
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
                  <div>
                    <span>Statut de la pharmacie</span>
                    <p className="text-sm text-gray-500">
                      {pharmacy.is_active ? 'Visible aux clients' : 'Non visible'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleActive}
                  disabled={toggleActiveMutation.isPending}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${pharmacy.is_active
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                    } disabled:opacity-50`}
                >
                  {toggleActiveMutation.isPending ? '...' :
                    pharmacy.is_active ? 'Désactiver' : 'Activer'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {pharmacy.is_garde ? (
                    <Clock className="h-5 w-5 text-red-600 mr-2" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  )}
                  <div>
                    <span>Pharmacie de garde</span>
                    <p className="text-sm text-gray-500">
                      {pharmacy.is_garde ? 'Service de garde actif' : 'Service normal'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleGarde}
                  disabled={toggleGardeMutation.isPending}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${pharmacy.is_garde
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } disabled:opacity-50`}
                >
                  {toggleGardeMutation.isPending ? '...' :
                    pharmacy.is_garde ? 'Retirer de la garde' : 'Mettre en garde'}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500 space-y-2">
                <div className="flex justify-between">
                  <span>Propriétaire:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Créée le:</span>
                  <span>{new Date(pharmacy.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière modification:</span>
                  <span>{new Date(pharmacy.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID Pharmacie:</span>
                  <span className="font-mono">#{pharmacy.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-4">Zone de danger</h3>

            {showDangerConfirm ? (
              <div className="space-y-4">
                <p className="text-red-700 font-medium">
                  Êtes-vous sûr de vouloir désactiver votre pharmacie ?
                </p>
                <p className="text-sm text-red-600">
                  Votre pharmacie ne sera plus visible par les clients.
                  Vous pourrez la réactiver à tout moment.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => toggleActiveMutation.mutate()}
                    disabled={toggleActiveMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {toggleActiveMutation.isPending ? '...' : 'Oui, désactiver'}
                  </button>
                  <button
                    onClick={() => setShowDangerConfirm(false)}
                    className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowDangerConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Désactiver la pharmacie
                </button>
                <p className="text-xs text-red-600">
                  La désactivation rendra votre pharmacie invisible aux clients.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de succès */}
      {updateMutation.isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ✅ Mise à jour réussie
              </h3>
              <p className="text-gray-600 mb-6">
                Les modifications de votre pharmacie ont été enregistrées avec succès.
              </p>
              <button
                onClick={() => {
                  updateMutation.reset();
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacySettings;