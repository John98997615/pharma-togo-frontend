// src/components/medicaments/MedicamentForm.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Package,
  Pill,
  DollarSign,
  Hash,
  FileText,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  X
} from 'lucide-react';
import { Category } from '../../types/category.types';
import { categoryService } from '../../services/api/category.service';

const medicamentSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  category_id: z.number().min(1, 'Sélectionnez une catégorie'),
  form: z.string().optional(),
  dosage: z.string().optional(),
  requires_prescription: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type MedicamentFormData = z.infer<typeof medicamentSchema>;

interface MedicamentFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  initialData?: any;
  pharmacyId?: number;
  isEditing?: boolean;
}

const MedicamentForm: React.FC<MedicamentFormProps> = ({
  onSubmit,
  isLoading,
  error,
  initialData,
  pharmacyId,
  isEditing = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<MedicamentFormData>({
    resolver: zodResolver(medicamentSchema),
    defaultValues: {
      requires_prescription: false,
      is_active: true,
      quantity: 0,
      price: 0,
    },
  });

  const requiresPrescription = watch('requires_prescription');

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };
    loadCategories();
  }, []);

  // Fonction pour formater l'URL de l'image
  const formatImageUrl = useCallback((imageUrl: any): string | null => {
    if (!imageUrl) return null;
    
    let url = imageUrl;
    
    // Si c'est un objet avec une propriété url
    if (typeof imageUrl === 'object' && imageUrl.url) {
      url = imageUrl.url;
    }
    
    // Si c'est une chaîne
    if (typeof url === 'string') {
      // Si c'est déjà une URL complète, la retourner telle quelle
      if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
      }
      
      // Sinon, construire l'URL complète
      const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
      
      // Vérifier si l'URL contient déjà 'storage/'
      if (url.includes('storage/')) {
        return `${baseUrl}/${url}`;
      }
      
      return `${baseUrl}/storage/${url}`;
    }
    
    return null;
  }, []);

  // Initialiser le formulaire avec les données existantes - UNE SEULE FOIS
  useEffect(() => {
    if (initialData && !hasInitialized) {
      console.log('Initializing form with data:', initialData);
      
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        quantity: initialData.quantity || 0,
        category_id: initialData.category_id || 0,
        form: initialData.form || '',
        dosage: initialData.dosage || '',
        requires_prescription: initialData.requires_prescription || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });

      // Gérer l'image existante
      if (initialData.image) {
        const formattedUrl = formatImageUrl(initialData.image);
        if (formattedUrl) {
          console.log('Setting image preview:', formattedUrl);
          setImagePreview(formattedUrl);
        }
      }
      
      setHasInitialized(true);
    } else if (!initialData && hasInitialized) {
      // Réinitialiser si on passe de l'édition à la création
      setHasInitialized(false);
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [initialData, reset, hasInitialized, formatImageUrl]);

  // Effet pour nettoyer l'URL de prévisualisation
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Nettoyer l'ancienne URL blob si elle existe
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImageFile(file);
      
      // Créer une URL de prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    // Nettoyer l'URL blob si elle existe
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Si on est en mode édition et on supprime l'image,
    // on peut vouloir supprimer l'image existante du serveur
    if (isEditing) {
      console.log('Image removed in edit mode');
    }
  };

  const handleFormSubmit = async (data: MedicamentFormData) => {
    try {
      const formData = new FormData();

      // Ajouter les champs textuels
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('quantity', data.quantity.toString());
      formData.append('category_id', data.category_id.toString());
      formData.append('form', data.form || '');
      formData.append('dosage', data.dosage || '');
      formData.append('requires_prescription', data.requires_prescription ? '1' : '0');
      formData.append('is_active', data.is_active ? '1' : '0');

      // Ajouter l'image si un nouveau fichier est sélectionné
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (isEditing && !imagePreview) {
        // Si on édite et qu'il n'y a pas d'image preview,
        // cela signifie qu'on a supprimé l'image existante
        formData.append('remove_image', 'true');
      }

      // Pour la modification, indiquer qu'on fait une mise à jour
      if (isEditing) {
        formData.append('_method', 'PUT');
      }

      // Ajouter l'ID de la pharmacie si fourni
      if (pharmacyId) {
        formData.append('pharmacy_id', pharmacyId.toString());
      }

      console.log('Submitting form data:');
      const entries = Array.from(formData.entries());
      for (const [key, value] of entries) {
        console.log(key, ':', value);
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
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
          <Pill className="h-5 w-5 mr-2" />
          Informations du médicament
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Nom du médicament *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Paracétamol 500mg"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              {...register('category_id', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Prix (FCFA) *
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              min="1"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline h-4 w-4 mr-1" />
              Quantité en stock *
            </label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forme galénique
            </label>
            <input
              {...register('form')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Comprimé, Sirop, Pommade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosage
            </label>
            <input
              {...register('dosage')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 500mg, 100ml"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description du médicament, indications, posologie..."
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Image du médicament
        </h3>

        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
          {/* Prévisualisation */}
          <div className="flex-shrink-0 relative">
            <div className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Prévisualisation"
                    className="h-full w-full object-cover"
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => {
                      console.error('Error loading image:', imagePreview);
                      (e.target as HTMLImageElement).src = '/placeholder-medicament.png';
                    }}
                    key={imagePreview} // Force le re-render quand l'image change
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-4">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    {isEditing ? 'Aucune image' : 'Aucune image sélectionnée'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEditing ? 'Changer l\'image' : 'Télécharger une image'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Télécharger un fichier</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
                {isEditing && !imageFile && (
                  <p className="text-xs text-blue-500">
                    Laisser vide pour conserver l'image actuelle
                  </p>
                )}
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
              {...register('requires_prescription')}
              type="checkbox"
              id="requires_prescription"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requires_prescription" className="ml-2 block text-sm text-gray-700">
              Requiert une ordonnance médicale
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
              Médicament actif (visible pour les clients)
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            // Nettoyer les URLs blob avant de fermer
            if (imagePreview && imagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(imagePreview);
            }
            window.history.back();
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enregistrement...
            </span>
          ) : isEditing ? (
            'Mettre à jour'
          ) : (
            'Créer le médicament'
          )}
        </button>
      </div>
    </form>
  );
};

export default MedicamentForm;