// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, MapPin, Lock, AlertCircle, Upload, Check, FileText, Shield } from 'lucide-react';

// Schéma de validation mis à jour avec acceptTerms
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide'),
  role: z.enum(['admin', 'pharmacien', 'client', 'livreur']),
  address: z.string().min(5, 'Adresse requise'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  password_confirmation: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions d'utilisation" }),
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData & { photo?: File | null }) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading, error }) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'client',
    },
  });

  const selectedRole = watch('role');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximum: 2MB');
        return;
      }

      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.');
        return;
      }

      setPhotoFile(file);

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleFormSubmit = async (data: RegisterFormData) => {
    const formData = {
      ...data,
      photo: photoFile
    };
    await onSubmit(formData);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    // Réinitialiser l'input file
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Prévisualisation de la photo */}
        {photoPreview && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={photoPreview}
                alt="Aperçu"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Photo sélectionnée</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom complet */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Nom complet *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone *
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+228 XX XX XX XX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Rôle */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rôle *
            </label>
            <select
              {...register('role')}
              id="role"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="client">Client</option>
              <option value="pharmacien">Pharmacien</option>
              <option value="livreur">Livreur</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Adresse (pleine largeur) */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Adresse *
            </label>
            <textarea
              {...register('address')}
              id="address"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre adresse complète"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Mot de passe *
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 caractères"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Confirmer le mot de passe *
            </label>
            <input
              {...register('password_confirmation')}
              type="password"
              id="password_confirmation"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Répétez le mot de passe"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
            )}
          </div>

          {/* Photo de profil */}
          <div className="md:col-span-2">
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
              Photo de profil (optionnel)
            </label>
            <div className="mt-1 flex items-center">
              <label
                htmlFor="photo"
                className="cursor-pointer flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Upload className="h-5 w-5 mr-2" />
                {photoFile ? `Photo sélectionnée: ${photoFile.name}` : 'Choisir une photo'}
              </label>
              <input
                type="file"
                id="photo"
                accept="image/jpeg,image/png,image/gif"
                onChange={handlePhotoChange}
                className="sr-only"
              />
              {photoFile && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="ml-3 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Formats acceptés: JPG, PNG, GIF. Taille max: 2MB
            </p>
          </div>
        </div>

        {/* Note sur les champs obligatoires */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Les champs marqués d'un * sont obligatoires.
              </p>
            </div>
          </div>
        </div>

        {/* Acceptation des conditions - NOUVEAU */}
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  Nous respectons votre vie privée et vos données sont protégées.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                {...register('acceptTerms')}
                id="acceptTerms"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                En vous inscrivant, vous acceptez nos{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                  conditions d'utilisation
                </button>{' '}
                et notre{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                  politique de confidentialité
                </button>.
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bouton d'inscription */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Inscription en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Check className="h-5 w-5 mr-2" />
              S'inscrire
            </span>
          )}
        </button>
      </form>

      {/* Modal Conditions d'utilisation */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Conditions d'utilisation</h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-blue max-w-none">
                <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                <h3>1. Acceptation des conditions</h3>
                <p>
                  En créant un compte sur PharmaTogo, vous acceptez d'être lié par les présentes conditions d'utilisation.
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>

                <h3>2. Description du service</h3>
                <p>
                  PharmaTogo est une plateforme numérique qui facilite la gestion et la recherche de médicaments
                  au sein des pharmacies locales togolaises. Le service permet :
                </p>
                <ul>
                  <li>La recherche de pharmacies et de médicaments</li>
                  <li>La gestion des stocks pour les pharmaciens</li>
                  <li>Les commandes en ligne pour les clients</li>
                  <li>Le suivi des livraisons</li>
                </ul>

                <h3>3. Compte utilisateur</h3>
                <p>
                  Vous êtes responsable de maintenir la confidentialité de votre compte et mot de passe.
                  Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.
                </p>

                <h3>4. Responsabilités</h3>
                <p>
                  PharmaTogo agit en tant que plateforme de mise en relation entre pharmaciens et clients.
                  Nous ne sommes pas responsables de la qualité des médicaments vendus par les pharmacies.
                </p>

                <h3>5. Modification des conditions</h3>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment.
                  Les modifications prendront effet dès leur publication sur la plateforme.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  J'ai lu et compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Politique de confidentialité */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Politique de confidentialité</h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-green max-w-none">
                <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                <h3>1. Données que nous collectons</h3>
                <p>
                  Nous collectons les informations que vous nous fournissez directement :
                </p>
                <ul>
                  <li>Informations d'identité (nom, prénom)</li>
                  <li>Coordonnées (email, téléphone, adresse)</li>
                  <li>Informations professionnelles (pour les pharmaciens)</li>
                  <li>Données de transaction (commandes, paiements)</li>
                </ul>

                <h3>2. Comment nous utilisons vos données</h3>
                <p>Vos données sont utilisées pour :</p>
                <ul>
                  <li>Fournir et améliorer nos services</li>
                  <li>Gérer votre compte utilisateur</li>
                  <li>Traiter vos commandes et paiements</li>
                  <li>Vous envoyer des notifications importantes</li>
                  <li>Assurer la sécurité de la plateforme</li>
                </ul>

                <h3>3. Partage des données</h3>
                <p>
                  Nous ne vendons ni ne louons vos données personnelles à des tiers.
                  Vos données peuvent être partagées avec :
                </p>
                <ul>
                  <li>Les pharmacies concernées par vos commandes</li>
                  <li>Les livreurs pour la livraison</li>
                  <li>Les autorités légales si requis par la loi</li>
                </ul>

                <h3>4. Vos droits</h3>
                <p>Conformément au RGPD, vous avez le droit de :</p>
                <ul>
                  <li>Accéder à vos données personnelles</li>
                  <li>Rectifier vos données inexactes</li>
                  <li>Supprimer vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Limiter le traitement de vos données</li>
                </ul>

                <h3>5. Sécurité des données</h3>
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
                  pour protéger vos données contre tout accès non autorisé.
                </p>

                <h3>6. Conservation des données</h3>
                <p>
                  Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services
                  et respecter nos obligations légales.
                </p>

                <h3>7. Contact</h3>
                <p>
                  Pour toute question concernant cette politique de confidentialité ou l'exercice de vos droits,
                  contactez-nous à : privacy@pharmatogo.tg
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  J'ai lu et compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterForm;