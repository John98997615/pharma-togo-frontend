// src/pages/dashboard/client/ProfilePage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Lock, Save, X } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse requise'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Mot de passe actuel requis'),
  password: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      const updateData: any = { ...data };
      
      if (photoFile) {
        updateData.photo = photoFile;
      }
      
      await updateProfile(updateData);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      await updateProfile({
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success('Mot de passe changé avec succès');
      setIsChangingPassword(false);
      resetPassword();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const cancelEdit = () => {
    resetProfile();
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon Profil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Photo et informations basiques */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                {photoPreview || user.photo ? (
                  <img
                    src={photoPreview || user.photo}
                    alt="Photo de profil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="h-16 w-16 text-blue-600" />
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">{user.role}</p>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : Formulaire */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Modifier le profil</h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerProfile('name')}
                        type="text"
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerProfile('email')}
                        type="email"
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerProfile('phone')}
                        type="tel"
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerProfile('address')}
                        type="text"
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {profileErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.address.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">Informations personnelles</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Nom complet</label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Téléphone</label>
                  <p className="font-medium">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Adresse</label>
                  <p className="font-medium">{user.address || 'Non renseignée'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Rôle</label>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Section changement de mot de passe */}
          {isChangingPassword ? (
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Changer le mot de passe</h3>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerPassword('current_password')}
                      type="password"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerPassword('password')}
                      type="password"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  {passwordErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.password.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerPassword('password_confirmation')}
                      type="password"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  {passwordErrors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.password_confirmation.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Sécurité</h3>
                  <p className="text-sm text-gray-600">Gérer votre mot de passe</p>
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Changer le mot de passe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;