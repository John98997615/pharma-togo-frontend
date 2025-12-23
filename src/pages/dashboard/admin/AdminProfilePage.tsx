import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import ImageWithFallback from '../../../components/shared/ImageWithFallback';
import { User, Mail, Phone, MapPin, Camera, Lock, Save, X, Shield, Calendar, Check, Crown } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().regex(/^\+?[0-9\s\-()]+$/, 'Numéro de téléphone invalide'),
    address: z.string().min(5, 'Adresse requise (au moins 5 caractères)'),
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

const AdminProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isDirty },
        reset: resetProfile,
        watch,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
        },
    });

    // Réinitialiser le formulaire quand l'utilisateur change
    useEffect(() => {
        if (user && !isEditing) {
            resetProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            });
            setPhotoPreview(null);
            setPhotoFile(null);
        }
    }, [user, isEditing, resetProfile]);

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
            // Validation
            if (file.size > 5 * 1024 * 1024) {
                toast.error('L\'image est trop volumineuse (max 5MB)');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Veuillez sélectionner une image (JPG, PNG, etc.)');
                return;
            }

            setPhotoFile(file);

            // Créer une preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmitProfile = async (data: ProfileFormData) => {
        if (!user) {
            toast.error('Utilisateur non connecté');
            return;
        }

        setIsUpdating(true);
        setSuccessMessage(null);

        try {
            // Créer un FormData
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('address', data.address);

            if (photoFile) {
                formData.append('photo', photoFile);
            }

            // Utiliser updateProfile du contexte qui appelle authService
            const updatedUser = await updateProfile(formData);

            toast.success('✅ Profil mis à jour avec succès');
            setSuccessMessage('Vos modifications ont été enregistrées');

            // Réinitialiser
            setIsEditing(false);
            setPhotoFile(null);
            setPhotoPreview(null);

            // Réinitialiser le formulaire avec les nouvelles données
            resetProfile({
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone || '',
                address: updatedUser.address || '',
            });

        } catch (error: any) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setIsUpdating(false);
        }
    };

    const onSubmitPassword = async (data: PasswordFormData) => {
        if (!user) {
            toast.error('Utilisateur non connecté');
            return;
        }

        setIsUpdating(true);

        try {
            const formData = new FormData();
            formData.append('current_password', data.current_password);
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);

            await updateProfile(formData);

            toast.success('✅ Mot de passe changé avec succès');
            setIsChangingPassword(false);
            resetPassword();

        } catch (error: any) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setIsUpdating(false);
        }
    };

    const cancelEdit = () => {
        resetProfile({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
        });
        setIsEditing(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setSuccessMessage(null);
    };

    const cancelPasswordChange = () => {
        resetPassword();
        setIsChangingPassword(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Non disponible';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Date invalide';
        }
    };

    // Construire l'URL de la photo
    const getPhotoUrl = () => {
        if (photoPreview) return photoPreview;
        if (user?.photo) {
            // Si c'est une URL complète
            if (user.photo.startsWith('http')) {
                return user.photo;
            }
            // Si c'est un chemin relatif
            return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${user.photo}`;
        }
        return null;
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const photoUrl = getPhotoUrl();
    const watchedFields = watch();

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h1>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Photo et informations basiques */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    <ImageWithFallback
                                        src={photoUrl}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        fallbackIcon={
                                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                                <Crown className="h-20 w-20 text-purple-600" />
                                            </div>
                                        }
                                    />
                                </div>

                                {isEditing && (
                                    <label className="absolute bottom-2 right-2 bg-purple-600 text-white rounded-full p-3 cursor-pointer hover:bg-purple-700 transition-colors shadow-lg">
                                        <Camera className="h-5 w-5" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            disabled={isUpdating}
                                        />
                                    </label>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-center text-gray-900">{user.name}</h2>
                            <p className="text-gray-600 text-center mt-1">{user.email}</p>

                            <div className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium capitalize">
                                <div className="flex items-center">
                                    <Crown className="h-4 w-4 mr-2" />
                                    Administrateur
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-6 w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isUpdating}
                                >
                                    Modifier le profil
                                </button>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                                <Shield className="h-4 w-4 mr-2" />
                                Informations du compte
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Inscrit le</span>
                                    <span className="font-medium">{formatDate(user.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Dernière mise à jour</span>
                                    <span className="font-medium">{formatDate(user.updated_at)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Statut</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulaire principal */}
                <div className="lg:col-span-2 space-y-6">
                    {isEditing ? (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Modifier le profil</h3>
                                    <button
                                        onClick={cancelEdit}
                                        className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                                        disabled={isUpdating}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom complet
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    {...registerProfile('name')}
                                                    type="text"
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                            {profileErrors.name && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    {...registerProfile('email')}
                                                    type="email"
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                            {profileErrors.email && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Téléphone
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    {...registerProfile('phone')}
                                                    type="tel"
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                    placeholder="+228 XX XX XX XX"
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                            {profileErrors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Adresse
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <textarea
                                                    {...registerProfile('address')}
                                                    rows={3}
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                    placeholder="Rue, Ville, Togo"
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                            {profileErrors.address && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.address.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isUpdating}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating || (!isDirty && !photoFile)}
                                            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Enregistrer les modifications
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Informations personnelles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Nom complet</label>
                                        <p className="font-medium text-gray-900 text-lg">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Email</label>
                                        <p className="font-medium text-gray-900 text-lg">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Téléphone</label>
                                        <p className="font-medium text-gray-900 text-lg">{user.phone || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Adresse</label>
                                        <p className="font-medium text-gray-900 text-lg">{user.address || 'Non renseignée'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section mot de passe */}
                    {isChangingPassword ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Changer le mot de passe</h3>
                                <button
                                    onClick={cancelPasswordChange}
                                    className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                                    disabled={isUpdating}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe actuel
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            {...registerPassword('current_password')}
                                            type="password"
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            disabled={isUpdating}
                                        />
                                    </div>
                                    {passwordErrors.current_password && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            {...registerPassword('password')}
                                            type="password"
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            disabled={isUpdating}
                                        />
                                    </div>
                                    {passwordErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            {...registerPassword('password_confirmation')}
                                            type="password"
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            disabled={isUpdating}
                                        />
                                    </div>
                                    {passwordErrors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.password_confirmation.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={cancelPasswordChange}
                                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isUpdating}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? 'Changement en cours...' : 'Changer le mot de passe'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Sécurité du compte</h3>
                                    <p className="text-sm text-gray-600">Modifiez votre mot de passe pour renforcer la sécurité</p>
                                </div>
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-purple-600 hover:text-purple-800 font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isUpdating}
                                >
                                    <Lock className="h-5 w-5 mr-2" />
                                    Changer le mot de passe
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Résumé */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé du compte</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-purple-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Statut</p>
                                        <p className="text-sm text-gray-600">
                                            {user.is_active ? 'Compte actif' : 'Compte inactif'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Membre depuis</p>
                                        <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <Crown className="h-5 w-5 text-purple-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Rôle</p>
                                        <p className="text-sm text-gray-600">Administrateur</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
