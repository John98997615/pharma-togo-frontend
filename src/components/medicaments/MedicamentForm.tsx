// src/components/medicaments/MedicamentForm.tsx
import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Category } from '../../types/category.types';
import { categoryService } from '../../services/api/category.service';

const medicamentSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  category_id: z.number().min(1, 'Sélectionnez une catégorie'),
  form: z.string().min(1, 'La forme est requise'),
  dosage: z.string().min(1, 'Le dosage est requis'),
  requires_prescription: z.boolean().default(false),
  image: z.any().optional(),
  is_active: z.boolean().default(true),
});

type MedicamentFormData = z.infer<typeof medicamentSchema>;

interface MedicamentFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  initialData?: Partial<MedicamentFormData>;
  pharmacyId?: number;
}

const MedicamentForm: React.FC<MedicamentFormProps> = ({
  onSubmit,
  isLoading,
  error,
  initialData,
  pharmacyId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<MedicamentFormData>({
    resolver: zodResolver(medicamentSchema),
    defaultValues: {
      requires_prescription: false,
      is_active: true,
      quantity: 0,
      price: 0,
      ...initialData,
    },
  });

  const imageFile = watch('image');
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

  // Gérer la prévisualisation de l'image
  useEffect(() => {
  if (imageFile) {
    // Cas 1: C'est un FileList (nouvelle image uploadée)
    if (imageFile instanceof FileList && imageFile.length > 0) {
      const file = imageFile[0];
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    // Cas 2: C'est déjà une URL string (image existante)
    else if (typeof imageFile === 'string') {
      setImagePreview(imageFile);
    }
  }
}, [imageFile]);

  // Réinitialiser le formulaire avec les données initiales
  useEffect(() => {
  if (initialData) {
    reset(initialData);
    if (initialData.image) {
      // Si c'est une URL string
      if (typeof initialData.image === 'string') {
        setImagePreview(initialData.image);
      }
      // Si c'est un objet avec une propriété url
      else if (initialData.image.url) {
        setImagePreview(initialData.image.url);
      }
    }
  }
}, [initialData, reset]);

  const handleFormSubmit = async (data: MedicamentFormData) => {
    const formData = new FormData();
    
    // Ajouter les champs textuels
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('category_id', data.category_id.toString());
    formData.append('form', data.form || '');
    formData.append('dosage', data.dosage || '');
    formData.append('requires_prescription', data.requires_prescription ? '1' : '0');
    formData.append('is_active', data.is_active ? '1' : '0');
    
    // Ajouter l'image si elle existe
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }
    
    // Ajouter l'ID de la pharmacie si fourni
    if (pharmacyId) {
      formData.append('pharmacy_id', pharmacyId.toString());
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
          <div className="flex-shrink-0">
            <div className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Prévisualisation"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-4">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Aucune image sélectionnée
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Télécharger une image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Télécharger un fichier</span>
                    <input
                      {...register('image')}
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
          ) : initialData ? (
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