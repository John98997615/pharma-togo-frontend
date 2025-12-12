// src/services/api/medicament.service.ts
import axiosClient from './axiosClient';
import { Medicament } from '../../types/medicament.types';

export interface MedicamentParams {
    search?: string;
    category_id?: number;
    pharmacy_id?: number;
    available?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    per_page?: number;
    min_price?: number;
    max_price?: number;
    requires_prescription?: boolean;
}

export const medicamentService = {


    // Récupérer la liste des médicaments avec des paramètres optionnels
    getAll: async (params?: MedicamentParams): Promise<{ data: Medicament[]; meta?: any }> => {
        try {
            const response = await axiosClient.get('/medicaments', { params });

            // Gérer différents formats de réponse API
            if (response.data && typeof response.data === 'object') {
                // Format { data: [...] }
                if ('data' in response.data) {
                    const data = (response.data as any).data;
                    if (Array.isArray(data)) {
                        return { data: data as Medicament[], meta: (response.data as any).meta };
                    }
                }

                // Format direct { [...] }
                if (Array.isArray(response.data)) {
                    return { data: response.data as Medicament[] };
                }
            }

            // Fallback: essayer de traiter la réponse comme un tableau
            if (Array.isArray(response.data)) {
                return { data: response.data as Medicament[] };
            }

            return { data: [] };
        } catch (error) {
            console.error('Error fetching medicaments:', error);
            return { data: [] };
        }
    },

    // Récupérer un médicament par son ID
    getById: async (id: number): Promise<Medicament> => {
        const response = await axiosClient.get(`/medicaments/${id}`);
        return response.data.data || response.data;
    },

    // Créer un nouveau médicament
    create: async (data: FormData): Promise<Medicament> => {
        const response = await axiosClient.post('/medicaments', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data || response.data;
    },

    // Mettre à jour un médicament existant
    update: async (id: number, data: FormData | Partial<Medicament>): Promise<Medicament> => {
        const isFormData = data instanceof FormData;
        const headers = isFormData
            ? { 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'application/json' };

        const response = await axiosClient.put(`/medicaments/${id}`, data, { headers });
        return response.data.medicament || response.data;
    },

    // Supprimer un médicament par son ID
    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/medicaments/${id}`);
    },

    // Ajuster le stock d'un médicament
    adjustStock: async (id: number, adjustment_value: number): Promise<Medicament> => {
        const response = await axiosClient.patch(`/medicaments/${id}/stock`, { adjustment_value });
        return response.data.data || response.data;
    }

    // GET /api/medicaments?search=...
    //   search: async (params: {
    //         name?: string;
    //         category?: string;
    //         min_price?: number;
    //         max_price?: number;
    //     }): Promise<{ data: Medicament[] }> => {
    //         const response = await axiosClient.get('/medicaments', { params });
    //         return response.data;
    //     }
};