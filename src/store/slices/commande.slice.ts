// src/store/slices/commande.slice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Commande, CommandeStatus } from '../../types/commande.types';
import { commandeService } from '../../services/api/commande.service';

interface CommandeState {
  commandes: Commande[];
  selectedCommande: Commande | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const initialState: CommandeState = {
  commandes: [],
  selectedCommande: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

interface FetchCommandesParams {
  status?: string;
  pharmacy_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

// Thunks asynchrones
export const fetchCommandes = createAsyncThunk(
  'commandes/fetchCommandes',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await commandeService.getAll(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des commandes');
    }
  }
);

export const fetchCommandeById = createAsyncThunk(
  'commandes/fetchCommandeById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await commandeService.getById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement de la commande');
    }
  }
);

export const createCommande = createAsyncThunk(
  'commandes/createCommande',
  async (data: any, { rejectWithValue }) => {
    try {
      const newCommande = await commandeService.create(data);
      return newCommande;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création de la commande');
    }
  }
);

export const updateCommandeStatus = createAsyncThunk(
  'commandes/updateStatus',
  async ({ id, status }: { id: number; status: CommandeStatus }, { rejectWithValue }) => {
    try {
      const updatedCommande = await commandeService.updateStatus(id, status);
      return updatedCommande;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  }
);

const commandeSlice = createSlice({
  name: 'commande',
  initialState,
  reducers: {
    setCommandes: (state, action: PayloadAction<Commande[]>) => {
      state.commandes = action.payload;
    },
    setSelectedCommande: (state, action: PayloadAction<Commande | null>) => {
      state.selectedCommande = action.payload;
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
    addCommande: (state, action: PayloadAction<Commande>) => {
      state.commandes.unshift(action.payload);
    },
    updateCommande: (state, action: PayloadAction<Commande>) => {
      const index = state.commandes.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.commandes[index] = action.payload;
      }
      if (state.selectedCommande?.id === action.payload.id) {
        state.selectedCommande = action.payload;
      }
    },
    removeCommande: (state, action: PayloadAction<number>) => {
      state.commandes = state.commandes.filter(c => c.id !== action.payload);
      if (state.selectedCommande?.id === action.payload) {
        state.selectedCommande = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCommandes
      .addCase(fetchCommandes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommandes.fulfilled, (state, action) => {
        state.loading = false;
        state.commandes = action.payload.data;
        state.pagination = {
          currentPage: action.payload.meta?.current_page || 1,
          totalPages: action.payload.meta?.last_page || 1,
          totalItems: action.payload.meta?.total || 0,
        };
      })
      .addCase(fetchCommandes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchCommandeById
      .addCase(fetchCommandeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommandeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCommande = action.payload;
      })
      .addCase(fetchCommandeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createCommande
      .addCase(createCommande.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommande.fulfilled, (state, action) => {
        state.loading = false;
        state.commandes.unshift(action.payload);
      })
      .addCase(createCommande.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateCommandeStatus
      .addCase(updateCommandeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCommandeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.commandes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.commandes[index] = action.payload;
        }
        if (state.selectedCommande?.id === action.payload.id) {
          state.selectedCommande = action.payload;
        }
      })
      .addCase(updateCommandeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCommandes,
  setSelectedCommande,
  setLoading,
  setError,
  clearError,
  addCommande,
  updateCommande,
  removeCommande,
} = commandeSlice.actions;

export default commandeSlice.reducer;