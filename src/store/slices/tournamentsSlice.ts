import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ApiService } from '../../services/ApiService';

interface Tournament {
  id: string;
  name?: string;
  title?: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  status: 'registration' | 'in_progress' | 'completed';
  image_url?: string;
  sponsor_name?: string;
  sponsor_logo?: string;
  business_type?: string;
}

interface TournamentsState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  filters: {
    date: string;
    location: string;
    level: string;
  };
}

const initialState: TournamentsState = {
  tournaments: [],
  currentTournament: null,
  loading: false,
  error: null,
  filters: {
    date: '',
    location: '',
    level: '',
  },
};

export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchAll',
  async (filters: { date?: string; location?: string; level?: string } = {}, { rejectWithValue }) => {
    try {
      // Фильтруем пустые значения
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await ApiService.get('/tournaments', filteredParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить турниры.');
    }
  }
);

export const fetchTournamentById = createAsyncThunk(
  'tournaments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(`/tournaments/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить информацию о турнире.');
    }
  }
);

const tournamentsSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ date?: string; location?: string; level?: string }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Tournaments
    builder.addCase(fetchTournaments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTournaments.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      
      // Проверка и нормализация данных
      if (Array.isArray(action.payload)) {
        state.tournaments = action.payload.map((item: any) => ({
          id: item.id || '',
          name: item.name || item.title || 'Турнир без названия',
          title: item.title || item.name || 'Турнир без названия',
          date: item.date || new Date().toISOString(),
          location: item.location || 'Не указано',
          level: item.level || 'Любительский',
          prize_pool: item.prize_pool || 0,
          status: item.status || 'registration',
          image_url: item.image_url || null,
          sponsor_name: item.sponsor_name || '',
          sponsor_logo: item.sponsor_logo || '',
          business_type: item.business_type || ''
        }));
      }
    });
    builder.addCase(fetchTournaments.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Tournament By Id
    builder.addCase(fetchTournamentById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTournamentById.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.currentTournament = action.payload;
    });
    builder.addCase(fetchTournamentById.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
      state.currentTournament = null;
    });
  },
});

export const { setFilters, clearFilters, clearError } = tournamentsSlice.actions;
export default tournamentsSlice.reducer; 