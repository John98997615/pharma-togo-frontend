// src/store/slices/medicament.slice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Medicament } from '../../types/medicament.types';
import { medicamentService } from '../../services/api/medicament.service';

interface MedicamentState {
  medicaments: Medicament[];
  selectedMedicament: Medicament | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const initialState: MedicamentState = {
  medicaments: [],
  selectedMedicament: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Thunks asynchrones
export const fetchMedicaments = createAsyncThunk(
  'medicaments/fetchMedicaments',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await medicamentService.getAll(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des médicaments');
    }
  }
);

export const fetchMedicamentById = createAsyncThunk(
  'medicaments/fetchMedicamentById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await medicamentService.getById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du médicament');
    }
  }
);

export const createMedicament = createAsyncThunk(
  'medicaments/createMedicament',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const newMedicament = await medicamentService.create(data);
      return newMedicament;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création du médicament');
    }
  }
);

export const updateMedicament = createAsyncThunk(
  'medicaments/updateMedicament',
  async ({ id, data }: { id: number; data: FormData | Partial<Medicament> }, { rejectWithValue }) => {
    try {
      const updatedMedicament = await medicamentService.update(id, data);
      return updatedMedicament;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du médicament');
    }
  }
);

export const deleteMedicament = createAsyncThunk(
  'medicaments/deleteMedicament',
  async (id: number, { rejectWithValue }) => {
    try {
      await medicamentService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du médicament');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'medicaments/adjustStock',
  async ({ id, adjustment_value }: { id: number; adjustment_value: number }, { rejectWithValue }) => {
    try {
      const updatedMedicament = await medicamentService.adjustStock(id, adjustment_value);
      return updatedMedicament;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de l\'ajustement du stock');
    }
  }
);

const medicamentSlice = createSlice({
  name: 'medicament',
  initialState,
  reducers: {
    setMedicaments: (state, action: PayloadAction<Medicament[]>) => {
      state.medicaments = action.payload;
    },
    setSelectedMedicament: (state, action: PayloadAction<Medicament | null>) => {
      state.selectedMedicament = action.payload;
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
    addMedicament: (state, action: PayloadAction<Medicament>) => {
      state.medicaments.unshift(action.payload);
    },
    updateMedicamentInState: (state, action: PayloadAction<Medicament>) => {
      const index = state.medicaments.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.medicaments[index] = action.payload;
      }
      if (state.selectedMedicament?.id === action.payload.id) {
        state.selectedMedicament = action.payload;
      }
    },
    removeMedicament: (state, action: PayloadAction<number>) => {
      state.medicaments = state.medicaments.filter(m => m.id !== action.payload);
      if (state.selectedMedicament?.id === action.payload) {
        state.selectedMedicament = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMedicaments
      .addCase(fetchMedicaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicaments.fulfilled, (state, action) => {
        state.loading = false;
        state.medicaments = action.payload.data;
        state.pagination = {
          currentPage: action.payload.meta?.current_page || 1,
          totalPages: action.payload.meta?.last_page || 1,
          totalItems: action.payload.meta?.total || 0,
        };
      })
      .addCase(fetchMedicaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchMedicamentById
      .addCase(fetchMedicamentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicamentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMedicament = action.payload;
      })
      .addCase(fetchMedicamentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createMedicament
      .addCase(createMedicament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedicament.fulfilled, (state, action) => {
        state.loading = false;
        state.medicaments.unshift(action.payload);
      })
      .addCase(createMedicament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateMedicament
      .addCase(updateMedicament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicament.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.medicaments.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.medicaments[index] = action.payload;
        }
        if (state.selectedMedicament?.id === action.payload.id) {
          state.selectedMedicament = action.payload;
        }
      })
      .addCase(updateMedicament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // deleteMedicament
      .addCase(deleteMedicament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedicament.fulfilled, (state, action) => {
        state.loading = false;
        state.medicaments = state.medicaments.filter(m => m.id !== action.payload);
        if (state.selectedMedicament?.id === action.payload) {
          state.selectedMedicament = null;
        }
      })
      .addCase(deleteMedicament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // adjustStock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.medicaments.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.medicaments[index] = action.payload;
        }
        if (state.selectedMedicament?.id === action.payload.id) {
          state.selectedMedicament = action.payload;
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setMedicaments,
  setSelectedMedicament,
  setLoading,
  setError,
  clearError,
  addMedicament,
  updateMedicamentInState,
  removeMedicament,
} = medicamentSlice.actions;

export default medicamentSlice.reducer;