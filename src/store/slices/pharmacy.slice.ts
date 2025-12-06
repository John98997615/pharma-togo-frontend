// src/store/slices/pharmacy.slice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Pharmacy } from '../../types/pharmacy.types';
import { pharmacyService } from '../../services/api/pharmacy.service';

interface PharmacyState {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const initialState: PharmacyState = {
  pharmacies: [],
  selectedPharmacy: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Thunks asynchrones
export const fetchPharmacies = createAsyncThunk(
  'pharmacies/fetchPharmacies',
  async (params?: any, { rejectWithValue }) => {
    try {
      const data = await pharmacyService.getAll(params);
      return { data, meta: { current_page: 1, last_page: 1, total: data.length } };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des pharmacies');
    }
  }
);

export const fetchPharmacyById = createAsyncThunk(
  'pharmacies/fetchPharmacyById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await pharmacyService.getById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement de la pharmacie');
    }
  }
);

export const createPharmacy = createAsyncThunk(
  'pharmacies/createPharmacy',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const newPharmacy = await pharmacyService.create(data);
      return newPharmacy;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création de la pharmacie');
    }
  }
);

export const updatePharmacy = createAsyncThunk(
  'pharmacies/updatePharmacy',
  async ({ id, data }: { id: number; data: FormData | Partial<Pharmacy> }, { rejectWithValue }) => {
    try {
      const updatedPharmacy = await pharmacyService.update(id, data);
      return updatedPharmacy;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour de la pharmacie');
    }
  }
);

export const toggleGarde = createAsyncThunk(
  'pharmacies/toggleGarde',
  async (id: number, { rejectWithValue }) => {
    try {
      const result = await pharmacyService.toggleGarde(id);
      return { id, is_garde: result.is_garde };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la modification du statut de garde');
    }
  }
);

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    setPharmacies: (state, action: PayloadAction<Pharmacy[]>) => {
      state.pharmacies = action.payload;
    },
    setSelectedPharmacy: (state, action: PayloadAction<Pharmacy | null>) => {
      state.selectedPharmacy = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addPharmacy: (state, action: PayloadAction<Pharmacy>) => {
      state.pharmacies.unshift(action.payload);
    },
    updatePharmacyInState: (state, action: PayloadAction<Pharmacy>) => {
      const index = state.pharmacies.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.pharmacies[index] = action.payload;
      }
      if (state.selectedPharmacy?.id === action.payload.id) {
        state.selectedPharmacy = action.payload;
      }
    },
    removePharmacy: (state, action: PayloadAction<number>) => {
      state.pharmacies = state.pharmacies.filter(p => p.id !== action.payload);
      if (state.selectedPharmacy?.id === action.payload) {
        state.selectedPharmacy = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPharmacies
      .addCase(fetchPharmacies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPharmacies.fulfilled, (state, action) => {
        state.loading = false;
        state.pharmacies = action.payload.data;
        state.pagination = {
          currentPage: action.payload.meta?.current_page || 1,
          totalPages: action.payload.meta?.last_page || 1,
          totalItems: action.payload.meta?.total || 0,
        };
      })
      .addCase(fetchPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchPharmacyById
      .addCase(fetchPharmacyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPharmacyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPharmacy = action.payload;
      })
      .addCase(fetchPharmacyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createPharmacy
      .addCase(createPharmacy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPharmacy.fulfilled, (state, action) => {
        state.loading = false;
        state.pharmacies.unshift(action.payload);
      })
      .addCase(createPharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updatePharmacy
      .addCase(updatePharmacy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePharmacy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pharmacies.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pharmacies[index] = action.payload;
        }
        if (state.selectedPharmacy?.id === action.payload.id) {
          state.selectedPharmacy = action.payload;
        }
      })
      .addCase(updatePharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // toggleGarde
      .addCase(toggleGarde.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleGarde.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pharmacies.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pharmacies[index].is_garde = action.payload.is_garde;
        }
        if (state.selectedPharmacy?.id === action.payload.id) {
          state.selectedPharmacy.is_garde = action.payload.is_garde;
        }
      })
      .addCase(toggleGarde.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPharmacies,
  setSelectedPharmacy,
  setLoading,
  setError,
  clearError,
  addPharmacy,
  updatePharmacyInState,
  removePharmacy,
} = pharmacySlice.actions;

export default pharmacySlice.reducer;