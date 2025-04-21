import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService from '../../services/ApiService';

// Интерфейс для турнира
interface Tournament {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
  teamCount: number;
  image?: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TournamentState = {
  tournaments: [],
  currentTournament: null,
  isLoading: false,
  error: null,
};

// Асинхронные экшены
export const fetchTournaments = createAsyncThunk<Tournament[]>(
  'tournaments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.get<Tournament[]>('/tournaments');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки турниров');
    }
  }
);

export const fetchTournamentById = createAsyncThunk<Tournament, number>(
  'tournaments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ApiService.get<Tournament>(`/tournaments/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки турнира');
    }
  }
);

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    clearCurrentTournament: (state) => {
      state.currentTournament = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tournaments
      .addCase(fetchTournaments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action: PayloadAction<Tournament[]>) => {
        state.isLoading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch tournament by id
      .addCase(fetchTournamentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTournamentById.fulfilled, (state, action: PayloadAction<Tournament>) => {
        state.isLoading = false;
        state.currentTournament = action.payload;
      })
      .addCase(fetchTournamentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetError, clearCurrentTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer; 