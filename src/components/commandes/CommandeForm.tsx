// src/components/commandes/CommandeForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search, Package, MapPin, Phone } from 'lucide-react';
import { Medicament } from '../../types/medicament.types';
import { Pharmacy } from '../../types/pharmacy.types';
import { medicamentService } from '../../services/api/medicament.service';
import { pharmacyService } from '../../services/api/pharmacy.service';

const commandeItemSchema = z.object({
  medicament_id: z.number().min(1, 'Sélectionnez un médicament'),
  quantity: z.number().min(1, 'Quantité minimum: 1').max(100, 'Quantité maximum: 100'),
});

const commandeSchema = z.object({
  pharmacy_id: z.number().min(1, 'Sélectionnez une pharmacie'),
  items: z.array(commandeItemSchema).min(1, 'Ajoutez au moins un produit'),
  payment_method: z.enum(['cash', 'mobile_money', 'carte']),
  delivery_address: z.string().min(5, 'Adresse de livraison requise'),
  delivery_phone: z.string().regex(/^\+?[0-9\s\-]+$/, 'Numéro de téléphone invalide'),
  notes: z.string().optional(),
});

type CommandeFormData = z.infer<typeof commandeSchema>;

interface CommandeFormProps {
  onSubmit: (data: CommandeFormData) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<CommandeFormData>;
}

const CommandeForm: React.FC<CommandeFormProps> = ({ onSubmit, isLoading, defaultValues }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CommandeFormData>({
    resolver: zodResolver(commandeSchema),
    defaultValues: {
      payment_method: 'cash',
      items: [{ medicament_id: 0, quantity: 1 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedPharmacy = watch('pharmacy_id');
  const items = watch('items');

  // Calcul du total
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const medicament = medicaments.find(m => m.id === item.medicament_id);
      if (medicament) {
        return total + (medicament.price * item.quantity);
      }
      return total;
    }, 0);
  };

  // Charger les pharmacies
  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        const data = await pharmacyService.getAll();
        setPharmacies(data);
      } catch (error) {
        console.error('Erreur lors du chargement des pharmacies:', error);
      }
    };
    loadPharmacies();
  }, []);

  // Charger les médicaments de la pharmacie sélectionnée
  useEffect(() => {
    const loadMedicaments = async () => {
      if (selectedPharmacy) {
        try {
          const data = await medicamentService.getAll({ 
            pharmacy_id: selectedPharmacy,
            available: true 
          });
          setMedicaments(data.data || []);
        } catch (error) {
          console.error('Erreur lors du chargement des médicaments:', error);
        }
      } else {
        setMedicaments([]);
      }
    };
    loadMedicaments();
  }, [selectedPharmacy]);

  const filteredMedicaments = medicaments.filter(medicament =>
    medicament.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    append({ medicament_id: 0, quantity: 1 });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sélection de la pharmacie */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4">1. Sélectionnez une pharmacie</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pharmacies.map((pharmacy) => (
            <label
              key={pharmacy.id}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                selectedPharmacy === pharmacy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                value={pharmacy.id}
                {...register('pharmacy_id')}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                {pharmacy.logo ? (
                  <img
                    src={pharmacy.logo}
                    alt={pharmacy.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold">{pharmacy.name}</p>
                  <p className="text-sm text-gray-600">{pharmacy.address}</p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pharmacy.is_garde
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pharmacy.is_garde ? '🚨 De garde' : 'Ouverte'}
                    </span>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.pharmacy_id && (
          <p className="mt-2 text-sm text-red-600">{errors.pharmacy_id.message}</p>
        )}
      </div>

      {/* Sélection des médicaments */}
      {selectedPharmacy && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">2. Sélectionnez vos médicaments</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un médicament
            </button>
          </div>

          {/* Recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Liste des médicaments */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médicament
                  </label>
                  <select
                    {...register(`items.${index}.medicament_id`)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={0}>Sélectionnez un médicament</option>
                    {filteredMedicaments.map((medicament) => (
                      <option key={medicament.id} value={medicament.id}>
                        {medicament.name} - {medicament.price.toLocaleString()} FCFA
                        {medicament.quantity < 10 && ` (Stock faible: ${medicament.quantity})`}
                      </option>
                    ))}
                  </select>
                  {errors.items?.[index]?.medicament_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.items[index]?.medicament_id?.message}
                    </p>
                  )}
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix unitaire
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {(() => {
                      const medicamentId = items[index]?.medicament_id;
                      const medicament = medicaments.find(m => m.id === medicamentId);
                      return medicament ? `${medicament.price.toLocaleString()} FCFA` : '-';
                    })()}
                  </p>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg font-bold">
                    {(() => {
                      const medicamentId = items[index]?.medicament_id;
                      const quantity = items[index]?.quantity || 0;
                      const medicament = medicaments.find(m => m.id === medicamentId);
                      return medicament ? `${(medicament.price * quantity).toLocaleString()} FCFA` : '-';
                    })()}
                  </p>
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {calculateTotal().toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations de livraison */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4">3. Informations de livraison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Adresse de livraison
            </label>
            <textarea
              {...register('delivery_address')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Votre adresse complète pour la livraison"
            />
            {errors.delivery_address && (
              <p className="mt-1 text-sm text-red-600">{errors.delivery_address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone pour la livraison
            </label>
            <input
              {...register('delivery_phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="+228 XX XX XX XX"
            />
            {errors.delivery_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.delivery_phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <select
              {...register('payment_method')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="cash">Paiement à la livraison (Cash)</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="carte">Carte bancaire</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Instructions spéciales, allergies, etc."
            />
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
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
          disabled={isLoading || !selectedPharmacy}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Traitement en cours...' : 'Passer la commande'}
        </button>
      </div>
    </form>
  );
};

export default CommandeForm;